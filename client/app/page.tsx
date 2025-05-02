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
import AddRepoForm from './components/AddRepoForm';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

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

  // Mark releases as seen when unselecting a repo
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
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <AddRepoForm />
        <button
          onClick={() => refreshAll()}
          disabled={refreshing}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh All'}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Repository List */}
        <div className="w-1/3 border rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b">Repositories</h2>
          <ul className="divide-y">
            {data.repositories.map((repo) => {
              const latestRelease = repo.releases[0];
              return (
                <li
                  key={repo.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer relative ${
                    selectedRepo === repo.id ? 'bg-blue-50 border-2 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedRepo(repo.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{repo.fullName}</h3>
                      <p className="text-sm text-gray-600">{repo.description}</p>
                      {latestRelease && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">{latestRelease.version}</span>
                          <span className="text-gray-500 ml-2">
                            {new Date(parseInt(latestRelease.publishedAt)).toLocaleDateString()}
                          </span>
                          {!latestRelease.seen && (
                            <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded ml-2">
                              New!
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRepo({ variables: { fullName: repo.fullName } });
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Release Notes Panel */}
        <div className="w-2/3 border rounded-lg">
          {selectedRepository && selectedRepository.releases[0] ? (
            <div>
              <h2 className="text-xl font-semibold p-4 border-b flex items-baseline">
                <span>{selectedRepository.releases[0].version}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {new Date(
                    parseInt(selectedRepository.releases[0].publishedAt),
                  ).toLocaleDateString()}
                </span>
              </h2>
              <div className="p-4">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>
                    {selectedRepository.releases[0].notes || 'No release notes available.'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {selectedRepository
                ? 'No releases available for this repository'
                : 'Select a repository to view its latest release'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
