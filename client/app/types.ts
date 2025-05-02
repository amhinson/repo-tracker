export interface Release {
  id: string;
  version: string;
  publishedAt: string;
  seen: boolean;
  notes: string | null;
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
  markReleaseSeen: boolean;
}

export interface MarkReleaseSeenVariables {
  releaseId: string;
}

export interface RefreshAllResponse {
  refreshAllRepositories: Repository[];
}

export interface RemoveRepositoryResponse {
  removeRepository: {
    id: string;
  };
}

export interface RemoveRepositoryVariables {
  fullName: string;
}
