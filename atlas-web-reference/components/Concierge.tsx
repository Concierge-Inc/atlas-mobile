import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToConcierge } from '../services/geminiService';
import { Message } from '../types';
import { Send, Lock, Activity, Terminal } from 'lucide-react';

const Concierge: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'ATLAS Secure Channel Active. Identity Verified.',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToConcierge(userMsg.text);
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-obsidian text-neutral-200 animate-fade-in font-mono">
      {/* Secure Header */}
      <div className="px-6 py-4 border-b border-neutral-900 bg-obsidian/95 backdrop-blur sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-3 h-3">
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <div>
                <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-white">ATLAS Concierge</h2>
                <p className="text-[8px] text-neutral-600 mt-0.5">E2E ENCRYPTED • CHANNEL 01</p>
            </div>
        </div>
        <Lock className="w-3 h-3 text-neutral-600" />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide pb-32">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] py-4 px-5 border backdrop-blur-sm ${
                msg.role === 'user'
                  ? 'bg-neutral-900/50 border-neutral-800 text-white'
                  : 'bg-transparent border-transparent text-neutral-400 pl-0'
              }`}
            >
              {msg.role === 'model' && (
                  <span className="text-[8px] text-neutral-600 uppercase tracking-widest mb-3 block flex items-center gap-2">
                      <Terminal className="w-3 h-3" /> System Output
                  </span>
              )}
              <p className="text-xs leading-relaxed tracking-wide font-sans">{msg.text}</p>
            </div>
            <span className="text-[8px] text-neutral-700 mt-2 uppercase tracking-wider px-1">
                {msg.role === 'user' ? 'CMD' : 'RES'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex flex-col items-start animate-pulse">
             <span className="text-[8px] text-neutral-600 uppercase tracking-widest mb-2 block pl-1">Decrypting...</span>
             <div className="flex gap-1 pl-1">
               <div className="w-1 h-1 bg-neutral-600"></div>
               <div className="w-1 h-1 bg-neutral-600 animation-delay-200"></div>
               <div className="w-1 h-1 bg-neutral-600 animation-delay-400"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-obsidian border-t border-neutral-900 absolute bottom-[80px] left-0 right-0 w-full">
        <div className="flex items-center gap-4 bg-tungsten/30 border border-neutral-800 hover:border-neutral-700 transition-colors p-1 pl-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Enter command..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-white placeholder-neutral-700 font-mono py-3"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="p-3 text-neutral-500 hover:text-white disabled:opacity-30 transition-colors border-l border-neutral-800"
          >
            <Send className="w-3 h-3" strokeWidth={1} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Concierge;