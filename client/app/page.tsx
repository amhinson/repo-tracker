'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import {
  GetRepositoriesResponse,
  MarkReleaseSeenResponse,
  MarkReleaseSeenVariables,
  RefreshAllResponse,
} from './types';
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

const MARK_RELEASE_SEEN = gql`
  mutation MarkReleaseSeen($releaseId: ID!) {
    markReleaseSeen(releaseId: $releaseId) {
      id
      seen
    }
  }
`;

const REFRESH_ALL = gql`
  mutation {
    refreshAllRepositories {
      id
      fullName
      releases {
        id
        version
        seen
        publishedAt
      }
    }
  }
`;

export default function Home() {
  const { data, loading, error } = useQuery<GetRepositoriesResponse>(GET_REPOSITORIES);
  const [markSeen] = useMutation<MarkReleaseSeenResponse, MarkReleaseSeenVariables>(
    MARK_RELEASE_SEEN,
  );
  const [refreshAll, { loading: refreshing }] = useMutation<RefreshAllResponse>(REFRESH_ALL, {
    refetchQueries: ['GetRepositories'],
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading repos: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      <AddRepoForm />
      <h1>Tracked Repositories</h1>
      <button onClick={() => refreshAll()} disabled={refreshing}>
        {refreshing ? 'Refreshing...' : 'Refresh All'}
      </button>
      <ul>
        {data.repositories.map((repo) => (
          <li key={repo.id}>
            <h2>{repo.fullName}</h2>
            <p>{repo.description}</p>
            {repo.releases.map((release) => (
              <div key={release.id} style={{ color: release.seen ? 'gray' : 'green' }}>
                <strong>{release.version}</strong> –{' '}
                {new Date(parseInt(release.publishedAt)).toLocaleDateString()}
                {!release.seen && (
                  <button
                    onClick={() => markSeen({ variables: { releaseId: release.id } })}
                    style={{ marginLeft: '10px' }}
                  >
                    Mark as seen
                  </button>
                )}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
