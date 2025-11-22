import React from 'react';
import { LayoutDashboard, CalendarCheck, Map, X, Moon, Sun, Languages, Plus, FolderOpen, ChevronRight } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { TRANSLATIONS } from '../constants';
import { LearningPlanMetadata } from '../types';

// --- Bottom Navigation Bar (Material 3) ---

interface BottomNavProps {
    activeTab: string;
    onChangeTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
    const { language } = useConfig();
    const t = TRANSLATIONS[language];

    const navItems = [
        { id: 'daily', label: t.today, icon: CalendarCheck },
        { id: 'plan', label: t.roadmap, icon: Map },
        { id: 'dashboard', label: t.stats, icon: LayoutDashboard },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-around items-center px-2 z-40 safe-area-pb">
            {navItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onChangeTab(item.id)}
                        className="flex flex-col items-center gap-1 w-20 py-2"
                    >
                        <div className={`px-5 py-1 rounded-full transition-colors duration-300 ${isActive ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-200' : 'text-slate-500 dark:text-slate-400'}`}>
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-xs font-medium ${isActive ? 'text-pink-700 dark:text-pink-200' : 'text-slate-500 dark:text-slate-400'}`}>
                            {item.label}
                        </span>
                    </button>
                )
            })}
        </div>
    );
}

// --- Navigation Drawer (Material 3 Modal Drawer) ---

interface NavDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    plans: LearningPlanMetadata[];
    currentPlanId: string | null;
    onSelectPlan: (id: string) => void;
    onAddPlan: () => void;
}

export const NavDrawer: React.FC<NavDrawerProps> = ({
    isOpen, onClose, plans, currentPlanId, onSelectPlan, onAddPlan
}) => {
    const { theme, toggleTheme, language, setLanguage } = useConfig();
    const t = TRANSLATIONS[language];

    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            
            {/* Drawer Panel */}
            <div className={`fixed top-0 left-0 bottom-0 w-[300px] bg-white dark:bg-slate-900 z-[51] shadow-2xl transform transition-transform duration-300 flex flex-col rounded-r-3xl overflow-hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                     <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">ANILEARN</h2>
                     <button onClick={onClose} className="text-slate-500 hover:text-pink-500">
                        <X size={24} />
                     </button>
                </div>

                <div className="p-4">
                     <button 
                        onClick={() => { onAddPlan(); onClose(); }}
                        className="w-full h-14 rounded-2xl bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-200 font-bold flex items-center gap-3 px-4 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
                    >
                        <Plus size={24} />
                        {t.newProtocol}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4">
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400 px-2 mb-4 mt-2">{t.protocols}</div>
                    <div className="space-y-2">
                        {plans.map(plan => (
                            <button
                                key={plan.id}
                                onClick={() => { onSelectPlan(plan.id); onClose(); }}
                                className={`w-full p-4 rounded-2xl text-left transition-colors border ${currentPlanId === plan.id ? 'bg-slate-100 dark:bg-slate-800 border-transparent' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                            >
                                <div className="font-bold text-slate-700 dark:text-slate-200">{plan.title}</div>
                                <div className="text-xs text-slate-400 mt-1 flex justify-between">
                                    <span>{plan.topic}</span>
                                    <span>{plan.progress}%</span>
                                </div>
                                {currentPlanId === plan.id && (
                                    <div className="h-1 bg-pink-500 rounded-full mt-2 w-1/2" />
                                )}
                            </button>
                        ))}
                        {plans.length === 0 && (
                            <p className="text-center text-slate-400 italic text-sm py-4">{t.noPlans}</p>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                    <button onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Languages size={20} className="mb-1" />
                        <span className="text-xs font-bold">{language === 'en' ? 'English' : '中文'}</span>
                    </button>
                    <button onClick={toggleTheme} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {theme === 'light' ? <Moon size={20} className="mb-1"/> : <Sun size={20} className="mb-1"/>}
                        <span className="text-xs font-bold">{theme === 'light' ? 'Dark' : 'Light'}</span>
                    </button>
                </div>
            </div>
        </>
    );
}