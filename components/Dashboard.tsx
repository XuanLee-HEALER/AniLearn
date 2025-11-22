
import React from 'react';
import { LearningDay, LearningStatus } from '../types';
import { AnimeCard } from './AnimeCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Flame, Clock, Calendar } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { TRANSLATIONS } from '../constants';

interface DashboardProps {
  days: LearningDay[];
}

export const Dashboard: React.FC<DashboardProps> = ({ days }) => {
  const { language } = useConfig();
  const t = TRANSLATIONS[language];
  
  const completedDays = days.filter(d => d.status === LearningStatus.COMPLETED);
  const totalTime = completedDays.reduce((acc, day) => acc + 2, 0); // Assuming 2 hours per day as per plan
  const progressPercent = Math.round((completedDays.length / days.length) * 100);

  const chartData = days.map(day => ({
    name: `${t.day} ${day.dayNumber}`,
    completed: day.status === LearningStatus.COMPLETED ? 100 : 0,
    tasks: day.tasks.filter(t => t.isCompleted).length
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      <h1 className="text-4xl font-black text-pink-500 text-center mb-8 drop-shadow-sm">{t.myJourney}</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimeCard className="flex flex-col items-center justify-center py-8">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full text-yellow-500 mb-2"><Trophy size={24} /></div>
            <div className="text-3xl font-bold text-slate-700 dark:text-slate-200">{progressPercent}%</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">{t.completion}</div>
        </AnimeCard>
        <AnimeCard className="flex flex-col items-center justify-center py-8">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full text-orange-500 mb-2"><Flame size={24} /></div>
            <div className="text-3xl font-bold text-slate-700 dark:text-slate-200">{completedDays.length}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">{t.daysStreak}</div>
        </AnimeCard>
        <AnimeCard className="flex flex-col items-center justify-center py-8">
            <div className="bg-sky-100 dark:bg-sky-900/30 p-3 rounded-full text-sky-500 mb-2"><Clock size={24} /></div>
            <div className="text-3xl font-bold text-slate-700 dark:text-slate-200">{totalTime}h</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">{t.timeInvested}</div>
        </AnimeCard>
        <AnimeCard className="flex flex-col items-center justify-center py-8">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-500 mb-2"><Calendar size={24} /></div>
            <div className="text-3xl font-bold text-slate-700 dark:text-slate-200">{days.length}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">{t.totalPlan}</div>
        </AnimeCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimeCard title={t.taskHistory}>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.slice(0, completedDays.length + 5)}>
                        <XAxis dataKey="name" hide />
                        <YAxis />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="tasks" fill="#f472b6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </AnimeCard>

        <AnimeCard title={t.topicsCovered}>
            <div className="h-64 overflow-y-auto pr-2">
                <ul className="space-y-2">
                    {completedDays.map(day => (
                        <li key={day.dayNumber} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-pink-50 dark:bg-pink-900/20 p-2 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span className="font-bold">{t.day} {day.dayNumber}:</span> {day.topic}
                        </li>
                    ))}
                     {days.filter(d => d.status !== LearningStatus.COMPLETED).slice(0, 3).map(day => (
                        <li key={day.dayNumber} className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 p-2 rounded-lg">
                             <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span className="font-bold">{t.day} {day.dayNumber}:</span> {day.topic}
                        </li>
                    ))}
                </ul>
            </div>
        </AnimeCard>
      </div>
    </div>
  );
};
