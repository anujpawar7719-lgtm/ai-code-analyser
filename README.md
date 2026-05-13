# RepoLens 🔍

**Understand any codebase in 60 seconds.**

RepoLens is an AI-powered GitHub repository analyzer and interactive code map generator. It helps developers quickly navigate unfamiliar codebases through automated summaries, dependency visualizations, and code health audits.

![RepoLens Screenshot Placeholder](https://via.placeholder.com/1200x600/0a0f1e/00d4ff?text=RepoLens+Dashboard+Preview)

## ✨ Features n 

- 🗺️ **Interactive Code Map**: High-performance D3.js force-directed graph visualizing file dependencies.
- 🤖 **AI Architect**: Automated summaries of purpose, architecture, and data flow powered by Claude 3.5 Sonnet.
- ⚡ **Hotspot Radar**: Instant identification of complex files, high coupling zones, and refactoring priorities.
- 🚦 **Onboarding Guide**: Clear entry points and "read first" file recommendations for new developers.
- 📊 **Metrics Engine**: Real-time calculation of LOC, complexity, and coupling scores.

## 🚀 How it Works

1. **Fetch**: RepoLens fetches the repo tree and file contents via GitHub REST API.
2. **Parse**: JavaScript, TypeScript, and Python files are parsed into ASTs to extract imports, exports, and functions.
3. **Analyze**: A custom metrics engine calculates complexity scores and identifies "hotspots".
4. **AI Inference**: Multi-stage prompts are sent to Claude to generate architectural and functional insights.
5. **Visualize**: Data is transformed into a node-link graph and interactive dashboard.

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, D3.js v7, Framer Motion, TanStack Query.
- **Backend**: Node.js 20, Express, @babel/parser, Octokit REST.
- **AI**: Anthropic SDK (Claude 3.5 Sonnet).
- **Cache**: Redis.

## 🏁 Getting Started

### Prerequisites

- Node.js 20+
- [GitHub Personal Access Token](https://github.com/settings/tokens)
- [Gemini API Key](https://aistudio.google.com/app/apikey) or [Anthropic API Key](https://console.anthropic.com/)

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/repolens.git
   cd repolens
   ```

2. **Setup Server**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Fill in GITHUB_TOKEN in .env (AI Key can be set in UI)
   npm run dev
   ```

3. **Setup Client**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

4. **Configure AI**
   - Open [http://localhost:5173](http://localhost:5173)
   - Click the **Settings (gear icon)** at the top right.
   - Enter your Gemini or Claude API key and save.

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## ⚠️ Limitations

- **Private Repos**: Only public repositories are supported by default.
- **Size Limit**: Analysis is optimized for repos with < 150 source files.
- **Parsing**: Advanced parsing is currently focused on JS, TS, and Python.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
