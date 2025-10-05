import { ExistingIssue } from "./reminder_logic.ts";

export interface GitHubConfig {
  token: string;
  repo: string;
}

/**
 * Fetch existing issues from GitHub
 */
export async function fetchExistingIssues(
  config: GitHubConfig
): Promise<ExistingIssue[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.repo}/issues?state=all&labels=reminder,task`,
      {
        headers: {
          "Authorization": `token ${config.token}`,
          "Accept": "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch issues: ${response.status}`);
      return [];
    }

    const issues = await response.json();
    return issues.map((issue: any) => ({
      title: issue.title,
      state: issue.state as "open" | "closed",
    }));
  } catch (error) {
    console.error(`Error fetching issues: ${error}`);
    return [];
  }
}

/**
 * Get GitHub configuration from environment variables
 */
export function getGitHubConfig(): GitHubConfig | null {
  const token = Deno.env.get("GITHUB_TOKEN");
  const repo = Deno.env.get("GITHUB_REPOSITORY");

  if (!token || !repo) {
    return null;
  }

  return { token, repo };
}
