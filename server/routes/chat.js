import express from 'express';
import * as llmService from '../services/llmService.js';
import { getRepoData } from '../services/cacheService.js';

const router = express.Router();

/**
 * POST /api/chat
 * Handles context-aware chat messages
 */
router.post('/', async (req, res, next) => {
  try {
    const { repoUrl, message, history, aiConfig } = req.body;

    if (!repoUrl || !message) {
      return res.status(400).json({ error: 'Missing repoUrl or message' });
    }

    // Get repo data from cache (required for context)
    const repoData = await getRepoData(repoUrl);
    if (!repoData) {
      return res.status(404).json({ error: 'Repository analysis not found. Please analyze the repository first.' });
    }

    const response = await llmService.chatWithRepo(repoData, message, history, aiConfig);
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
