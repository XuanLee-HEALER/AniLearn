
import React from 'react';
import { LayoutDashboard, CalendarCheck, Map, Moon, Sun, Languages, Plus, FolderOpen, ChevronRight } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { TRANSLATIONS } from '../constants';
import { LearningPlanMetadata } from '../types';

interface NavProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  plans: LearningPlanMetadata[];
  currentPlanId: string | null;
  onSelectPlan: (id: string) => void;
  onAddPlan: () => void;
}

export const Navigation: React.FC<NavProps> = ({ 
  activeTab, 
  onChangeTab, 
  plans, 
  currentPlanId,
  onSelectPlan,
  onAddPlan
}) => {
  const { theme, toggleTheme, language, setLanguage } = useConfig();
  const t = TRANSLATIONS[language];

  const mainItems = [
    { id: 'daily', label: t.today, icon: CalendarCheck },
    { id: 'plan', label: t.roadmap, icon: Map },
    { id: 'dashboard', label: t.stats, icon: LayoutDashboard },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-16 md:w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-pink-200 dark:border-pink-900 z-50 flex flex-col shadow-xl transition-all duration-300">
      {/* Logo Area */}
      <div className="p-4 md:p-6 border-b border-pink-100 dark:border-pink-900/50">
         <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-sky-400 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-pink-500/30">
                 AL
             </div>
             <span className="hidden md:block font-black text-slate-700 dark:text-slate-200 tracking-wider">ANILEARN</span>
         </div>
      </div>

      {/* Action: Add New Protocol */}
      <div className="p-2 md:p-4">
        <button 
            onClick={onAddPlan}
            className="w-full flex items-center justify-center md:justify-start gap-2 bg-slate-900 dark:bg-pink-600 text-white p-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-slate-900/20 dark:shadow-pink-600/20"
        >
            <Plus size={20} />
            <span className="hidden md:block font-bold text-sm">{t.newProtocol}</span>
        </button>
      </div>

      {/* Protocol History List */}
      <div className="flex-1 overflow-y-auto px-2 md:px-4 py-2 space-y-1">
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            <FolderOpen size={12}/> {t.protocols}
        </div>
        
        {plans.map(plan => (
            <button
                key={plan.id}
                onClick={() => onSelectPlan(plan.id)}
                className={`
                    w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left group
                    ${currentPlanId === plan.id 
                        ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300 border border-pink-100 dark:border-pink-900/50' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
                `}
            >
                <div className={`w-1 h-8 rounded-full ${currentPlanId === plan.id ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <div className="hidden md:block overflow-hidden">
                    <div className="font-bold text-sm truncate">{plan.title}</div>
                    <div className="text-[10px] opacity-70">{plan.progress}% • {new Date(plan.createdAt).toLocaleDateString()}</div>
                </div>
                {currentPlanId === plan.id && <ChevronRight size={14} className="ml-auto hidden md:block text-pink-400"/>}
            </button>
        ))}

        {plans.length === 0 && (
             <div className="hidden md:block text-xs text-slate-400 text-center py-4 italic opacity-50">
                {t.noPlans}
             </div>
        )}
      </div>

      {/* Navigation Links (Only show if a plan is active) */}
      {currentPlanId && (
        <div className="p-2 md:p-4 border-t border-pink-100 dark:border-pink-900/50 space-y-1">
            {mainItems.map((item) => (
                <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`
                    w-full flex items-center justify-center md:justify-start gap-3 p-2 md:p-3 rounded-xl transition-all
                    ${activeTab === item.id 
                        ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/10' 
                        : 'text-slate-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-slate-800'}
                `}
                >
                    <item.icon size={20} className={activeTab === item.id ? 'text-pink-500' : ''}/>
                    <span className="hidden md:block text-sm font-bold">{item.label}</span>
                </button>
            ))}
        </div>
      )}

      {/* Footer Config */}
      <div className="p-4 border-t border-pink-100 dark:border-pink-900/50 flex md:grid grid-cols-2 gap-2">
        <button 
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="p-2 rounded-lg text-slate-400 hover:text-pink-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
        >
            <Languages size={18} />
        </button>
        <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-pink-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
        >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

    </div>
  );
};
