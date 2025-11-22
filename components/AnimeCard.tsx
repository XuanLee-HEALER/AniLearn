
import React from 'react';
import { Flower } from 'lucide-react';

interface AnimeCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  variant?: 'default' | 'solid';
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ children, className = '', title, variant = 'default' }) => {
  // Updated background classes for Light/Dark modes
  const bgClass = variant === 'solid' 
    ? 'bg-white dark:bg-slate-800 border-pink-200 dark:border-pink-900' 
    : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-pink-200/50 dark:border-pink-900/50';

  return (
    <div className={`${bgClass} border-2 rounded-2xl shadow-xl p-5 relative overflow-hidden transition-colors duration-300 flex flex-col ${className}`}>
        {/* Sakura decoration */}
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none -mr-4 -mt-4 text-pink-500">
            <Flower size={80} />
        </div>
        
        {title && (
            <div className="flex items-center gap-2 mb-4 border-b border-pink-100 dark:border-pink-900 pb-2 flex-shrink-0">
               <Flower size={18} className="text-pink-400 animate-pulse" />
               <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">
                  {title}
               </h3>
            </div>
        )}
        {/* 
            Removed 'h-full' from inner div to prevent forced stretching in auto-height contexts.
            Added 'flex-1' to ensure it fills available space if the parent card has a fixed height.
        */}
        <div className="relative z-10 flex-1 text-slate-700 dark:text-slate-300">
            {children}
        </div>
    </div>
  );
};
