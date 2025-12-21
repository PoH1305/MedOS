
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Message, SmartwatchMetrics } from '../types';
import { gemini, GroundingSource } from '../services/gemini';
import { db } from '../services/database';

interface ChatMessage extends Message {
  sources?: GroundingSource[];
  isAnalysis?: boolean;
}

interface ChatInterfaceProps {
  user: UserProfile;
  isWatchConnected?: boolean;
  watchMetrics?: SmartwatchMetrics;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, isWatchConnected, watchMetrics }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await db.getAll<ChatMessage>('chat_history');
      if (history.length === 0) {
        const welcome: ChatMessage = {
          id: 'welcome',
          role: 'model',
          content: "I'm MedOS. Ask about your bio-metrics, or upload a lab report for an instant clinical breakdown.",
          timestamp: new Date(),
        };
        setMessages([welcome]);
        await db.save('chat_history', welcome);
      } else {
        setMessages(history.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userPrompt = input;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userPrompt,
      timestamp: new Date(),
    };

    const historyForAI = messages
      .filter((m, i) => !(i === 0 && m.role === 'model'))
      .map(m => ({ role: m.role, parts: [{ text: m.content }] }));
    
    setMessages(prev => [...prev, userMsg]);
    await db.save('chat_history', userMsg);
    setInput('');
    setIsLoading(true);

    try {
      const response = await gemini.chat(userPrompt, user, historyForAI, isWatchConnected ? watchMetrics : undefined);
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text,
        timestamp: new Date(),
        isRedFlag: response.isRedFlag,
        sources: response.sources
      };
      setMessages(prev => [...prev, modelMsg]);
      await db.save('chat_history', modelMsg);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Analyzed document: ${file.name}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      try {
        const result = await gemini.analyzeReport(base64Data, file.type, user);
        
        const content = `**Lab Report Analysis: ${result.summary}**\n\n` +
          `**Clinical Significance:**\n${result.clinicalUse}\n\n` +
          `**Bio-Performance Impact:**\n${result.bioImpact}\n\n` +
          `**Recommended Questions for your Doctor:**\n` +
          result.recommendedQuestions?.map((q: string) => `• ${q}`).join('\n');

        const modelMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: content,
          timestamp: new Date(),
          isAnalysis: true
        };
        
        setMessages(prev => [...prev, modelMsg]);
        await db.save('chat_history', userMsg);
        await db.save('chat_history', modelMsg);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto bg-white rounded-[32px] border shadow-xl overflow-hidden relative">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
        <h2 className="text-8xl font-black rotate-[-15deg] uppercase tracking-tighter">Neural Core</h2>
      </div>

      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white relative z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-widest leading-none">MedOS Intel</h3>
            <span className="text-[7px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Bio-AI Node</span>
          </div>
          {isWatchConnected && (
            <div className="ml-2 flex items-center gap-2 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-in fade-in zoom-in">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Bio-Sync Active</span>
            </div>
          )}
        </div>
        <button onClick={() => db.clearStore('chat_history').then(() => window.location.reload())} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase transition-colors">Reset Session</button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 relative z-10 scroll-smooth">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[90%] rounded-2xl p-4 text-xs font-medium leading-relaxed shadow-sm ${
              m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border text-slate-800 rounded-tl-none'
            } ${m.isAnalysis ? 'border-indigo-200 bg-indigo-50/30' : ''}`}>
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {m.sources.slice(0, 2).map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" className="text-[8px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase hover:bg-slate-200 transition-colors">Source {i+1}</a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 py-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></div>
            </div>
            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">Analyzing Bio-Data...</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white relative z-10">
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
          
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isWatchConnected ? "Ask based on your bio-metrics..." : "Ask or upload a document..."}
              className="w-full bg-slate-50 border rounded-xl pl-4 pr-10 py-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              disabled={isLoading}
            />
            {isWatchConnected && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
            )}
          </div>
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()} 
            className="px-6 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
