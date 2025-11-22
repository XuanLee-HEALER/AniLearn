
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { LearningDay, Task } from '../types';
import { AnimeCard } from './AnimeCard';
import { CheckCircle2, Circle, ExternalLink, PlayCircle, Bot, BookOpen, Clock, Sparkles, PenLine, Eye } from 'lucide-react';
import { generateDailyRecap, validateUserAnswer } from '../services/geminiService';
import { useConfig } from '../contexts/ConfigContext';
import { TRANSLATIONS } from '../constants';

interface DailyViewProps {
  day: LearningDay;
  onUpdateDay: (updatedDay: LearningDay) => void;
  onCompleteDay: () => void;
}

// Inner Component for Individual Tasks to handle local input state
const TaskItem: React.FC<{ task: Task, onUpdate: (t: Task) => void }> = ({ task, onUpdate }) => {
    const [checking, setChecking] = useState(false);
    const [localAnswer, setLocalAnswer] = useState(task.userAnswer || '');
    const { language } = useConfig();
    const t = TRANSLATIONS[language];

    const handleCheck = async () => {
        if (!localAnswer.trim() || !task.verificationQuestion) return;
        setChecking(true);
        const result = await validateUserAnswer(task.verificationQuestion, localAnswer, language);
        
        onUpdate({
            ...task,
            userAnswer: localAnswer,
            aiFeedback: result.feedback,
            isVerified: result.correct,
            isCompleted: result.correct // Auto-complete if correct
        });
        setChecking(false);
    };

    return (
        <div className={`p-4 rounded-xl border-2 transition-all mb-4 ${task.isCompleted ? 'bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-slate-800 border-pink-100 dark:border-pink-900 hover:border-pink-300 dark:hover:border-pink-700'}`}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                    <button onClick={() => onUpdate({...task, isCompleted: !task.isCompleted})}>
                        {task.isCompleted ? <CheckCircle2 className="text-green-500" size={24}/> : <Circle className="text-pink-300" size={24}/>}
                    </button>
                    <div>
                        <h4 className={`font-bold ${task.isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{task.description}</h4>
                        <span className="text-xs text-pink-400 font-medium flex items-center gap-1">
                            <Clock size={12} /> {task.estimatedMinutes} {t.mins}
                        </span>
                    </div>
                </div>
            </div>

            {/* Resources Links */}
            {task.links && task.links.length > 0 && (
                <div className="ml-9 mb-4 flex flex-wrap gap-2">
                    {task.links.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" 
                           className="text-xs bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-2 py-1 rounded-md border border-sky-100 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/50 flex items-center gap-1">
                           {link.label.toLowerCase().includes('video') ? <PlayCircle size={12}/> : <ExternalLink size={12}/>}
                           {link.label}
                        </a>
                    ))}
                </div>
            )}

            {/* Interactive Question */}
            {task.verificationQuestion && (
                <div className="ml-9 bg-pink-50/50 dark:bg-pink-900/10 p-3 rounded-lg border border-pink-100 dark:border-pink-900/30">
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-2">
                        <Bot size={14} className="inline mr-1 text-pink-500"/> 
                        {t.senseiAsks} {task.verificationQuestion}
                    </p>
                    
                    {!task.isVerified ? (
                        <div className="space-y-2">
                            <textarea 
                                className="w-full text-sm p-2 rounded border border-pink-200 dark:border-pink-800 dark:bg-slate-900 dark:text-slate-200 focus:ring-pink-300 focus:outline-none"
                                placeholder={t.typeAnswer}
                                rows={2}
                                value={localAnswer}
                                onChange={(e) => setLocalAnswer(e.target.value)}
                            />
                            <button 
                                onClick={handleCheck}
                                disabled={checking || !localAnswer}
                                className="text-xs bg-pink-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-pink-600 disabled:opacity-50 flex items-center gap-1 ml-auto"
                            >
                                {checking ? <Sparkles className="animate-spin" size={12}/> : <Sparkles size={12}/>}
                                {t.aiCheck}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded text-xs text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800">
                            <p className="font-bold">{t.verified}</p>
                            <p>{task.aiFeedback}</p>
                        </div>
                    )}
                    
                    {task.aiFeedback && !task.isVerified && (
                         <div className="mt-2 bg-orange-50 dark:bg-orange-900/20 p-2 rounded text-xs text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                            <p>{task.aiFeedback}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export const DailyView: React.FC<DailyViewProps> = ({ day, onUpdateDay, onCompleteDay }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recapMessage, setRecapMessage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const { language } = useConfig();
  const t = TRANSLATIONS[language];

  const handleTaskUpdate = (updatedTask: Task) => {
      const newTasks = day.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
      onUpdateDay({ ...day, tasks: newTasks });
  };

  const progress = Math.round((day.tasks.filter(t => t.isCompleted).length / day.tasks.length) * 100);

  const handleFinishDay = async () => {
    setIsSubmitting(true);
    const msg = await generateDailyRecap(day, language);
    setRecapMessage(msg);
    setTimeout(() => {
        onCompleteDay();
        setIsSubmitting(false);
        setRecapMessage(null);
    }, 4000);
  };

  if (recapMessage) {
    return (
        <div className="h-full flex items-center justify-center">
            <AnimeCard className="max-w-md text-center animate-bounce-slow border-4 border-pink-300 dark:border-pink-700">
                <div className="text-6xl mb-4">🎊</div>
                <h2 className="text-3xl font-black text-pink-500 mb-2">{t.missionClear}</h2>
                <p className="text-lg text-slate-700 dark:text-slate-300">{recapMessage}</p>
            </AnimeCard>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-20">
      {/* 1. Header - Full Width */}
      <div className="lg:col-span-4">
        <AnimeCard className="bg-gradient-to-r from-pink-50 to-white dark:from-slate-900 dark:to-slate-800 border-l-8 border-l-pink-400">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">{t.day} {day.dayNumber}</span>
                 <span className="text-slate-400 text-sm font-medium uppercase tracking-widest">{t.focusMode}</span>
              </div>
              <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100">{day.topic}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{day.summary}</p>
            </div>
            <div className="flex items-center gap-4">
                 <div className="text-right hidden md:block">
                    <div className="text-xs text-slate-400 uppercase">{t.timeBudget}</div>
                    <div className="text-2xl font-black text-sky-500">2h 00m</div>
                 </div>
            </div>
          </div>
        </AnimeCard>
      </div>

      {/* 2. Task List - Waterfall Main Column */}
      <div className="lg:col-span-2 flex flex-col gap-4">
         <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur p-2 rounded-xl border border-pink-100 dark:border-pink-900 sticky top-4 z-20 shadow-sm">
            <h3 className="font-bold text-pink-500 flex items-center gap-2 px-2">
                <BookOpen size={20}/> {t.learningMissions}
            </h3>
         </div>
         
         <div>
            {day.tasks.map((task) => (
                <TaskItem key={task.id} task={task} onUpdate={handleTaskUpdate} />
            ))}
         </div>
      </div>

      {/* 3. Side Widgets - Notes & Progress */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Progress Card - Redesigned for Theme Compatibility */}
        <div className="bg-white dark:bg-slate-800 border-2 border-pink-100 dark:border-pink-900 rounded-2xl p-5 shadow-lg flex items-center justify-between">
            <div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 uppercase font-bold tracking-wide">{t.dailyCompletion}</div>
                <div className="text-5xl font-black text-pink-500 drop-shadow-sm">{progress}%</div>
            </div>
            <div className="h-20 w-20 rounded-full border-8 border-pink-200 dark:border-pink-900/50 flex items-center justify-center bg-pink-50 dark:bg-slate-900 relative overflow-hidden">
                 {/* Simple progress fill based on height */}
                 <div className="absolute bottom-0 left-0 right-0 bg-pink-500 opacity-20 transition-all duration-500" style={{ height: `${progress}%` }}></div>
                 
                 {progress === 100 ? (
                     <CheckCircle2 className="text-green-500 animate-bounce" size={32}/>
                 ) : (
                     <span className="font-bold text-slate-600 dark:text-slate-300 z-10 relative text-lg">
                        {day.tasks.filter(t=>t.isCompleted).length}<span className="text-slate-400 text-sm">/{day.tasks.length}</span>
                     </span>
                 )}
            </div>
        </div>

        {/* Notes with Markdown Editor */}
        <AnimeCard title={t.trainingLog} className="flex-1 flex flex-col">
            <div className="flex justify-end mb-2">
                <button 
                    onClick={() => setEditMode(!editMode)}
                    className="text-xs text-pink-500 hover:text-pink-600 flex items-center gap-1 bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded"
                >
                    {editMode ? <Eye size={12}/> : <PenLine size={12}/>}
                    {editMode ? t.preview : t.edit}
                </button>
            </div>
            
            {editMode ? (
                <textarea 
                    className="w-full flex-1 min-h-[300px] p-4 rounded-xl bg-yellow-50 dark:bg-slate-800 border border-yellow-200 dark:border-slate-700 focus:ring-2 focus:ring-pink-300 outline-none resize-none font-mono text-sm text-slate-700 dark:text-slate-200 shadow-inner"
                    placeholder={t.placeholderLog}
                    value={day.userNotes || ''}
                    onChange={(e) => onUpdateDay({ ...day, userNotes: e.target.value })}
                />
            ) : (
                <div className="w-full flex-1 min-h-[300px] p-4 rounded-xl bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 overflow-y-auto prose prose-sm prose-pink dark:prose-invert max-w-none">
                    {day.userNotes ? (
                        <ReactMarkdown>{day.userNotes}</ReactMarkdown>
                    ) : (
                        <p className="text-slate-400 italic">{t.placeholderLog}</p>
                    )}
                </div>
            )}
        </AnimeCard>
        
        <button
            disabled={progress < 100 || isSubmitting}
            onClick={handleFinishDay}
            className={`
                w-full py-4 rounded-xl font-black text-xl text-white shadow-xl transition-all transform
                ${progress === 100 
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:scale-105 hover:shadow-pink-500/40' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'}
            `}
        >
            {isSubmitting ? t.syncing : t.completeDay}
        </button>
      </div>
    </div>
  );
};
