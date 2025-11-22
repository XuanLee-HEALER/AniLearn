import React from 'react';
import { LearningDay, LearningStatus } from '../types';
import { Lock, CheckCircle2, PlayCircle } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { TRANSLATIONS } from '../constants';

interface PlanViewProps {
  days: LearningDay[];
}

export const PlanView: React.FC<PlanViewProps> = ({ days }) => {
  const { language } = useConfig();
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-4 pb-6">
        <div className="text-center py-4">
             <h2 className="text-2xl font-black text-slate-800 dark:text-white">{t.roadToMastery}</h2>
             <p className="text-slate-500 text-sm">{days.length} {t.missions} Total</p>
        </div>

        <div className="relative pl-4 space-y-8 before:absolute before:left-[27px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {days.map((day) => {
                const isLocked = day.status === LearningStatus.LOCKED;
                const isCompleted = day.status === LearningStatus.COMPLETED;
                const isCurrent = day.status === LearningStatus.PENDING;

                return (
                    <div key={day.dayNumber} className={`relative pl-8 transition-opacity ${isLocked ? 'opacity-60' : 'opacity-100'}`}>
                        {/* Timeline Dot */}
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 flex items-center justify-center bg-white dark:bg-slate-900 z-10 ${isCompleted ? 'border-green-500' : isCurrent ? 'border-pink-500' : 'border-slate-300 dark:border-slate-700'}`}>
                            {isCompleted && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                            {isCurrent && <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />}
                        </div>

                        <div className={`p-5 rounded-[24px] ${isCurrent ? 'bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-900' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${isCurrent ? 'bg-pink-100 text-pink-700' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                    {t.day} {day.dayNumber}
                                </span>
                                {isLocked && <Lock size={14} className="text-slate-400"/>}
                                {isCompleted && <CheckCircle2 size={18} className="text-green-500"/>}
                                {isCurrent && <PlayCircle size={18} className="text-pink-500"/>}
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg leading-tight mb-1">{day.topic}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{day.summary}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};