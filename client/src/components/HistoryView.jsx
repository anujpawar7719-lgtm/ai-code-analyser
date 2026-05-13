import React from 'react';
import { GitCommit, User, Clock, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const HistoryView = ({ history, churn }) => {
  if (!history || history.length === 0) {
    return (
      <div className="card text-center p-12">
        <GitCommit className="mx-auto h-12 w-12 text-gray-700 mb-4" />
        <p className="text-gray-500">No commit history found or repository is too new.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Left Column: Recent Commits */}
      <div className="lg:col-span-7 space-y-4">
        <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4">
          <GitCommit size={14} className="text-primary" /> Recent Activity
        </h3>
        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin">
          {history.map((commit, i) => (
            <motion.div
              key={commit.sha}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-3 hover:bg-gray-800/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-primary/10 text-primary">
                    <User size={12} />
                  </div>
                  <span className="text-xs font-bold text-gray-300">{commit.author}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                  <Clock size={10} />
                  {new Date(commit.date).toLocaleDateString()}
                </div>
              </div>
              <p className="text-sm text-gray-400 group-hover:text-white transition-colors line-clamp-2">
                {commit.message}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <code className="text-[10px] text-gray-600 bg-black/30 px-1.5 py-0.5 rounded">
                  {commit.sha.substring(0, 7)}
                </code>
                <a 
                  href={commit.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  View on GitHub <ChevronRight size={10} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Column: Churn & Insights */}
      <div className="lg:col-span-5 space-y-6">
        {/* Churn Chart */}
        <div>
          <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-secondary" /> High Churn Files
          </h3>
          <div className="card space-y-4">
            {churn && churn.length > 0 ? (
              churn.map((item, i) => (
                <div key={item.file} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-gray-400 truncate max-w-[200px]">{item.file.split('/').pop()}</span>
                    <span className="text-secondary">{item.count} changes</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / churn[0].count) * 100}%` }}
                      className="h-full bg-secondary"
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">Analyzing churn data...</p>
            )}
            <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">
              Files with high churn are modified frequently, often indicating instability or complex logic that may need refactoring.
            </p>
          </div>
        </div>

        {/* AI Insight Placeholder */}
        <div className="card bg-secondary/5 border-secondary/20">
          <h4 className="text-[10px] font-mono text-secondary uppercase tracking-widest mb-2 flex items-center gap-2">
            <AlertTriangle size={12} /> Volatility Alert
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            The high churn in <code className="text-secondary">{churn?.[0]?.file?.split('/').pop() || 'key files'}</code> suggests this area is under active development or experiencing frequent bug fixes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
