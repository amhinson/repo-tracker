'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
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
  const { data, loading, error } = useQuery<GetRepositoriesResponse>(GET_REPOSITORIES);
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading repos: {error.message}</p>;
  if (!data) return null;

  const selectedRepository = data.repositories.find((r) => r.id === selectedRepo);

  return (
    <div className="lg:flex h-screen">
      <div className="lg:flex-1 lg:overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4">
          <Header onRefresh={() => refreshAll()} isRefreshing={refreshing} />
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
