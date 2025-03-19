interface GitHubData {
  readmeContent: string;
  stars: number;
  latestVersion: string | null;
  websiteUrl: string | null;
  license: {
    name: string | null;
    url: string | null;
  };
}

/**
 * Fetches repository data from GitHub including README content, stars count, and latest version
 * @param githubUrl - The full GitHub repository URL
 * @returns Promise<GitHubData> Repository data including README, stars, and latest version
 */
export async function getGitHubData(githubUrl: string): Promise<GitHubData> {
  try {
    // Parse the GitHub URL to extract owner and repo
    const urlParts = githubUrl.replace("https://github.com/", "").split("/");
    const owner = urlParts[0];
    const repo = urlParts[1];

    // Fetch repository metadata using GitHub API
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          }),
        },
      }
    );

    if (!repoResponse.ok) {
      throw new Error("Failed to fetch repository metadata");
    }

    const repoData = await repoResponse.json();

    // Fetch latest release/tag
    const releaseResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          }),
        },
      }
    );

    let latestVersion = null;
    if (releaseResponse.ok) {
      const releaseData = await releaseResponse.json();
      latestVersion = releaseData.tag_name;
    }

    // Fetch README content
    const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
    const readmeResponse = await fetch(readmeUrl);

    let readmeContent;
    if (!readmeResponse.ok) {
      // Try fallback to master branch if main doesn't exist
      const fallbackUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`;
      const fallbackResponse = await fetch(fallbackUrl);

      if (!fallbackResponse.ok) {
        throw new Error("README not found in main or master branch");
      }

      readmeContent = await fallbackResponse.text();
    } else {
      readmeContent = await readmeResponse.text();
    }

    return {
      readmeContent,
      stars: repoData.stargazers_count,
      latestVersion,
      websiteUrl: repoData.homepage || null,
      license: {
        name: repoData.license?.name || null,
        url: repoData.license?.url || null,
      },
    };
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    throw error;
  }
}
