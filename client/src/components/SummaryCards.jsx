import React from 'react';
import { motion } from 'framer-motion';
import { Info, Zap, Layers, Target, Users, AlertTriangle } from 'lucide-react';

const SummaryCards = ({ summary, architecture }) => {
  if (!summary) return null;

  const cards = [
    {
      title: 'Purpose',
      content: summary.purpose,
      icon: Info,
      color: 'text-primary',
      extra: summary.oneLiner
    },
    {
      title: 'Quick Start',
      content: summary.quickStart,
      icon: Zap,
      color: 'text-secondary',
      isCode: true
    },
    {
      title: 'Architecture',
      content: architecture?.dataFlow || 'N/A',
      icon: Layers,
      color: 'text-blue-400',
      badge: architecture?.pattern
    },
    {
      title: 'Key Features',
      content: summary.keyFeatures,
      icon: Target,
      color: 'text-green-400',
      isList: true
    },
    {
      title: 'Audience',
      content: summary.audience,
      icon: Users,
      color: 'text-purple-400'
    },
    {
      title: 'Warnings',
      content: summary.warnings,
      icon: AlertTriangle,
      color: 'text-danger',
      isList: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map((card, i) => {
        const IconComponent = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card border-l-4 border-l-primary/30"
          >
            <div className="flex items-center gap-2 mb-3">
              {IconComponent && <IconComponent className={`h-5 w-5 ${card.color}`} />}
              <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs">{card.title}</h3>
              {card.badge && (
                <span className="ml-auto px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full border border-primary/20">
                  {card.badge}
                </span>
              )}
            </div>
            
            {card.extra && (
              <p className="text-lg font-semibold text-primary mb-2 leading-tight">
                {card.extra}
              </p>
            )}

            {card.isCode ? (
              <pre className="bg-black/50 p-3 rounded-md text-xs font-mono text-gray-300 overflow-x-auto">
                {card.content || 'N/A'}
              </pre>
            ) : card.isList ? (
              <ul className="space-y-1">
                {Array.isArray(card.content) ? card.content.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-400 flex gap-2">
                    <span className="text-primary">•</span> {item}
                  </li>
                )) : <li className="text-sm text-gray-400">N/A</li>}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 leading-relaxed">
                {card.content || 'N/A'}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
