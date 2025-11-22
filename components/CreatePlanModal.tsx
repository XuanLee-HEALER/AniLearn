
import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { TRANSLATIONS } from '../constants';
import { AnimeCard } from './AnimeCard';

interface CreatePlanModalProps {
  onClose: () => void;
  onCreate: (topic: string, context: string) => void;
  isGenerating: boolean;
}

export const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ onClose, onCreate, isGenerating }) => {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const { language } = useConfig();
  const t = TRANSLATIONS[language];
  const MAX_CHARS = 2000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic && context) {
        onCreate(topic, context);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Constrained max-height and flex layout for internal scrolling */}
      <AnimeCard className="w-full max-w-lg max-h-[85vh] relative flex flex-col" variant="solid">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-pink-500 z-20">
          <X size={24} />
        </button>
        
        <div className="mb-4 flex-shrink-0">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles className="text-pink-500"/> {t.newProtocol}
            </h2>
            <p className="text-slate-500 text-sm mt-1">{t.newProtocolDesc}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto p-1 -ml-1 pr-2 -mr-2">
            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.learningTopic}
                </label>
                <input 
                    type="text" 
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Python Data Science, Japanese History..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-pink-200 dark:border-pink-900 focus:ring-2 focus:ring-pink-500 outline-none"
                />
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                        {t.contextDetails}
                    </label>
                    <span className={`text-xs ${context.length >= MAX_CHARS ? 'text-red-500' : 'text-slate-400'}`}>
                        {context.length}/{MAX_CHARS}
                    </span>
                </div>
                <textarea 
                    required
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    maxLength={MAX_CHARS}
                    placeholder="e.g., I have 10 days, 2 hours a day. I already know basics..."
                    rows={6}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-pink-200 dark:border-pink-900 focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                />
            </div>

            <div className="pt-2 pb-2 mt-auto">
                <button 
                    type="submit" 
                    disabled={isGenerating}
                    className="w-full py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    {isGenerating ? (
                        <>
                           <span className="animate-spin">⏳</span> {t.calibrating}
                        </>
                    ) : (
                        t.initialize
                    )}
                </button>
            </div>
        </form>
      </AnimeCard>
    </div>
  );
};
