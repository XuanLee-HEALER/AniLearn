
import React from 'react';
import { LearningDay, LearningStatus } from '../types';
import { AnimeCard } from './AnimeCard';
import { Lock, CheckCircle2, CircleDashed } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { TRANSLATIONS } from '../constants';

interface PlanViewProps {
  days: LearningDay[];
}

export const PlanView: React.FC<PlanViewProps> = ({ days }) => {
  const { language } = useConfig();
  const t = TRANSLATIONS[language];

  return (
    <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white drop-shadow-md mb-2">{t.masterPlan}</h1>
            <p className="text-white/90 font-medium bg-black/20 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
                {t.roadToMastery}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {days.map((day) => {
                const isLocked = day.status === LearningStatus.LOCKED;
                const isCompleted = day.status === LearningStatus.COMPLETED;
                const isCurrent = day.status === LearningStatus.PENDING;

                return (
                    <AnimeCard 
                        key={day.dayNumber} 
                        className={`
                            transition-transform hover:-translate-y-1
                            ${isCurrent ? 'border-pink-400 ring-4 ring-pink-200 dark:ring-pink-800' : ''}
                            ${isLocked ? 'opacity-70 grayscale' : ''}
                        `}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className={`
                                text-xs font-bold px-2 py-1 rounded-md
                                ${isCompleted ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' : isCurrent ? 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}
                            `}>
                                {t.day} {day.dayNumber}
                            </span>
                            {isLocked && <Lock size={16} className="text-slate-400" />}
                            {isCompleted && <CheckCircle2 size={20} className="text-green-500" />}
                            {isCurrent && <CircleDashed size={20} className="text-pink-500 animate-spin-slow" />}
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 leading-tight">{day.topic}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">{day.summary}</p>
                        
                        <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <span className="text-xs text-slate-400">{day.tasks.length} {t.missions}</span>
                            {isCurrent && (
                                <span className="text-xs font-bold text-pink-500">{t.inProgress}</span>
                            )}
                        </div>
                    </AnimeCard>
                );
            })}
        </div>
    </div>
  );
};
