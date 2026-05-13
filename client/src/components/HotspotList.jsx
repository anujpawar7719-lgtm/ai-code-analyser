import React from 'react';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const HotspotList = ({ hotspots, metrics }) => {
  if (!hotspots) return null;

  const healthColor = (score) => {
    if (score > 70) return 'text-success';
    if (score > 40) return 'text-secondary';
    return 'text-danger';
  };

  return (
    <div className="space-y-6">
      {/* Health Header */}
      <div className="card flex items-center justify-between">
        <div>
          <h3 className="text-sm font-mono text-gray-500 uppercase">Code Health Score</h3>
          <p className={`text-5xl font-bold \${healthColor(hotspots.healthScore)}`}>
            {hotspots.healthScore}%
          </p>
        </div>
        <div className="max-w-md text-right">
          <p className="text-sm text-gray-400 leading-relaxed italic">
            "{hotspots.riskSummary}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hotspots Column */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="flex items-center gap-2 font-bold text-gray-400 uppercase text-xs tracking-widest">
            <AlertTriangle className="h-4 w-4 text-danger" /> Top Hotspots
          </h4>
          {hotspots.hotspots.map((spot, i) => (
            <div key={i} className="card border-l-4 border-l-danger hover:bg-gray-800/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <code className="text-primary text-sm">{spot.file}</code>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-danger/10 \${healthColor(0)}`}>
                  {spot.risk} risk
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{spot.reason}</p>
              <div className="bg-black/30 p-2 rounded text-[11px] text-gray-500 flex gap-2">
                <span className="text-primary font-bold">Fix:</span> {spot.suggestion}
              </div>
            </div>
          ))}
        </div>

        {/* Anti-Patterns & Strengths Column */}
        <div className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-bold text-gray-400 uppercase text-xs tracking-widest mb-4">
              <AlertTriangle className="h-4 w-4 text-secondary" /> Anti-Patterns
            </h4>
            <ul className="space-y-2">
              {hotspots.antiPatterns.map((item, i) => (
                <li key={i} className="text-xs text-gray-500 bg-surface p-2 rounded border border-gray-800">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="flex items-center gap-2 font-bold text-gray-400 uppercase text-xs tracking-widest mb-4">
              <CheckCircle className="h-4 w-4 text-success" /> Strengths
            </h4>
            <ul className="space-y-2">
              {hotspots.strengths.map((item, i) => (
                <li key={i} className="text-xs text-gray-500 bg-surface p-2 rounded border border-gray-800">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="flex items-center gap-2 font-bold text-gray-400 uppercase text-xs tracking-widest mb-4">
              <TrendingUp className="h-4 w-4 text-primary" /> Refactor Priority
            </h4>
            <ol className="space-y-2">
              {hotspots.refactorPriority.map((item, i) => (
                <li key={i} className="text-xs text-primary font-mono bg-primary/5 p-2 rounded border border-primary/10">
                  {i + 1}. {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotspotList;
