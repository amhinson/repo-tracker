export interface Release {
  id: string;
  version: string;
  publishedAt: string;
  seen: boolean;
}

export interface Repository {
  id: string;
  fullName: string;
  description: string | null;
  releases: Release[];
}

export interface GetRepositoriesResponse {
  repositories: Repository[];
}

export interface MarkReleaseSeenResponse {
  markReleaseSeen: {
    id: string;
    seen: boolean;
  };
}

export interface MarkReleaseSeenVariables {
  releaseId: string;
}

export interface RefreshAllResponse {
  refreshAllRepositories: Repository[];
}
