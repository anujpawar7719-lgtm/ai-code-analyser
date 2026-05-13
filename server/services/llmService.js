import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import * as summaryPrompt from '../prompts/summaryPrompt.js';
import * as architecturePrompt from '../prompts/architecturePrompt.js';
import * as entryPointsPrompt from '../prompts/entryPointsPrompt.js';
import * as hotspotPrompt from '../prompts/hotspotPrompt.js';
import * as chatPrompt from '../prompts/chatPrompt.js';

dotenv.config();

/**
 * Orchestrates AI analysis using dynamic providers
 */
export const runAllPrompts = async (repoData, aiConfig = {}) => {
  const { metadata, fileTree, parsedFiles, metrics } = repoData;
  const { apiKey, provider = 'anthropic' } = aiConfig;

  // Use provided key or fallback to env
  const effectiveKey = apiKey || (provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : process.env.GEMINI_API_KEY);

  if (!effectiveKey) {
    throw new Error(`Missing API Key for ${provider}. Please provide it in settings.`);
  }

  // Prepare context
  const context = {
    repoName: metadata.name,
    repoDescription: metadata.description,
    primaryLanguage: metadata.language,
    stars: metadata.stars,
    topics: metadata.topics,
    structure: fileTree.slice(0, 50).map(f => f.path),
    techStack: extractTechStack(parsedFiles),
    hotspots: metrics.repoSummary.hotspots
  };

  const prompts = [
    { name: 'summary', fn: summaryPrompt.generate },
    { name: 'architecture', fn: architecturePrompt.generate },
    { name: 'entryPoints', fn: entryPointsPrompt.generate },
    { name: 'hotspots', fn: hotspotPrompt.generate }
  ];

  try {
    const results = await Promise.all(prompts.map(async (p) => {
      const promptText = p.fn(context);
      let textResponse = '';

      if (provider === 'gemini') {
        const genAI = new GoogleGenerativeAI(effectiveKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(promptText);
        textResponse = result.response.text();
      } else {
        const anthropic = new Anthropic({ apiKey: effectiveKey });
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1500,
          temperature: 0.3,
          messages: [{ role: 'user', content: promptText }],
        });
        textResponse = response.content[0].text;
      }

      try {
        // Find JSON in response
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        return { [p.name]: JSON.parse(jsonMatch ? jsonMatch[0] : textResponse) };
      } catch (e) {
        console.error(`Failed to parse AI response for ${p.name}:`, e.message);
        return { [p.name]: { error: 'Failed to parse AI response' } };
      }
    }));

    return Object.assign({}, ...results);
  } catch (error) {
    console.error('LLM Service Error:', error.message);
    throw new Error(`AI Analysis failed (${provider}): ${error.message}`);
  }
};

/**
 * Handles a single chat message with repo context
 */
export const chatWithRepo = async (repoData, message, history = [], aiConfig = {}) => {
  const { metadata, fileTree, parsedFiles, metrics, analysis } = repoData;
  const { apiKey, provider = 'anthropic' } = aiConfig;

  const effectiveKey = apiKey || (provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : process.env.GEMINI_API_KEY);

  if (!effectiveKey) {
    throw new Error(`Missing API Key for ${provider}. Please provide it in settings.`);
  }

  const context = {
    repoName: metadata.name,
    repoDescription: metadata.description,
    primaryLanguage: metadata.language,
    techStack: extractTechStack(parsedFiles),
    architecture: analysis.architecture?.dataFlow || 'N/A',
    hotspots: metrics.repoSummary.hotspots,
    structure: fileTree.slice(0, 100).map(f => f.path) // Limit structure for prompt size
  };

  const promptText = chatPrompt.generate(context, message, history);
  let textResponse = '';

  if (provider === 'gemini') {
    const genAI = new GoogleGenerativeAI(effectiveKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(promptText);
    textResponse = result.response.text();
  } else {
    const anthropic = new Anthropic({ apiKey: effectiveKey });
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [{ role: 'user', content: promptText }],
    });
    textResponse = response.content[0].text;
  }

  return { content: textResponse, role: 'assistant' };
};

const extractTechStack = (parsedFiles) => {
  const pkgFile = parsedFiles.find(f => f.path.endsWith('package.json'));
  if (!pkgFile) return { languages: [], frameworks: [] };

  const deps = pkgFile.imports || [];
  const frameworks = [];
  if (deps.includes('react')) frameworks.push('React');
  if (deps.includes('next')) frameworks.push('Next.js');
  if (deps.includes('vue')) frameworks.push('Vue');
  if (deps.includes('express')) frameworks.push('Express');
  if (deps.includes('tailwindcss')) frameworks.push('Tailwind CSS');

  return {
    languages: Object.keys(parsedFiles.reduce((acc, f) => {
      const ext = f.path.split('.').pop();
      acc[ext] = true;
      return acc;
    }, {})),
    frameworks
  };
};
