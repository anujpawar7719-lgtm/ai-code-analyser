import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnalysisForm from '../components/AnalysisForm';
import { useAnalysis } from '../hooks/useAnalysis';
import { Code, Share2, Shield, Zap, Settings } from 'lucide-react';
import SettingsModal from '../components/SettingsModal';

const Landing = () => {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useAnalysis();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const handleAnalyze = (data) => {
    // Extract owner/repo for navigation
    const parts = data.url.replace('https://github.com/', '').split('/');
    const owner = parts[0];
    const repo = parts[1].replace('.git', '');
    
    mutate(data, {
      onSuccess: () => {
        navigate(`/dashboard/\${owner}/\${repo}`, { state: { initialData: null } });
      }
    });
  };

  const examples = [
    { name: 'facebook/react', url: 'https://github.com/facebook/react' },
    { name: 'vercel/next.js', url: 'https://github.com/vercel/next.js' },
    { name: 'fastapi/fastapi', url: 'https://github.com/fastapi/fastapi' }
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_50%,#1e293b,0%,#0a0f1e_100%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      
      {/* Settings Button */}
      <div className="absolute top-8 right-8">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 bg-gray-900/50 border border-gray-800 rounded-full text-gray-400 hover:text-white hover:border-primary/50 transition-all shadow-xl backdrop-blur-md group"
        >
          <Settings size={22} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-4xl"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold uppercase tracking-widest mb-4">
          <Zap className="h-3 w-3" /> AI-Powered Code Intelligence
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
          Understand any codebase <br /> in 60 seconds.
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Interactive dependency maps, AI-generated architecture summaries, and instant hotspot analysis for any GitHub repository.
        </p>

        <div className="pt-10 flex justify-center">
          <AnalysisForm onSubmit={handleAnalyze} isLoading={isPending} />
        </div>

        {error && (
          <p className="text-danger font-mono text-sm mt-4 bg-danger/10 p-3 rounded-lg border border-danger/20">
            {error.response?.data?.error || 'Analysis failed. Please check the URL and try again.'}
          </p>
        )}

        <div className="pt-12 flex flex-wrap justify-center gap-3">
          <span className="text-gray-500 text-xs font-mono uppercase tracking-widest w-full mb-2">Try an example:</span>
          {examples.map((ex) => (
            <button
              key={ex.name}
              onClick={() => handleAnalyze({ url: ex.url, branch: 'main' })}
              className="px-4 py-2 rounded-full glass hover:border-primary/50 hover:text-primary transition-all text-sm font-mono text-gray-400"
            >
              {ex.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Feature grid */}
      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        <FeatureCard 
          icon={Share2}
          title="Interactive Code Map"
          desc="Visualize file dependencies with a high-performance force-directed graph powered by D3.js."
        />
        <FeatureCard 
          icon={Shield}
          title="Hotspot Radar"
          desc="Instantly identify complex files, high coupling zones, and potential refactoring priorities."
        />
        <FeatureCard 
          icon={Code}
          title="AI Architect"
          desc="Get automated insights into patterns, data flow, and entry points from Claude 3.5 Sonnet."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="card glass p-8 group hover:border-primary/30 transition-all">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Landing;
