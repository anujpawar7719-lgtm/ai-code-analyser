import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

/**
 * Service to interact with GitHub API
 */
export const fetchRepoMetadata = async (owner, repo) => {
  try {
    const { data } = await octokit.repos.get({ owner, repo });
    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      language: data.language,
      topics: data.topics,
      license: data.license?.name || 'Unknown',
      url: data.html_url,
      defaultBranch: data.default_branch
    };
  } catch (error) {
    console.error('Error fetching repo metadata:', error.message);
    throw new Error(error.status === 404 ? 'Repository not found or private' : 'Failed to fetch repository metadata');
  }
};

/**
 * Fetches the full file tree recursively
 */
export const fetchRepoTree = async (owner, repo, branch) => {
  try {
    const { data } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: true
    });

    const excludedDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '__pycache__', 'vendor'];
    const includedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.rb', '.md', '.json', '.yaml', '.yml'];

    return data.tree
      .filter(item => item.type === 'blob') // Only files
      .filter(item => !excludedDirs.some(dir => item.path.includes(dir))) // Exclude junk
      .filter(item => {
        const ext = item.path.substring(item.path.lastIndexOf('.'));
        return includedExtensions.includes(ext) || item.path.endsWith('package.json');
      });
  } catch (error) {
    console.error('Error fetching repo tree:', error.message);
    throw new Error('Failed to fetch repository structure');
  }
};

/**
 * Fetches content of multiple files in batches
 */
export const fetchFilesContent = async (owner, repo, files, branch) => {
  const MAX_CONCURRENT = 20;
  const LIMIT = parseInt(process.env.MAX_FILES_PER_REPO || '150');
  
  // Sort by size or path to prioritize important files if needed, here we just take the first LIMIT
  const selectedFiles = files.slice(0, LIMIT);
  const results = [];

  for (let i = 0; i < selectedFiles.length; i += MAX_CONCURRENT) {
    const batch = selectedFiles.slice(i, i + MAX_CONCURRENT);
    const batchResults = await Promise.all(batch.map(async (file) => {
      try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path: file.path,
          ref: branch
        });

        // Content is base64 encoded
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return {
          path: file.path,
          content,
          size: data.size,
          language: detectLanguage(file.path)
        };
      } catch (error) {
        console.warn(`Skipping file ${file.path}: ${error.message}`);
        return null;
      }
    }));
    results.push(...batchResults.filter(Boolean));
  }

  return results;
};

/**
 * Fetches content of a single file
 */
export const fetchSingleFileContent = async (owner, repo, path, branch) => {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch
    });

    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return {
      path,
      content,
      size: data.size,
      language: detectLanguage(path)
    };
  } catch (error) {
    throw new Error(`Failed to fetch file ${path}: ${error.message}`);
  }
};

const detectLanguage = (path) => {
  const ext = path.split('.').pop().toLowerCase();
  const langMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'rb': 'ruby',
    'md': 'markdown',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml'
  };
  return langMap[ext] || 'text';
};
