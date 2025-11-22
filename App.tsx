import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { BottomNav, NavDrawer } from './components/Navigation';
import { SplashScreen } from './components/SplashScreen';
import { DailyView } from './components/DailyView';
import { Dashboard } from './components/Dashboard';
import { PlanView } from './components/PlanView';
import { CreatePlanModal } from './components/CreatePlanModal';
import { generateDetailedPlan } from './services/geminiService';
import { savePlan, loadPlan, getPlanIndex } from './services/storage';
import { LearningDay, LearningStatus, LearningPlanMetadata, LearningPlan } from './types';
import { Sparkles, Play } from 'lucide-react';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';
import { TRANSLATIONS } from './constants';

const AppContent: React.FC = () => {
  const [loading, setLoading] = useState(true); // Splash Screen State
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [activePlan, setActivePlan] = useState<LearningPlan | null>(null);
  const [planList, setPlanList] = useState<LearningPlanMetadata[]>([]);
  const [view, setView] = useState<string>('daily'); 
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { language } = useConfig();
  const t = TRANSLATIONS[language];

  // Initialization
  useEffect(() => {
    setPlanList(getPlanIndex());
    // We no longer load the plan immediately here to show Intro if no plan selected? 
    // Or we can load first one. Let's try to load the first one if available.
    const index = getPlanIndex();
    if (index.length > 0) {
        const latest = loadPlan(index[0].id);
        if (latest) setActivePlan(latest);
    }
  }, []);

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
      alert("Failed to generate plan.");
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
    setPlanList(getPlanIndex()); 
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

  // View Rendering Logic
  const renderContent = () => {
      if (!activePlan) {
          // Empty State / Intro
          return (
              <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
                  <div className="w-24 h-24 bg-pink-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <Sparkles size={48} className="text-pink-500" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{t.introSubtitle}</h2>
                  <p className="text-slate-500 mb-8">{t.introDesc}</p>
                  <button 
                      onClick={() => setShowCreateModal(true)}
                      className="px-8 py-4 bg-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-500/30 active:scale-95 transition-all"
                  >
                      {t.create}
                  </button>
              </div>
          )
      }

      switch (view) {
          case 'daily': return <DailyView day={getCurrentDay()!} onUpdateDay={updateDay} onCompleteDay={completeDay} />;
          case 'plan': return <PlanView days={activePlan.days} />;
          case 'dashboard': return <Dashboard days={activePlan.days} />;
          default: return null;
      }
  };

  if (loading) {
      return <SplashScreen onFinish={() => setLoading(false)} />
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 transition-colors duration-300">
        
        <NavDrawer 
            isOpen={drawerOpen} 
            onClose={() => setDrawerOpen(false)}
            plans={planList}
            currentPlanId={activePlan?.id || null}
            onSelectPlan={handleSelectPlan}
            onAddPlan={() => setShowCreateModal(true)}
        />

        <TopBar 
            title={activePlan ? activePlan.title : t.introTitle} 
            onMenuClick={() => setDrawerOpen(true)} 
        />

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 pb-32 scroll-smooth">
             {renderContent()}
        </main>

        {/* Bottom Nav (Only if active plan exists) */}
        {activePlan && (
            <BottomNav activeTab={view} onChangeTab={setView} />
        )}

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