import OpenAI from 'openai';

/**
 * Service to handle OpenAI interactions.
 */
class OpenaiService {
  constructor() {
    this.openai = null;
  }

  _initClient() {
    if (this.openai) return;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here' || apiKey.trim() === '') {
      throw new Error('OpenAI API Key is missing. Please configure OPENAI_API_KEY in the .env file.');
    }

    const config = {
      apiKey: apiKey.trim()
    };

    // If using OpenRouter
    if (apiKey.trim().startsWith('sk-or-')) {
      config.baseURL = 'https://openrouter.ai/api/v1';
      config.defaultHeaders = {
        'HTTP-Referer': 'https://github.com/sweth/github-ai',
        'X-Title': 'AI GitHub Project Explainer'
      };
    }

    this.openai = new OpenAI(config);
  }

  /**
   * Generates a structured JSON analysis of the repository.
   * 
   * @param {Object} repoPayload - The repository data fetched from GitHub
   * @returns {Promise<Object>} The parsed JSON explanation of the repository
   */
  async analyzeRepository(repoPayload) {
    this._initClient();

    const apiKey = process.env.OPENAI_API_KEY || '';
    const isLinkToOpenRouter = apiKey.trim().startsWith('sk-or-');
    const model = isLinkToOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini';

    // Prepare languages and format them
    const languages = Object.keys(repoPayload.languages).join(', ') || 'Not specified';
    
    // Prepare directory structures
    const filePaths = repoPayload.fileTree.map(f => f.path);
    const directoryTreeSnippet = filePaths.slice(0, 150).join('\n'); // limit size to save tokens
    const fileTreeSummary = filePaths.length > 150 
      ? `${directoryTreeSnippet}\n... [and ${filePaths.length - 150} more files/folders]`
      : directoryTreeSnippet;

    // Truncate README content if it is too long
    const rawReadme = repoPayload.readme || '';
    const readmeSnippet = rawReadme.length > 6000 
      ? `${rawReadme.substring(0, 6000)}\n... [README truncated for size]`
      : rawReadme;

    const systemPrompt = `You are a senior software architect. 
Analyze the provided GitHub repository details, language breakdown, README contents, and directory file tree to explain the project.

Return a JSON object only. Do not wrap the JSON output in markdown block wrappers or add any other text outside the JSON object.

The output JSON structure MUST match this scheme:
{
  "projectSummary": "Brief sentence summarizing what the project is.",
  "purpose": "A descriptive explanation of the project's core purpose.",
  "targetUsers": "Explanation of who this project is designed for and who can use it.",
  "problemSolved": "Explanation of the real-world problem this project solves.",
  "detectedTechBadges": ["React", "Node.js", "Express", "MongoDB", "TypeScript", etc. (list the top technical stacks, libraries, tools, and databases detected)],
  "architectureExplanation": "High-level overview of the architectural pattern used (e.g. MVC, microservices, component-based, layered architecture) based on the file paths and README.",
  "folderStructureExplanation": "Explanation of the top-level folders (e.g. what resides in src/, controllers/, components/, etc.).",
  "importantFiles": [
    { "name": "package.json", "explanation": "Detailed explanation of what this file configures or does in this repo." },
    { "name": "app.js", "explanation": "Detailed explanation of the main entry point or server config." }
  ],
  "beginnerFriendly": "A simplified, non-technical explanation of the project suitable for a beginner (e.g., 'This project works like a digital notebook where users can save tasks.')",
  "resumeBullets": [
    "Bullet point 1 detailing a key technical achievement or implementation.",
    "Bullet point 2 detailing the integration of APIs or tools.",
    "Bullet point 3 detailing modular design or architectural decisions."
  ],
  "interviewQuestions": {
    "technical": [
      "Technical Question 1 based on the tech stack and codebase",
      "Technical Question 2 based on the tech stack and codebase"
    ],
    "architecture": [
      "Architecture Question 1 based on design pattern or scalability",
      "Architecture Question 2 based on design pattern or scalability"
    ]
  },
  "improvements": {
    "performance": ["Performance improvement suggestion 1", "Performance improvement suggestion 2"],
    "security": ["Security improvement suggestion 1", "Security improvement suggestion 2"],
    "scalability": ["Scalability improvement suggestion 1", "Scalability improvement suggestion 2"]
  },
  "scores": {
    "codeQuality": 8,
    "readability": 9,
    "documentation": 7,
    "scalability": 6,
    "maintainability": 8
  }
}

Important:
- Provide 10 technical questions and 5 architecture questions in the 'interviewQuestions' arrays.
- Provide exactly 3 high-quality, professional resume bullet points in 'resumeBullets'.
- Provide exactly 5 scores out of 10 in 'scores' for: codeQuality, readability, documentation, scalability, maintainability.
- In 'importantFiles', identify 4-6 of the most critical files in this repository (e.g. server.js, app.js, config files, package.json, primary route files, or primary components) and explain their purpose in 1-2 sentences.`;

    const userPrompt = `Here is the GitHub repository information for "${repoPayload.fullName}":
Repository URL: ${repoPayload.url}
Description: ${repoPayload.description}
Stars: ${repoPayload.stars} | Forks: ${repoPayload.forks} | Open Issues: ${repoPayload.openIssues}
Primary Languages: ${languages}

README Snippet:
=== START README ===
${readmeSnippet}
=== END README ===

Repository File Tree:
=== START FILE TREE ===
${fileTreeSummary}
=== END FILE TREE ===
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      });

      const responseText = response.choices[0].message.content;
      
      // Clean markdown code blocks if present (e.g. ```json ... ```)
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText
          .replace(/^```json\s*/i, '') // Remove starting ```json
          .replace(/^```\s*/, '')      // Remove starting ``` if no language
          .replace(/```$/, '')        // Remove ending ```
          .trim();
      }

      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('[OpenaiService] Error generating analysis:', error);
      throw new Error(`AI Analysis failed: ${error.message}`);
    }
  }
}

export default new OpenaiService();
