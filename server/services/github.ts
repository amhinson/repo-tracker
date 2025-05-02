import { Octokit } from '@octokit/rest';

const octokit = new Octokit();

export async function fetchRepoDetails(fullName: string) {
  const [owner, repo] = fullName.split('/');

  const { data: repoData } = await octokit.repos.get({ owner, repo });

  return {
    fullName: repoData.full_name,
    name: repoData.name,
    owner: repoData.owner.login,
    description: repoData.description,
  };
}

export async function fetchLatestRelease(fullName: string) {
  const [owner, repo] = fullName.split('/');

  try {
    const { data } = await octokit.repos.getLatestRelease({ owner, repo });

    return {
      version: data.tag_name,
      publishedAt: data.published_at ? new Date(data.published_at) : new Date(),
      notes: data.body ?? '',
    };
  } catch {
    // Repo may have no releases
    return null;
  }
}
