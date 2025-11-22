import React from 'react';
import { Menu, MoreVertical } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

interface TopBarProps {
    title: string;
    onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title, onMenuClick }) => {
    return (
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 h-16 flex items-center justify-between shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">
                    {title}
                </h1>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                AL
            </div>
        </div>
    );
};