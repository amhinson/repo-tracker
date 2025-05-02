'use client';

import { gql, useQuery } from '@apollo/client';
import { GetRepositoriesResponse } from './types';
import AddRepoForm from './components/AddRepoForm';

const GET_REPOSITORIES = gql`
  query {
    repositories {
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

export default function Home() {
  const { data, loading, error } = useQuery<GetRepositoriesResponse>(GET_REPOSITORIES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading repos: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      <AddRepoForm />
      <h1>Tracked Repositories</h1>
      <ul>
        {data.repositories.map((repo) => (
          <li key={repo.id}>
            <h2>{repo.fullName}</h2>
            <p>{repo.description}</p>
            {repo.releases.map((release) => (
              <div key={release.id} style={{ color: release.seen ? 'gray' : 'green' }}>
                <strong>{release.version}</strong> –{' '}
                {new Date(release.publishedAt).toLocaleDateString()}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
