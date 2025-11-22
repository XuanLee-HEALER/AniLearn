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
  const totalTime = completedDays.reduce((acc, day) => acc + 2, 0); 
  const progressPercent = Math.round((completedDays.length / days.length) * 100);

  const chartData = days.map(day => ({
    name: `${day.dayNumber}`,
    tasks: day.tasks.filter(t => t.isCompleted).length
  }));

  const StatCard = ({ icon: Icon, val, label, color }: any) => (
      <div className="bg-white dark:bg-slate-900 p-4 rounded-[20px] flex items-center gap-4 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className={`p-3 rounded-full ${color} bg-opacity-10 text-${color.split('-')[1]}-500`}>
              <Icon size={24} className={color.replace('bg', 'text').replace('100', '500')} />
          </div>
          <div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{val}</div>
              <div className="text-xs text-slate-400 font-bold uppercase">{label}</div>
          </div>
      </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Trophy} val={`${progressPercent}%`} label={t.completion} color="bg-yellow-100" />
        <StatCard icon={Flame} val={completedDays.length} label={t.daysStreak} color="bg-orange-100" />
        <StatCard icon={Clock} val={`${totalTime}h`} label={t.timeInvested} color="bg-sky-100" />
        <StatCard icon={Calendar} val={days.length} label={t.totalPlan} color="bg-green-100" />
      </div>

      <AnimeCard title={t.taskHistory}>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" tick={{fontSize: 10}} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                        <Bar dataKey="tasks" fill="#f472b6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
      </AnimeCard>

      <div className="space-y-2 pb-8">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 ml-1">{t.topicsCovered}</h3>
          {days.map((day, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-50 dark:border-slate-800">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${day.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      {day.dayNumber}
                  </div>
                  <div className="font-medium text-slate-700 dark:text-slate-300 truncate flex-1">
                      {day.topic}
                  </div>
                  {day.status === 'COMPLETED' && <div className="w-2 h-2 bg-green-500 rounded-full"/>}
              </div>
          ))}
      </div>
    </div>
  );
};