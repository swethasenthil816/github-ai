/**
 * Parses a GitHub URL and extracts the owner and repository name.
 * Supports:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - git@github.com:owner/repo.git
 * - http://github.com/owner/repo
 * 
 * @param {string} url - The GitHub URL to parse
 * @returns {{owner: string, repo: string} | null} The owner and repo, or null if invalid
 */
export function parseGithubUrl(url) {
  if (!url || typeof url !== 'string') return null;
  
  // Clean URL: remove trailing slashes and spaces
  const cleanUrl = url.trim().replace(/\/+$/, '');
  
  // Matches:
  // 1. https://github.com/owner/repo(.git)
  // 2. git@github.com:owner/repo.git
  const httpsRegex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/i;
  const sshRegex = /^git@github\.com:([^\/]+)\/([^\/]+?)(?:\.git)?$/i;
  
  let match = cleanUrl.match(httpsRegex);
  if (!match) {
    match = cleanUrl.match(sshRegex);
  }
  
  if (match && match[1] && match[2]) {
    // If the repo part contains subpaths (e.g. repo/tree/master), we only want the repo name
    // The regex above will handle "owner/repo" correctly, but if it has subpaths it won't match.
    // That's good because we want to analyze the root of the repository.
    return {
      owner: match[1],
      repo: match[2]
    };
  }
  
  // Fallback check for URLs with extra paths like /tree/main, we can still try to extract the main repo parts
  try {
    const parsed = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
    if (parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com') {
      const paths = parsed.pathname.split('/').filter(Boolean);
      if (paths.length >= 2) {
        return {
          owner: paths[0],
          repo: paths[1].replace(/\.git$/i, '')
        };
      }
    }
  } catch (e) {
    // Invalid URL structure
  }
  
  return null;
}
