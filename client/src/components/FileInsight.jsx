import React from 'react';
import { 
  Code2, FunctionSquare, Box, 
  BarChart2, Clock, Hash, 
  FileCode, ExternalLink, MessageSquare 
} from 'lucide-react';
import { motion } from 'framer-motion';

const FileInsight = ({ file, metrics, parsedData, onAskAI }) => {
  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 border border-dashed border-gray-800 rounded-xl">
        <FileCode size={48} className="mb-4 opacity-20" />
        <p className="text-sm">Select a file from the explorer to see detailed insights</p>
      </div>
    );
  }

  const fileMetrics = metrics?.perFile?.[file] || {};
  const fileInfo = parsedData?.find(f => f.path === file) || {};

  const stats = [
    { label: 'Lines of Code', value: fileMetrics.loc || '?', icon: Hash, color: 'text-blue-400' },
    { label: 'Imports', value: fileMetrics.importCount || 0, icon: Box, color: 'text-purple-400' },
    { label: 'Complexity', value: fileMetrics.complexityScore || 0, icon: BarChart2, color: 'text-secondary' },
    { label: 'Coupling', value: fileMetrics.couplingScore || 0, icon: Clock, color: 'text-primary' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* File Header */}
      <div className="card bg-primary/5 border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 truncate">
            <Code2 className="text-primary" size={20} />
            {file.split('/').pop()}
          </h2>
          <p className="text-xs font-mono text-gray-500 mt-1">{file}</p>
        </div>
        <button 
          onClick={() => onAskAI(`Tell me about the logic in ${file}`)}
          className="btn-primary py-2 px-4 flex items-center gap-2 whitespace-nowrap"
        >
          <MessageSquare size={16} /> Ask AI about this file
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="card p-3 flex flex-col items-center text-center">
            <stat.icon size={16} className={`${stat.color} mb-2`} />
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-lg font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Functions & Classes */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <FunctionSquare size={14} className="text-secondary" /> Functions & Classes
          </h3>
          <div className="card bg-black/20 p-0 overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
              {(fileInfo.functions?.length > 0 || fileInfo.classes?.length > 0) ? (
                <div className="divide-y divide-gray-800">
                  {fileInfo.classes?.map(c => (
                    <div key={c} className="px-4 py-3 flex items-center justify-between group hover:bg-gray-800/30">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded bg-purple-400/10 text-purple-400">
                          <Box size={14} />
                        </div>
                        <code className="text-sm font-semibold">{c}</code>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gray-600">Class</span>
                    </div>
                  ))}
                  {fileInfo.functions?.map(f => (
                    <div key={f} className="px-4 py-3 flex items-center justify-between group hover:bg-gray-800/30">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded bg-secondary/10 text-secondary">
                          <FunctionSquare size={14} />
                        </div>
                        <code className="text-sm">{f}</code>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gray-600">Function</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No structural entities detected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Imports */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Box size={14} className="text-blue-400" /> Dependencies
          </h3>
          <div className="card bg-black/20 p-0 overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
              {fileInfo.imports?.length > 0 ? (
                <div className="p-4 flex flex-wrap gap-2">
                  {fileInfo.imports.map(imp => (
                    <span key={imp} className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-[11px] text-gray-400 font-mono flex items-center gap-1.5">
                      <ExternalLink size={10} className="text-gray-600" />
                      {imp}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No external imports detected
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FileInsight;
