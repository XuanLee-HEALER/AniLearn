
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { LearningDay, Task, DailyRecap } from '../types';
import { CheckCircle2, Circle, ExternalLink, PlayCircle, Bot, BookOpen, Clock, Sparkles, PenLine, Eye, ChevronDown, ChevronUp, ArrowRight, ThumbsUp, XCircle } from 'lucide-react';
import { generateDailyRecap } from '../services/geminiService';
import { useConfig } from '../contexts/ConfigContext';
import { TRANSLATIONS } from '../constants';
import { AnimeCard } from './AnimeCard';

interface DailyViewProps {
  day: LearningDay;
  onUpdateDay: (updatedDay: LearningDay) => void;
  onCompleteDay: () => void;
}

// --- Task Item with Self-Check Logic ---
const TaskItem: React.FC<{ task: Task, onUpdate: (t: Task) => void }> = ({ task, onUpdate }) => {
    const [showAnswer, setShowAnswer] = useState(false);
    const [localAnswer, setLocalAnswer] = useState(task.userAnswer || '');
    const [expanded, setExpanded] = useState(!task.isCompleted);
    const { language } = useConfig();
    const t = TRANSLATIONS[language];

    const handleSelfCheck = (isCorrect: boolean) => {
        onUpdate({
            ...task,
            userAnswer: localAnswer,
            isVerified: true,
            isCompleted: isCorrect
        });
        if(isCorrect) setExpanded(false);
    };

    return (
        <div className={`mb-4 transition-all duration-500 ${task.isCompleted ? 'opacity-70' : 'opacity-100'}`}>
            <div 
                className={`rounded-2xl p-4 transition-colors border-2 ${task.isCompleted ? 'bg-slate-100 dark:bg-slate-800/50 border-transparent' : 'bg-white dark:bg-slate-800 border-pink-100 dark:border-pink-900'}`}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start gap-4 cursor-pointer">
                    <div className={`mt-0.5`}>
                        {task.isCompleted ? <CheckCircle2 className="text-green-500" size={24}/> : <Circle className="text-pink-400" size={24}/>}
                    </div>
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

                    {/* Self Check Interaction */}
                    {task.verificationQuestion && !task.isCompleted && (
                        <div className="bg-pink-50 dark:bg-pink-900/10 p-4 rounded-2xl">
                            <p className="text-sm font-medium text-pink-600 dark:text-pink-300 mb-2 flex items-center gap-2">
                                <Bot size={16}/> {t.senseiAsks}
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 italic font-serif">"{task.verificationQuestion}"</p>
                            
                            {!showAnswer ? (
                                <div className="space-y-3">
                                    <textarea 
                                        className="w-full text-base p-3 rounded-xl border border-pink-200 dark:border-pink-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-pink-400 outline-none"
                                        placeholder={t.typeAnswer}
                                        rows={2}
                                        value={localAnswer}
                                        onChange={(e) => setLocalAnswer(e.target.value)}
                                    />
                                    <button 
                                        onClick={() => setShowAnswer(true)}
                                        disabled={!localAnswer}
                                        className="w-full h-10 bg-pink-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Eye size={16}/> Check Answer
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Reference Answer</span>
                                        <p className="text-sm text-slate-800 dark:text-slate-200">{task.answerKey}</p>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleSelfCheck(false)}
                                            className="flex-1 h-10 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-600"
                                        >
                                            <XCircle size={16}/> Missed it
                                        </button>
                                        <button 
                                            onClick={() => handleSelfCheck(true)}
                                            className="flex-1 h-10 bg-green-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-600"
                                        >
                                            <ThumbsUp size={16}/> Got it!
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// --- Main View ---
export const DailyView: React.FC<DailyViewProps> = ({ day, onUpdateDay, onCompleteDay }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [recapData, setRecapData] = useState<DailyRecap | null>(null);
  const { language } = useConfig();
  const t = TRANSLATIONS[language];

  const handleTaskUpdate = (updatedTask: Task) => {
      const newTasks = day.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
      onUpdateDay({ ...day, tasks: newTasks });
  };

  const progress = Math.round((day.tasks.filter(t => t.isCompleted).length / day.tasks.length) * 100);

  const handleFinishDay = async () => {
    setIsSubmitting(true);
    const recap = await generateDailyRecap(day, language);
    setRecapData(recap);
    setIsSubmitting(false);
  };

  const handleCloseRecap = () => {
      setRecapData(null);
      onCompleteDay();
  };

  return (
    <div className="flex flex-col gap-6 pb-24 relative">
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
      <button
        disabled={progress < 100 || isSubmitting}
        onClick={handleFinishDay}
        className={`fixed bottom-24 right-4 h-14 px-6 rounded-2xl shadow-xl z-30 font-bold text-lg flex items-center justify-center gap-2 transition-all transform ${progress === 100 ? 'bg-pink-500 text-white scale-100' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 scale-90 opacity-50 pointer-events-none'}`}
      >
        {isSubmitting ? (
            <><Sparkles className="animate-spin"/> {t.calibrating}</>
        ) : (
            <><CheckCircle2/> {t.completeDay}</>
        )}
      </button>

      {/* Recap Dialog */}
      {recapData && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <AnimeCard className="w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up">
                  <div className="text-center mb-6">
                      <div className="inline-block p-3 bg-pink-100 dark:bg-pink-900/50 rounded-full mb-4">
                          <Sparkles className="text-pink-500" size={32}/>
                      </div>
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white">Day Complete!</h2>
                  </div>
                  
                  <div className="space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Summary</h4>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{recapData.summary}</p>
                      </div>

                      <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Next Steps / Extensions</h4>
                          <div className="space-y-2">
                              {recapData.extensions.map((ext, idx) => (
                                  <a key={idx} href={ext.url.startsWith('http') ? ext.url : `https://www.google.com/search?q=${encodeURIComponent(ext.url)}`} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="block p-3 bg-white dark:bg-slate-900 border border-pink-100 dark:border-pink-900 rounded-xl hover:shadow-md transition-shadow"
                                  >
                                      <div className="flex items-center justify-between mb-1">
                                          <span className="font-bold text-pink-600 dark:text-pink-400 text-sm">{ext.title}</span>
                                          <ExternalLink size={12} className="text-slate-400"/>
                                      </div>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{ext.description}</p>
                                  </a>
                              ))}
                          </div>
                      </div>
                      
                      <button 
                          onClick={handleCloseRecap}
                          className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl"
                      >
                          Continue Journey
                      </button>
                  </div>
              </AnimeCard>
          </div>
      )}
    </div>
  );
};
