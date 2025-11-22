import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { LearningDay, Task } from '../types';
import { AnimeCard } from './AnimeCard';
import { CheckCircle2, Circle, ExternalLink, PlayCircle, Bot, BookOpen, Clock, Sparkles, PenLine, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { generateDailyRecap, validateUserAnswer } from '../services/geminiService';
import { useConfig } from '../contexts/ConfigContext';
import { TRANSLATIONS } from '../constants';

interface DailyViewProps {
  day: LearningDay;
  onUpdateDay: (updatedDay: LearningDay) => void;
  onCompleteDay: () => void;
}

const TaskItem: React.FC<{ task: Task, onUpdate: (t: Task) => void }> = ({ task, onUpdate }) => {
    const [checking, setChecking] = useState(false);
    const [localAnswer, setLocalAnswer] = useState(task.userAnswer || '');
    const [expanded, setExpanded] = useState(!task.isCompleted);
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
            isCompleted: result.correct
        });
        setChecking(false);
        if(result.correct) setExpanded(false);
    };

    return (
        <div className={`mb-4 transition-all duration-500 ${task.isCompleted ? 'opacity-80' : 'opacity-100'}`}>
            <div 
                className={`rounded-2xl p-4 transition-colors border-2 ${task.isCompleted ? 'bg-slate-100 dark:bg-slate-800/50 border-transparent' : 'bg-white dark:bg-slate-800 border-pink-100 dark:border-pink-900'}`}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start gap-4 cursor-pointer">
                    <button onClick={(e) => { e.stopPropagation(); onUpdate({...task, isCompleted: !task.isCompleted}); }}>
                        {task.isCompleted ? <CheckCircle2 className="text-green-500" size={24}/> : <Circle className="text-pink-400" size={24}/>}
                    </button>
                    <div className="flex-1">
                        <h4 className={`font-bold text-base ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100'}`}>{task.description}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                <Clock size={12} /> {task.estimatedMinutes}{t.mins}
                            </span>
                        </div>
                    </div>
                    {expanded ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
                </div>
            </div>

            {expanded && (
                <div className="mt-2 ml-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-3 animate-slide-up">
                    {/* Links */}
                    {task.links && task.links.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {task.links.map((link, i) => (
                                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" 
                                   className="text-xs font-bold bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 px-3 py-2 rounded-lg flex items-center gap-2 active:scale-95 transition-transform">
                                   {link.label.toLowerCase().includes('video') ? <PlayCircle size={14}/> : <ExternalLink size={14}/>}
                                   {link.label}
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Interactive Question */}
                    {task.verificationQuestion && (
                        <div className="bg-pink-50 dark:bg-pink-900/10 p-4 rounded-2xl">
                            <p className="text-sm font-medium text-pink-600 dark:text-pink-300 mb-3 flex items-center gap-2">
                                <Bot size={16}/> {t.senseiAsks}
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 italic">"{task.verificationQuestion}"</p>
                            
                            {!task.isVerified ? (
                                <div className="space-y-3">
                                    <textarea 
                                        className="w-full text-base p-3 rounded-xl border border-pink-200 dark:border-pink-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-pink-400 outline-none"
                                        placeholder={t.typeAnswer}
                                        rows={3}
                                        value={localAnswer}
                                        onChange={(e) => setLocalAnswer(e.target.value)}
                                    />
                                    <button 
                                        onClick={handleCheck}
                                        disabled={checking || !localAnswer}
                                        className="w-full h-10 bg-pink-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                                    >
                                        {checking ? <Sparkles className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                                        {t.aiCheck}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl text-sm">
                                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-bold mb-1">
                                        <CheckCircle2 size={16}/> {t.verified}
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300">{task.aiFeedback}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export const DailyView: React.FC<DailyViewProps> = ({ day, onUpdateDay, onCompleteDay }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    await generateDailyRecap(day, language); // Fire and forget for now, or show toast
    setTimeout(() => {
        onCompleteDay();
        setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero / Header */}
      <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
              <span className="bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold px-2 py-1 rounded-md">{t.day} {day.dayNumber}</span>
              <span className="text-pink-500 text-xs font-bold tracking-wider uppercase">{t.focusMode}</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{day.topic}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{day.summary}</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">{t.dailyCompletion}</span>
              <span className="text-2xl font-black text-pink-500">{progress}%</span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-pink-500 transition-all duration-500" style={{width: `${progress}%`}} />
          </div>
      </div>

      {/* Tasks Feed */}
      <div>
         <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-pink-500"/> {t.learningMissions}
         </h3>
         <div className="flex flex-col">
            {day.tasks.map((task) => (
                <TaskItem key={task.id} task={task} onUpdate={handleTaskUpdate} />
            ))}
         </div>
      </div>

      {/* Log Section */}
      <div className="mb-8">
         <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <PenLine size={20} className="text-pink-500"/> {t.trainingLog}
             </h3>
             <button onClick={() => setEditMode(!editMode)} className="text-pink-500 text-sm font-bold">
                 {editMode ? t.preview : t.edit}
             </button>
         </div>
         
         <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 min-h-[200px] shadow-sm border border-slate-100 dark:border-slate-800">
            {editMode ? (
                <textarea 
                    className="w-full h-full min-h-[200px] bg-transparent outline-none text-slate-700 dark:text-slate-300 resize-none"
                    value={day.userNotes || ''}
                    onChange={(e) => onUpdateDay({ ...day, userNotes: e.target.value })}
                    placeholder={t.placeholderLog}
                />
            ) : (
                <div className="prose prose-sm prose-pink dark:prose-invert max-w-none">
                     {day.userNotes ? <ReactMarkdown>{day.userNotes}</ReactMarkdown> : <p className="text-slate-400 italic">{t.placeholderLog}</p>}
                </div>
            )}
         </div>
      </div>

      {/* FAB / Action Button */}
      <div className="h-12"></div> {/* Spacer */}
      <button
        disabled={progress < 100 || isSubmitting}
        onClick={handleFinishDay}
        className={`fixed bottom-24 right-4 left-4 md:left-auto md:w-64 h-14 rounded-full shadow-xl z-30 font-bold text-lg flex items-center justify-center gap-2 transition-all transform ${progress === 100 ? 'bg-pink-500 text-white translate-y-0' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 translate-y-10 opacity-0 pointer-events-none'}`}
      >
        {isSubmitting ? (
            <><Sparkles className="animate-spin"/> {t.syncing}</>
        ) : (
            <><CheckCircle2/> {t.completeDay}</>
        )}
      </button>
    </div>
  );
};