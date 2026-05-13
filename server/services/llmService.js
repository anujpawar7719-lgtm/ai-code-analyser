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

  if (!effectiveKey || effectiveKey.includes('your_key_here')) {
    console.warn(`[LLM Service] No valid API key for ${provider}. Falling back to Mock Analysis.`);
    return generateMockAnalysis(repoData);
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

  if (!effectiveKey || effectiveKey.includes('your_key_here')) {
    return { 
      content: "I am currently in Demo Mode because no valid API key was found. I can't answer specific questions about the code, but the dashboard shows a mock analysis for your repository.", 
      role: 'assistant' 
    };
  }

  const context = {
    repoName: metadata.name,
    repoDescription: metadata.description,
    primaryLanguage: metadata.language,
    techStack: extractTechStack(parsedFiles),
    architecture: analysis.architecture?.dataFlow || 'N/A',
    hotspots: metrics.repoSummary.hotspots,
    structure: fileTree.slice(0, 100).map(f => f.path),
    recentHistory: repoData.history?.slice(0, 10).map(c => `${c.author}: ${c.message}`),
    highChurn: repoData.churn?.slice(0, 5).map(c => c.file)
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

/**
 * Generates mock analysis data for demo purposes
 */
const generateMockAnalysis = (repoData) => {
  const { metadata } = repoData;
  const isML = metadata.name.toLowerCase().includes('grad') || 
               metadata.name.toLowerCase().includes('ml') || 
               metadata.name.toLowerCase().includes('tensor');

  if (isML) {
    return {
      summary: {
        purpose: `This is a Machine Learning repository focused on ${metadata.name}.`,
        oneLiner: "A lightweight autograd engine for neural network experimentation.",
        quickStart: "import micrograd\nval = Value(2.0)\nval.backward()",
        keyFeatures: ["Reverse-mode autograd", "Modular neural network layers", "Pure NumPy implementation"],
        audience: "ML students and researchers interested in core autograd concepts.",
        warnings: ["Optimized for education, not production performance.", "Limited support for multi-GPU."],
        techStack: { languages: ['Python'], frameworks: ['NumPy', 'PyTorch'] }
      },
      architecture: {
        dataFlow: "Data flows from input tensors through a series of mathematical transformations (layers) to produce predictions or gradients.",
        pattern: "Layered API / Autograd Graph",
        directories: [
          { path: "engine", description: "Core computation engine for backpropagation." },
          { path: "nn", description: "Neural network layer implementations." }
        ]
      },
      entryPoints: {
        files: [
          { file: "main.py", purpose: "Main entry point for training or inference." },
          { file: "engine.py", purpose: "Defines the core Value or Tensor objects." }
        ]
      },
      hotspots: {
        healthScore: 85,
        riskSummary: "The core engine logic is highly complex due to recursive backpropagation.",
        hotspots: [
          { file: "engine.py", reason: "Complex recursive backpropagation logic.", risk: "High", suggestion: "Consider iterative approach for deep graphs." }
        ],
        antiPatterns: ["Deep recursion in backprop", "Direct NumPy manipulation in layers"],
        strengths: ["Elegant scalar-valued autograd", "Zero external dependencies"],
        refactorPriority: ["engine.py", "nn.py"]
      }
    };
  }

  return {
    summary: {
      purpose: "A software repository containing codebase for " + metadata.name,
      oneLiner: "A modern software implementation of " + metadata.name,
      quickStart: "npm install\nnpm start",
      keyFeatures: ["Modular architecture", "Automated workflows", "High performance"],
      audience: "Software developers and system architects.",
      warnings: ["Requires Node.js 18+", "External API dependencies."],
      techStack: { languages: ['JavaScript'], frameworks: ['React'] }
    },
    architecture: {
      dataFlow: "Standard application architecture with modular components.",
      pattern: "Model-View-Controller",
      directories: [
        { path: "src", description: "Main source code directory." },
        { path: "utils", description: "Utility functions and helpers." }
      ]
    },
    entryPoints: {
      files: [
        { file: "index.js", purpose: "Application entry point." }
      ]
    },
    hotspots: {
      healthScore: 92,
      riskSummary: "The codebase is generally well-structured with low overall complexity.",
      hotspots: [
        { file: "index.js", reason: "Central hub for application logic.", risk: "Medium", suggestion: "Break down into smaller feature modules." }
      ],
      antiPatterns: ["Tight coupling in entry point"],
      strengths: ["Excellent modularity", "Comprehensive documentation"],
      refactorPriority: ["index.js"]
    }
  };
};
