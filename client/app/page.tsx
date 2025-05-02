'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  GetRepositoriesResponse,
  MarkReleaseSeenResponse,
  MarkReleaseSeenVariables,
  RefreshAllResponse,
  RemoveRepositoryResponse,
  RemoveRepositoryVariables,
} from './types';
import Header from './components/Header';
import RepositoryList from './components/RepositoryList';
import ReleaseModal from './components/ReleaseModal';
import { useEffect, useState } from 'react';

const GET_REPOSITORIES = gql`
  query GetRepositories {
    repositories {
      id
      fullName
      description
      releases {
        id
        version
        publishedAt
        seen
        notes
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

const REMOVE_REPOSITORY = gql`
  mutation RemoveRepository($fullName: String!) {
    removeRepository(fullName: $fullName) {
      id
    }
  }
`;

export default function Home() {
  const { data: session, status } = useSession();
  const { data, loading, error } = useQuery<GetRepositoriesResponse>(GET_REPOSITORIES, {
    skip: !session,
  });
  const [markSeen] = useMutation<MarkReleaseSeenResponse, MarkReleaseSeenVariables>(
    MARK_RELEASE_SEEN,
  );
  const [refreshAll, { loading: refreshing }] = useMutation<RefreshAllResponse>(REFRESH_ALL, {
    refetchQueries: ['GetRepositories'],
  });
  const [removeRepo] = useMutation<RemoveRepositoryResponse, RemoveRepositoryVariables>(
    REMOVE_REPOSITORY,
    {
      refetchQueries: ['GetRepositories'],
    },
  );

  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [previousRepo, setPreviousRepo] = useState<string | null>(null);

  // Mark releases as seen when closing the modal
  useEffect(() => {
    if (previousRepo && previousRepo !== selectedRepo && data) {
      const repo = data.repositories.find((r) => r.id === previousRepo);
      if (repo && repo.releases[0] && !repo.releases[0].seen) {
        markSeen({ variables: { releaseId: repo.releases[0].id } });
      }
    }
    setPreviousRepo(selectedRepo);
  }, [selectedRepo, previousRepo, data, markSeen]);

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Welcome to Repo Tracker</h1>
          <p className="text-gray-600 mb-6">Sign in to track your repository releases</p>
          <button
            onClick={() => signIn('github')}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 flex items-center mx-auto"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Sign in with GitHub
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading repos: {error.message}</p>;
  if (!data) return null;

  const selectedRepository = data.repositories.find((r) => r.id === selectedRepo);

  return (
    <div className="lg:flex h-screen">
      <div className="lg:flex-1 lg:overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <Header onRefresh={() => refreshAll()} isRefreshing={refreshing} />
            <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-gray-700">
              Sign out
            </button>
          </div>
          <RepositoryList
            repositories={data.repositories}
            selectedRepo={selectedRepo}
            onSelectRepo={setSelectedRepo}
            onRemoveRepo={(fullName) => removeRepo({ variables: { fullName } })}
          />
        </div>
      </div>

      <ReleaseModal repository={selectedRepository || null} onClose={() => setSelectedRepo(null)} />
    </div>
  );
}
