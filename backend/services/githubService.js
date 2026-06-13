import axios from 'axios';

/**
 * Service to interact with the GitHub REST API.
 */
class GithubService {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'AI-GitHub-Project-Explainer'
      }
    });

    // Configure token authorization if provided in env
    const token = process.env.GITHUB_TOKEN;
    if (token && token !== 'your_github_token_here_optional' && token.trim() !== '') {
      this.client.defaults.headers.common['Authorization'] = `token ${token.trim()}`;
    }
  }

  /**
   * Fetch repository metadata (name, description, default branch, stars, etc.)
   */
  async getRepoDetails(owner, repo) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}`);
      return response.data;
    } catch (error) {
      this._handleError('getRepoDetails', error);
    }
  }

  /**
   * Fetch languages used in the repository
   */
  async getLanguages(owner, repo) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/languages`);
      return response.data; // Key-value pairs: { "JavaScript": 12345, "HTML": 342 }
    } catch (error) {
      console.warn(`[GithubService] Failed to fetch languages: ${error.message}`);
      return {}; // Non-fatal, return empty languages object
    }
  }

  /**
   * Fetch the README content.
   * Uses raw media type to get content directly.
   */
  async getReadme(owner, repo, defaultBranch = 'main') {
    try {
      // First try to fetch raw readme using raw accept header or direct raw URL
      const response = await this.client.get(`/repos/${owner}/${repo}/readme`, {
        headers: {
          Accept: 'application/vnd.github.v3.raw'
        },
        responseType: 'text'
      });
      return response.data;
    } catch (error) {
      console.warn(`[GithubService] Failed to fetch README: ${error.message}`);
      return 'No README file found or accessible in this repository.';
    }
  }

  /**
   * Fetch the repository file tree.
   * Uses recursive tree API if default branch is provided.
   */
  async getFileTree(owner, repo, defaultBranch = 'main') {
    try {
      // Fetch recursive tree starting from the default branch
      const response = await this.client.get(`/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
      
      if (response.data && Array.isArray(response.data.tree)) {
        // Filter out lockfiles, build/dependency folders, images, and other clutter to save tokens
        const ignoredPatterns = [
          /^\.git\//,
          /node_modules\//,
          /dist\//,
          /build\//,
          /\.next\//,
          /out\//,
          /package-lock\.json$/,
          /yarn\.lock$/,
          /pnpm-lock\.yaml$/,
          /\.(png|jpe?g|gif|webp|svg|ico|pdf|zip|tar|gz|mp4|mp3|woff2?|eot|ttf)$/i
        ];

        return response.data.tree
          .filter(item => !ignoredPatterns.some(regex => regex.test(item.path)))
          .map(item => ({
            path: item.path,
            type: item.type, // 'blob' (file) or 'tree' (directory)
            size: item.size || 0
          }));
      }
      return [];
    } catch (error) {
      console.warn(`[GithubService] Failed to fetch recursive file tree: ${error.message}`);
      
      // Fallback: Fetch root contents if recursive tree fails
      try {
        const response = await this.client.get(`/repos/${owner}/${repo}/contents`);
        if (Array.isArray(response.data)) {
          return response.data.map(item => ({
            path: item.name,
            type: item.type === 'dir' ? 'tree' : 'blob',
            size: item.size || 0
          }));
        }
      } catch (innerError) {
        console.error(`[GithubService] Fallback contents fetch failed: ${innerError.message}`);
      }
      return [];
    }
  }

  /**
   * Consolidate repo data into a single object
   */
  async getRepositoryPayload(owner, repo) {
    const details = await this.getRepoDetails(owner, repo);
    const defaultBranch = details.default_branch || 'main';
    
    // Fetch languages, readme, and file tree in parallel
    const [languages, readme, fileTree] = await Promise.all([
      this.getLanguages(owner, repo),
      this.getReadme(owner, repo, defaultBranch),
      this.getFileTree(owner, repo, defaultBranch)
    ]);

    return {
      name: details.name,
      fullName: details.full_name,
      description: details.description || '',
      url: details.html_url,
      stars: details.stargazers_count,
      forks: details.forks_count,
      openIssues: details.open_issues_count,
      owner: details.owner.login,
      defaultBranch,
      languages,
      readme,
      fileTree
    };
  }

  _handleError(action, error) {
    let message = `Failed to ${action}`;
    let status = 500;

    if (error.response) {
      status = error.response.status;
      if (status === 404) {
        message = 'Repository not found. Please make sure the URL is correct and the repository is public.';
      } else if (status === 403 && error.response.headers['x-ratelimit-remaining'] === '0') {
        message = 'GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN to the backend environment variables.';
      } else {
        message = error.response.data.message || message;
      }
    } else if (error.request) {
      message = 'No response received from GitHub API. Please check your internet connection.';
    } else {
      message = error.message;
    }

    const customError = new Error(message);
    customError.status = status;
    throw customError;
  }
}

export default new GithubService();
