import React, { useState } from 'react';
import { Github, Loader2 } from 'lucide-react';

const AnalysisForm = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [branch, setBranch] = useState('main');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url) return;
    onSubmit({ url, branch });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Github className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repo or multiple URLs separated by commas"
          className="block w-full pl-12 pr-4 py-4 bg-surface border border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-lg font-mono"
          required
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          placeholder="branch (main)"
          className="flex-1 px-4 py-3 bg-surface border border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex items-center justify-center gap-2 px-8 py-3 rounded-xl min-w-[200px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Repo'
          )}
        </button>
      </div>
    </form>
  );
};

export default AnalysisForm;
