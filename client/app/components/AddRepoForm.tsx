import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';

const ADD_REPO = gql`
  mutation AddRepo($fullName: String!) {
    addRepository(fullName: $fullName) {
      id
      fullName
    }
  }
`;

function AddRepoForm() {
  const [fullName, setFullName] = useState('');
  const [addRepo, { loading }] = useMutation(ADD_REPO, {
    refetchQueries: ['GetRepositories'], // so it updates after adding
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    await addRepo({ variables: { fullName } });
    setFullName('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="owner/repo"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Track'}
      </button>
    </form>
  );
}

export default AddRepoForm;
