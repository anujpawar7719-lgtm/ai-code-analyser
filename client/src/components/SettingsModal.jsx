import React, { useState, useEffect } from 'react';
import { X, Settings, ShieldCheck, Key } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('repolens_ai_config');
    if (savedConfig) {
      const { provider: p, apiKey: k } = JSON.parse(savedConfig);
      setProvider(p || 'gemini');
      setApiKey(k || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('repolens_ai_config', JSON.stringify({ provider, apiKey }));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Settings size={20} />
            </div>
            <h2 className="text-xl font-semibold text-white">AI Configuration</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">AI Provider</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setProvider('gemini')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                  provider === 'gemini' 
                    ? 'bg-primary/10 border-primary text-white' 
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                Google Gemini
              </button>
              <button
                onClick={() => setProvider('anthropic')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                  provider === 'anthropic' 
                    ? 'bg-primary/10 border-primary text-white' 
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                Claude AI
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Key size={14} />
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${provider === 'gemini' ? 'Gemini' : 'Anthropic'} API key`}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <p className="text-xs text-gray-500 italic">
              Your key is stored locally in your browser and never shared with anyone else.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={!apiKey}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              saved 
                ? 'bg-green-500 text-white' 
                : 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {saved ? (
              <>
                <ShieldCheck size={20} />
                Settings Saved!
              </>
            ) : (
              'Save Configuration'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
