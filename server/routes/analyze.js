import express from 'express';
import * as githubService from '../services/githubService.js';
import * as astParser from '../services/astParser.js';
import * as metricsService from '../services/metricsService.js';
import * as llmService from '../services/llmService.js';
import * as cacheService from '../services/cacheService.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  const { url, branch = 'main', aiConfig } = req.body;

  if (!url || !url.includes('github.com')) {
    return res.status(400).json({ error: 'Invalid GitHub URL' });
  }

  try {
    // 1. Extract owner/repo
    const parts = url.replace('https://github.com/', '').split('/');
    if (parts.length < 2) return res.status(400).json({ error: 'Invalid repository format' });
    const owner = parts[0];
    const repo = parts[1].replace('.git', '');
    const cacheKey = `analysis:\${owner}:\${repo}:\${branch}`;

    // 2. Check Cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log(`[Cache Hit] \${owner}/\${repo}`);
      return res.status(200).json(cached);
    }

    console.log(`[Start Analysis] \${owner}/\${repo} on branch \${branch}`);

    // 3. Fetch Metadata & Tree
    const metadata = await githubService.fetchRepoMetadata(owner, repo);
    const actualBranch = branch || metadata.defaultBranch;
    const tree = await githubService.fetchRepoTree(owner, repo, actualBranch);

    // 4. Fetch File Content
    const files = await githubService.fetchFilesContent(owner, repo, tree, actualBranch);

    // 5. AST Parse
    const parsedFiles = astParser.parseFiles(files);

    // 6. Compute Metrics
    const metrics = metricsService.computeMetrics(parsedFiles);

    // 7. LLM Analysis
    const aiResults = await llmService.runAllPrompts({
      metadata,
      fileTree: tree,
      parsedFiles,
      metrics
    }, aiConfig);

    // 8. Transform to Graph
    const graph = transformToGraph(parsedFiles, metrics);

    // 9. Assemble Final Response
    const response = {
      repoId: `\${owner}/\${repo}@\${actualBranch}`,
      analyzedAt: new Date().toISOString(),
      metadata,
      summary: aiResults.summary,
      architecture: aiResults.architecture,
      entryPoints: aiResults.entryPoints,
      hotspots: aiResults.hotspots,
      metrics: metrics.repoSummary,
      graph,
      techStack: aiResults.summary.techStack || { languages: [], frameworks: [] }
    };

    // 10. Cache Result
    await cacheService.set(cacheKey, response);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

const transformToGraph = (parsedFiles, metrics) => {
  const nodes = parsedFiles.map(file => {
    const fileMetrics = metrics.perFile[file.path] || {};
    return {
      id: file.path,
      label: file.path.split('/').pop(),
      group: file.path.split('/')[0],
      loc: fileMetrics.loc || 0,
      complexity: fileMetrics.complexityScore || 0,
      isHotspot: fileMetrics.isHotspot || false,
      language: file.language || 'text'
    };
  });

  const links = [];
  parsedFiles.forEach(file => {
    file.imports.forEach(imp => {
      // Find target node that ends with this import path
      const target = nodes.find(n => n.id.endsWith(imp) || imp.includes(n.label));
      if (target && target.id !== file.path) {
        links.push({
          source: file.path,
          target: target.id,
          type: 'import'
        });
      }
    });
  });

  return { nodes, links };
};

export default router;
