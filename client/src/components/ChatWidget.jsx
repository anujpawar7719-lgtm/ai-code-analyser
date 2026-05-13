import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, X, 
  Bot, User, Sparkles, 
  Loader2, Maximize2, Minimize2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ChatWidget = ({ isOpen, onClose, repoUrl, initialMessage }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialMessage && isOpen) {
      handleSend(initialMessage);
    }
  }, [initialMessage, isOpen]);

  const handleSend = async (text = input) => {
    if (!text.trim() || isLoading) return;

    const newMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiConfig = JSON.parse(localStorage.getItem('repolens_ai_config') || '{}');
      const { data } = await axios.post('/api/chat', {
        repoUrl,
        message: text,
        history: messages.slice(-10), // Send last 10 messages for context
        aiConfig
      });

      setMessages(prev => [...prev, data]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.response?.data?.error || 'Failed to get AI response'}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            height: isMinimized ? '60px' : '600px',
            width: isMinimized ? '200px' : '450px'
          }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-6 right-6 z-[100] bg-surface border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-800 bg-black/40 flex items-center justify-between cursor-pointer"
               onClick={() => isMinimized && setIsMinimized(false)}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold">RepoLens AI Chat</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Context Aware
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-500 transition-colors"
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-2">
                      <MessageSquare size={24} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-300">Ask anything about this codebase</h4>
                    <p className="text-xs text-gray-500 max-w-[200px]">
                      "How does the data flow from server to client?" or "What are the key hotspots?"
                    </p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                        msg.role === 'user' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'
                      }`}>
                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                          ? 'bg-secondary/10 text-white border border-secondary/20 rounded-tr-none' 
                          : 'bg-gray-800/50 text-gray-300 border border-gray-700 rounded-tl-none'
                      }`}>
                        {/* Simple formatting for code blocks and newlines */}
                        <div className="whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                        <Loader2 size={14} className="animate-spin" />
                      </div>
                      <div className="p-3 rounded-2xl bg-gray-800/50 text-gray-400 text-xs animate-pulse border border-gray-700 rounded-tl-none">
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-800 bg-black/20">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="relative"
                >
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-4 pr-12 text-sm focus:border-primary outline-none transition-all"
                  />
                  <button 
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-background rounded-lg disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatWidget;
