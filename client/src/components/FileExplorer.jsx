import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FileExplorer = ({ tree, onFileSelect, selectedFile }) => {
  const [expandedDirs, setExpandedDirs] = useState(new Set(['root']));
  const [searchTerm, setSearchTerm] = useState('');

  // Build tree structure
  const buildTree = (files) => {
    const root = { name: 'root', type: 'dir', children: {}, path: '' };
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = root;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current.children[part] = { name: part, type: 'file', path: file.path };
        } else {
          if (!current.children[part]) {
            current.children[part] = { name: part, type: 'dir', children: {}, path: parts.slice(0, index + 1).join('/') };
          }
          current = current.children[part];
        }
      });
    });
    
    return root;
  };

  const fileTree = buildTree(tree);

  const toggleDir = (path) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const renderNode = (node, depth = 0) => {
    const isExpanded = expandedDirs.has(node.path || 'root');
    const isSelected = selectedFile === node.path;
    const hasChildren = node.children && Object.keys(node.children).length > 0;

    // Filter by search
    if (searchTerm && node.type === 'file' && !node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }

    return (
      <div key={node.path || 'root'} className="select-none">
        <div 
          className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors group ${
            isSelected ? 'bg-primary/20 text-primary' : 'hover:bg-gray-800/50 text-gray-400 hover:text-white'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => node.type === 'dir' ? toggleDir(node.path || 'root') : onFileSelect(node.path)}
        >
          {node.type === 'dir' ? (
            <>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Folder size={16} className={isExpanded ? 'text-primary' : 'text-gray-500'} />
            </>
          ) : (
            <>
              <div className="w-[14px]" />
              <File size={16} className={isSelected ? 'text-primary' : 'text-gray-500'} />
            </>
          )}
          <span className="text-sm font-medium truncate">{node.name === 'root' ? 'Repository' : node.name}</span>
        </div>

        <AnimatePresence>
          {node.type === 'dir' && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {Object.values(node.children)
                .sort((a, b) => (a.type === 'dir' ? -1 : 1) - (b.type === 'dir' ? -1 : 1) || a.name.localeCompare(b.name))
                .map(child => renderNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-surface border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-3 border-b border-gray-800 bg-black/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input 
            type="text" 
            placeholder="Search files..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:border-primary outline-none transition-all"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {renderNode(fileTree)}
      </div>
    </div>
  );
};

export default FileExplorer;
