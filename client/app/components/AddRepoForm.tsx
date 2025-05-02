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
  const [addRepo, { loading }] = useMutation(ADD_REPO, {
    refetchQueries: ['GetRepositories'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    await addRepo({ variables: { fullName } });
    setFullName('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-0 max-w-md">
      <input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
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
  );
}

export default AddRepoForm;
