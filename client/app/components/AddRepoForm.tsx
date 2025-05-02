import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';

const ADD_REPO = gql`
  mutation AddRepo($fullName: String!) {
    addRepository(fullName: $fullName) {
      id
      fullName
      description
      releases {
        id
        version
        publishedAt
        seen
      }
    }
  }
`;

function AddRepoForm() {
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [addRepo, { loading }] = useMutation(ADD_REPO, {
    refetchQueries: ['GetRepositories'],
    onError: (error) => {
      if (error.message.includes('Not Found')) {
        setError('Repository not found. Please check the owner/repo name.');
      } else {
        setError('An error occurred while adding the repository.');
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setError(null);
    await addRepo({ variables: { fullName } });
    setFullName('');
  };

  return (
    <div className="flex flex-col gap-2 max-w-md">
      <form onSubmit={handleSubmit} className="flex gap-0">
        <input
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            setError(null);
          }}
          placeholder="owner/repo"
          className="flex-1 px-4 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

export default AddRepoForm;
