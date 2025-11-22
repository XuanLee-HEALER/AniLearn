
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { DailyView } from './components/DailyView';
import { Dashboard } from './components/Dashboard';
import { PlanView } from './components/PlanView';
import { CreatePlanModal } from './components/CreatePlanModal';
import { AnimeCard } from './components/AnimeCard';
import { generateDetailedPlan } from './services/geminiService';
import { savePlan, loadPlan, getPlanIndex } from './services/storage';
import { LearningDay, LearningStatus, LearningPlanMetadata, LearningPlan } from './types';
import { Sparkles, Loader2, RefreshCcw, Play } from 'lucide-react';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';
import { TRANSLATIONS } from './constants';

const AppContent: React.FC = () => {
  const [activePlan, setActivePlan] = useState<LearningPlan | null>(null);
  const [planList, setPlanList] = useState<LearningPlanMetadata[]>([]);
  const [view, setView] = useState<string>('intro'); 
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { language } = useConfig();
  const t = TRANSLATIONS[language];
  
  // Dynamic Background
  const [bgImage, setBgImage] = useState<string>('');
  const bgOptions = [
    'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1614726365723-49cfae9476cc?q=80&w=2574&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560972550-aba3456b5564?q=80&w=2670&auto=format&fit=crop',
  ];

  // Initialization
  useEffect(() => {
    setPlanList(getPlanIndex());
    setBgImage(bgOptions[new Date().getDate() % bgOptions.length]);
  }, []);

  // When active plan changes, determine where to go
  useEffect(() => {
    if (activePlan) {
       // Find first pending day
       const pendingIdx = activePlan.days.findIndex(d => d.status === LearningStatus.PENDING);
       // If view is still 'intro' or 'loading', switch to daily
       if (view === 'intro' || view === 'loading') {
           setView('daily');
       }
    }
  }, [activePlan]);

  const handleCreatePlan = async (topic: string, context: string) => {
    setIsCreating(true);
    try {
      const newPlan = await generateDetailedPlan(topic, context, 14, language);
      savePlan(newPlan);
      
      setPlanList(getPlanIndex());
      setActivePlan(newPlan);
      setShowCreateModal(false);
      setView('daily');
    } catch (error) {
      console.error(error);
      alert("Failed to generate plan. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectPlan = (id: string) => {
      const plan = loadPlan(id);
      if (plan) {
          setActivePlan(plan);
          setView('daily');
      }
  };

  const updateDay = (updatedDay: LearningDay) => {
    if (!activePlan) return;
    
    const newDays = [...activePlan.days];
    newDays[updatedDay.dayNumber - 1] = updatedDay;
    
    const updatedPlan = { ...activePlan, days: newDays };
    setActivePlan(updatedPlan);
    savePlan(updatedPlan);
    setPlanList(getPlanIndex()); // Update progress in sidebar
  };

  const completeDay = () => {
    if (!activePlan) return;
    
    const currentDayIdx = activePlan.days.findIndex(d => d.dayNumber === activePlan.days.find(dd => dd.status === LearningStatus.PENDING)?.dayNumber);
    if (currentDayIdx === -1) return;

    const newDays = [...activePlan.days];
    newDays[currentDayIdx] = {
        ...newDays[currentDayIdx],
        status: LearningStatus.COMPLETED,
        completionDate: new Date().toISOString(),
    };
    
    if (currentDayIdx + 1 < newDays.length) {
        newDays[currentDayIdx + 1].status = LearningStatus.PENDING;
    } else {
        setView('dashboard');
    }
    
    const updatedPlan = { ...activePlan, days: newDays };
    setActivePlan(updatedPlan);
    savePlan(updatedPlan);
    setPlanList(getPlanIndex());
  };

  const getCurrentDay = () => {
      if (!activePlan) return null;
      return activePlan.days.find(d => d.status === LearningStatus.PENDING) || activePlan.days[activePlan.days.length - 1];
  };

  return (
    <div className="flex min-h-screen relative bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000 opacity-100 dark:opacity-60" style={{backgroundImage: `url(${bgImage})`}} />
      <div className="fixed inset-0 z-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-[2px]" />

      <div className="relative z-20 flex w-full h-full">
          
          {/* Left Sidebar */}
          <Navigation 
            activeTab={view} 
            onChangeTab={setView} 
            plans={planList}
            currentPlanId={activePlan?.id || null}
            onSelectPlan={handleSelectPlan}
            onAddPlan={() => setShowCreateModal(true)}
          />
          
          {/* Main Content Area */}
          <main className="flex-1 ml-16 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen pb-24 md:pb-8 scroll-smooth">
            
            {view === 'intro' && (
                 <div className="flex flex-col items-center justify-center min-h-full py-10">
                    {/* Added h-fit and max-w constraints to prevent stretching */}
                    <AnimeCard className="max-w-lg w-full h-fit text-center py-12 border-4 border-pink-200 dark:border-pink-900/50 shadow-2xl shadow-pink-500/20">
                        <div className="mb-6 inline-block p-4 bg-white dark:bg-slate-800 rounded-full shadow-lg shadow-pink-200 dark:shadow-pink-900/50">
                            <Sparkles size={48} className="text-pink-500" />
                        </div>
                        <h1 className="text-5xl font-black text-slate-800 dark:text-white mb-4 tracking-tighter">
                            {t.introTitle}
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 font-medium">
                            {t.introSubtitle} <br/>
                            <span className="text-sm text-slate-400">{t.introDesc}</span>
                        </p>

                        {planList.length > 0 ? (
                            <div className="flex flex-col items-center gap-4 animate-fade-in">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">{t.resume}</p>
                                <button
                                    onClick={() => handleSelectPlan(planList[0].id)}
                                    className="px-12 py-4 bg-pink-500 text-white font-black text-2xl rounded-2xl shadow-xl shadow-pink-500/30 hover:scale-105 hover:shadow-pink-500/50 active:scale-95 transition-all flex items-center gap-3 mx-auto"
                                >
                                    <Play size={28} fill="currentColor" />
                                    <span>{t.resume}</span>
                                </button>
                                <div className="text-center">
                                    <p className="font-bold text-slate-700 dark:text-slate-200">{planList[0].title}</p>
                                    <div className="text-xs text-pink-500 font-mono">
                                        {planList[0].progress}% COMPLETE
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setShowCreateModal(true)}
                                className="px-8 py-4 bg-pink-600 text-white font-bold text-xl rounded-full shadow-xl hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                            >
                                <RefreshCcw size={20} /> {t.initialize}
                            </button>
                        )}
                    </AnimeCard>
                 </div>
            )}

            {view === 'daily' && activePlan && (
                <DailyView 
                    day={getCurrentDay()!} 
                    onUpdateDay={updateDay}
                    onCompleteDay={completeDay}
                />
            )}
            
            {view === 'plan' && activePlan && (
                <PlanView days={activePlan.days} />
            )}
            
            {view === 'dashboard' && activePlan && (
                <Dashboard days={activePlan.days} />
            )}
          </main>
      </div>

      {/* Modals */}
      {showCreateModal && (
          <CreatePlanModal 
            onClose={() => setShowCreateModal(false)} 
            onCreate={handleCreatePlan}
            isGenerating={isCreating}
          />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <ConfigProvider>
    <AppContent />
  </ConfigProvider>
);

export default App;
