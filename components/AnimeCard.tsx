import React from 'react';
import { Flower } from 'lucide-react';

interface AnimeCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ children, className = '', title, variant = 'elevated' }) => {
  
  // Material 3 Style mapping
  let baseStyles = "rounded-[20px] p-5 relative overflow-hidden transition-all duration-300 flex flex-col";
  let variantStyles = "";

  switch(variant) {
      case 'outlined':
          variantStyles = "bg-transparent border border-slate-200 dark:border-slate-700";
          break;
      case 'filled':
          variantStyles = "bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-slate-100";
          break;
      case 'elevated':
      default:
          variantStyles = "bg-white dark:bg-slate-900 shadow-md dark:shadow-none dark:border dark:border-slate-800";
          break;
  }

  return (
    <div className={`${baseStyles} ${variantStyles} ${className}`}>
        {title && (
            <div className="flex items-center gap-2 mb-4 pb-2 flex-shrink-0">
               <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {title}
               </h3>
            </div>
        )}
        <div className="relative z-10 flex-1 text-slate-700 dark:text-slate-300">
            {children}
        </div>
    </div>
  );
};