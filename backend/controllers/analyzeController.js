import githubService from '../services/githubService.js';
import openaiService from '../services/openaiService.js';
import { parseGithubUrl } from '../utils/githubUrlParser.js';

/**
 * Orchestrates repository analysis:
 * 1. Validates the incoming URL.
 * 2. Fetches metadata from GitHub API.
 * 3. Sends structured metadata to OpenAI API.
 * 4. Responds with the final JSON assessment.
 */
export async function analyzeRepository(req, res) {
  const { githubUrl } = req.body;

  if (!githubUrl) {
    return res.status(400).json({
      success: false,
      error: 'GitHub URL is required.'
    });
  }

  // 1. Parse and validate GitHub URL
  const repoInfo = parseGithubUrl(githubUrl);
  if (!repoInfo) {
    return res.status(400).json({
      success: false,
      error: 'Invalid GitHub URL. Must be in format: https://github.com/owner/repo'
    });
  }

  const { owner, repo } = repoInfo;

  try {
    console.log(`[AnalyzeController] Starting analysis for ${owner}/${repo}...`);
    
    // 2. Fetch repository payload
    console.log(`[AnalyzeController] Fetching repository data from GitHub...`);
    const repoPayload = await githubService.getRepositoryPayload(owner, repo);
    
    // 3. Send payload to OpenAI
    console.log(`[AnalyzeController] Generating AI summary analysis...`);
    const aiAnalysis = await openaiService.analyzeRepository(repoPayload);
    
    // 4. Return combined metadata and AI response
    console.log(`[AnalyzeController] Analysis completed successfully for ${owner}/${repo}!`);
    return res.status(200).json({
      success: true,
      data: {
        repoInfo: {
          name: repoPayload.name,
          fullName: repoPayload.fullName,
          description: repoPayload.description,
          url: repoPayload.url,
          stars: repoPayload.stars,
          forks: repoPayload.forks,
          openIssues: repoPayload.openIssues,
          owner: repoPayload.owner,
          defaultBranch: repoPayload.defaultBranch,
          languages: repoPayload.languages
        },
        analysis: aiAnalysis
      }
    });

  } catch (error) {
    console.error(`[AnalyzeController] Error during analysis:`, error);
    
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'An unexpected error occurred during repository analysis.'
    });
  }
}
