import React, { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Github, Star, Share2, 
  BarChart3, Layout, AlertCircle, 
  ChevronRight, Download 
} from 'lucide-react';

import CodeMap from '../components/CodeMap';
import SummaryCards from '../components/SummaryCards';
import HotspotList from '../components/HotspotList';
import SettingsModal from '../components/SettingsModal';
import FileExplorer from '../components/FileExplorer';
import FileInsight from '../components/FileInsight';
import ChatWidget from '../components/ChatWidget';
import HistoryView from '../components/HistoryView';
import { exportReport, exportToMarkdown } from '../utils/ExportService';
import { Settings, MessageSquare, Sparkles, History, MoreVertical } from 'lucide-react';

const Dashboard = () => {
  const { owner, repo } = useParams();
  const [activeTab, setActiveTab] = useState('summary');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['analysis', owner, repo],
    queryFn: async () => {
      const aiConfig = JSON.parse(localStorage.getItem('repolens_ai_config') || '{}');
      const { data } = await axios.post('/api/analyze', { 
        url: `https://github.com/\${owner}/\${repo}`,
        aiConfig
      });
      return data;
    },
    staleTime: Infinity,
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  const tabs = [
    { id: 'summary', label: 'Summary', icon: BarChart3 },
    { id: 'hotspots', label: 'Hotspots', icon: AlertCircle },
    { id: 'architecture', label: 'Architecture', icon: Layout },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 bg-background/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto w-full">
          <div className="flex items-center gap-6">
            <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-mono">
                <Github className="h-3 w-3" />
                <span>{owner}</span>
                <ChevronRight className="h-3 w-3" />
              </div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                {repo}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-800 text-[10px] text-gray-400 border border-gray-700">
                  <Star className="h-2.5 w-2.5 fill-gray-400" /> {data.metadata.stars}
                </div>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="AI Settings"
            >
              <Settings size={20} />
            </button>
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold transition-colors">
                <Download className="h-4 w-4" /> Export
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-gray-800 rounded-lg shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60]">
                <button 
                  onClick={() => exportReport(data)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
                >
                  Download JSON
                </button>
                <button 
                  onClick={() => exportToMarkdown(data)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
                >
                  Download Markdown
                </button>
              </div>
            </div>
          </div>
          <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total Files" value={data.metrics.totalFiles} />
            <StatCard label="Total LOC" value={data.metrics.totalLOC.toLocaleString()} />
            <StatCard label="Health Score" value={`\${data.hotspots.healthScore}%`} isHighlight />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-surface border border-gray-800 rounded-xl w-fit">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${
                  activeTab === tab.id ? 'bg-primary text-background' : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'summary' && (
                  <SummaryCards summary={data.summary} architecture={data.architecture} />
                )}
                {activeTab === 'hotspots' && (
                  <HotspotList hotspots={data.hotspots} metrics={data.metrics} />
                )}
                {activeTab === 'architecture' && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
                      <div className="lg:col-span-4 h-full">
                        <FileExplorer 
                          tree={data.fileTree} 
                          onFileSelect={setSelectedFile} 
                          selectedFile={selectedFile} 
                        />
                      </div>
                      <div className="lg:col-span-8 h-full overflow-y-auto pr-2 scrollbar-thin">
                        <FileInsight 
                          file={selectedFile} 
                          metrics={data.metrics} 
                          parsedData={data.parsedFiles}
                          onAskAI={(msg) => {
                            setChatMessage(msg);
                            setIsChatOpen(true);
                          }}
                        />
                      </div>
                   </div>
                )}
                {activeTab === 'history' && (
                  <HistoryView history={data.history} churn={data.churn} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-5 h-[calc(100vh-140px)] sticky top-24">
           <CodeMap data={data.graph} />
           
           <div className="mt-4 card bg-primary/5 border-primary/20">
              <h4 className="text-xs font-mono text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                <Share2 className="h-3 w-3" /> Tech Stack Detected
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.techStack.languages.map(l => (
                  <span key={l} className="px-2 py-1 rounded bg-gray-800 text-[10px] uppercase font-bold text-gray-400">{l}</span>
                ))}
                {data.techStack.frameworks.map(f => (
                  <span key={f} className="px-2 py-1 rounded bg-primary/10 text-[10px] uppercase font-bold text-primary border border-primary/20">{f}</span>
                ))}
              </div>
           </div>
        </div>
      </main>

      {/* Floating Chat Trigger */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-primary text-background rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
      </button>

      <ChatWidget 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        repoUrl={`https://github.com/\${owner}/\${repo}`}
        initialMessage={chatMessage}
      />
    </div>
  );
};

const StatCard = ({ label, value, isHighlight }) => (
  <div className={`card text-center \${isHighlight ? 'border-primary/50 bg-primary/5' : ''}`}>
    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-2xl font-bold \${isHighlight ? 'text-primary' : ''}`}>{value}</p>
  </div>
);

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <div className="relative w-24 h-24 mb-8">
      <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
      <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
    </div>
    <h2 className="text-2xl font-bold animate-pulse">Analyzing Codebase...</h2>
    <p className="text-gray-500 font-mono mt-4">Parsing AST • Calculating Complexity • Running AI Prompts</p>
  </div>
);

const ErrorScreen = ({ error }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mb-6">
      <AlertCircle className="h-10 w-10 text-danger" />
    </div>
    <h2 className="text-2xl font-bold">Analysis Failed</h2>
    <p className="text-gray-500 mt-2 max-w-md text-center">
      {error.response?.data?.error || 'An unexpected error occurred while analyzing the repository.'}
    </p>
    <Link to="/" className="mt-8 btn-primary">Return Home</Link>
  </div>
);

export default Dashboard;
