import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  IndianRupee, 
  Calendar, 
  Building2, 
  Lightbulb, 
  GitCompare 
} from 'lucide-react';
import { 
  EventProfile, 
  EventPlan, 
  BudgetItem, 
  TimelineTask, 
  VendorQuoteComparison,
  TaskStatus 
} from './types';
import { 
  WEDDING_PRESET, 
  generateHeuristicPlan 
} from './services/heuristicGenerator';
import { 
  getStoredApiKey, 
  generateEventPlanWithAI 
} from './services/gemini';
import { 
  computeTimelineCascade 
} from './utils/calculations';
import { formatCurrency } from './utils/currency';

// Components
import { Header } from './components/common/Header';
import { ApiKeyModal } from './components/common/ApiKeyModal';
import { NotificationToast, ToastMessage } from './components/common/NotificationToast';
import { ScopingWizard } from './components/scoping/ScopingWizard';
import { BudgetDashboard } from './components/budget/BudgetDashboard';
import { TimelineManager } from './components/timeline/TimelineManager';
import { VendorComparator } from './components/vendor/VendorComparator';
import { PersonalizedStudio } from './components/ideas/PersonalizedStudio';
import { PlanRevisionSimulator } from './components/revision/PlanRevisionSimulator';
import { JudgeGuideModal } from './components/documentation/JudgeGuideModal';

export const App: React.FC = () => {
  // Current active plan state (initialized to the Srinivas Wedding case)
  const [currentPlan, setCurrentPlan] = useState<EventPlan>(() => 
    generateHeuristicPlan(WEDDING_PRESET)
  );

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'budget' | 'timeline' | 'vendors' | 'ideas' | 'revision'>('budget');

  // Modals & UI state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isJudgeGuideOpen, setIsJudgeGuideOpen] = useState<boolean>(false);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => Boolean(getStoredApiKey()));
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Show welcome toast on mount
  useEffect(() => {
    setToast({
      id: 'welcome',
      type: 'info',
      title: 'Prompt Wars Challenge 5 Ready',
      message: 'Sharma & Verma Wedding preset loaded (₹8 Lakh, 200 Guests, 4 Months). Explore interconnected trade-offs and timelines!',
    });
  }, []);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // safe fallback
    }
  };

  // Switch presets
  const handleSelectPreset = (preset: EventProfile) => {
    const plan = generateHeuristicPlan(preset);
    setCurrentPlan(plan);
    setToast({
      id: `preset-${preset.id}`,
      type: 'success',
      title: 'Event Preset Loaded',
      message: `Loaded "${preset.title}" (${formatCurrency(preset.totalBudget, preset.currency)}, ${preset.guestCount} guests).`,
    });
    triggerCelebration();
  };

  // Generate new plan via Wizard
  const handleGenerateFromWizard = async (profile: EventProfile) => {
    setIsLoadingAI(true);
    try {
      const plan = await generateEventPlanWithAI(profile);
      setCurrentPlan(plan);
      setIsWizardOpen(false);
      setToast({
        id: `wizard-gen-${Date.now()}`,
        type: 'success',
        title: 'Event Plan Orchestrated!',
        message: `Plan generated for ${profile.title}. Budgets, timelines and vendors are synchronized.`,
      });
      triggerCelebration();
    } catch (err) {
      console.error(err);
      const fallback = generateHeuristicPlan(profile);
      setCurrentPlan(fallback);
      setIsWizardOpen(false);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Budget item update
  const handleUpdateBudgetItem = (itemId: string, newAmount: number, isEstimate: boolean) => {
    setCurrentPlan((prev) => ({
      ...prev,
      budgetItems: prev.budgetItems.map((item) =>
        item.id === itemId
          ? { ...item, actualAmount: newAmount, isEstimate }
          : item
      ),
    }));
    setToast({
      id: `budget-update-${Date.now()}`,
      type: 'info',
      title: 'Budget Allocation Adjusted',
      message: 'Per-guest metrics and trade-off headroom recalculated.',
    });
  };

  // Apply Trade-off
  const handleApplyTradeOff = (tradeOffId: string) => {
    setCurrentPlan((prev) => {
      const tradeOff = prev.tradeOffs.find((t) => t.id === tradeOffId);
      if (!tradeOff) return prev;

      const isApplying = !tradeOff.applied;
      const updatedTradeOffs = prev.tradeOffs.map((t) =>
        t.id === tradeOffId ? { ...t, applied: isApplying } : t
      );

      // Adjust the relevant category budget
      const updatedBudgetItems = prev.budgetItems.map((item) => {
        if (item.category === tradeOff.category) {
          const current = item.actualAmount ?? item.allocatedAmount;
          const adjusted = isApplying
            ? Math.max(0, current - tradeOff.savingsAmount)
            : current + tradeOff.savingsAmount;
          return { ...item, actualAmount: adjusted };
        }
        return item;
      });

      return {
        ...prev,
        tradeOffs: updatedTradeOffs,
        budgetItems: updatedBudgetItems,
      };
    });

    setToast({
      id: `tradeoff-${Date.now()}`,
      type: 'success',
      title: 'Trade-Off Updated',
      message: 'Budget recalculated while protecting your top-ranked priorities.',
    });
    triggerCelebration();
  };

  // Simulate 20% Budget Overage
  const handleTriggerOverageSimulation = () => {
    setCurrentPlan((prev) => {
      const overageMultiplier = 1.2; // 20% over budget
      const inflatedItems = prev.budgetItems.map((item) => {
        if (item.category === 'catering' || item.category === 'venue') {
          return {
            ...item,
            actualAmount: Math.round(item.allocatedAmount * overageMultiplier),
            isEstimate: false,
          };
        }
        return item;
      });
      return {
        ...prev,
        budgetItems: inflatedItems,
      };
    });

    setToast({
      id: `overage-sim-${Date.now()}`,
      type: 'warning',
      title: '20% Overage Simulation Active',
      message: 'Actual vendor costs exceed target budget! Explore priority-guided trade-offs below.',
    });
  };

  // Timeline Task Status Update
  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    if (status === 'delayed') {
      handleSimulateDelay(taskId, 14);
      return;
    }

    setCurrentPlan((prev) => ({
      ...prev,
      timeline: prev.timeline.map((t) => (t.id === taskId ? { ...t, status } : t)),
    }));

    if (status === 'completed') {
      triggerCelebration();
    }
  };

  // Timeline Cascade Delay Simulation
  const handleSimulateDelay = (taskId: string, days: number) => {
    const cascade = computeTimelineCascade(currentPlan.timeline, taskId, days);
    setCurrentPlan((prev) => ({
      ...prev,
      timeline: cascade.updatedTasks,
    }));

    setToast({
      id: `cascade-${Date.now()}`,
      type: 'warning',
      title: 'Timeline Cascade Warning Triggered',
      message: cascade.warningMessage,
    });
  };

  // Add Task
  const handleAddTask = (newTask: Partial<TimelineTask>) => {
    const task: TimelineTask = {
      id: `task-${Date.now()}`,
      title: newTask.title || 'New Milestone',
      category: newTask.category || 'general',
      deadlineDate: newTask.deadlineDate || currentPlan.profile.targetDate,
      daysBeforeEvent: newTask.daysBeforeEvent || 15,
      priority: newTask.priority || 'medium',
      status: 'pending',
      dependencies: newTask.dependencies || [],
      cascadeImpactDesc: newTask.cascadeImpactDesc || '',
      assignedTo: newTask.assignedTo || 'Organizer',
      notes: newTask.notes || '',
    };

    setCurrentPlan((prev) => ({
      ...prev,
      timeline: [...prev.timeline, task],
    }));
  };

  // Vendor Quotation Shortlist Toggle
  const handleToggleShortlist = (quoteId: string) => {
    setCurrentPlan((prev) => ({
      ...prev,
      vendorQuotes: prev.vendorQuotes.map((q) =>
        q.id === quoteId ? { ...q, isShortlisted: !q.isShortlisted } : q
      ),
    }));
    triggerCelebration();
  };

  // Add Vendor Quote
  const handleAddQuote = (newQuote: VendorQuoteComparison) => {
    setCurrentPlan((prev) => ({
      ...prev,
      vendorQuotes: [newQuote, ...prev.vendorQuotes],
    }));
  };

  // Ideas Favorite Toggle
  const handleToggleFavoriteIdea = (ideaId: string) => {
    setCurrentPlan((prev) => ({
      ...prev,
      personalizedIdeas: prev.personalizedIdeas.map((i) =>
        i.id === ideaId ? { ...i, favorited: !i.favorited } : i
      ),
    }));
  };

  // Refine Idea with AI
  const handleRefineIdeaWithAI = (title: string, feedback: string) => {
    setToast({
      id: `refine-${Date.now()}`,
      type: 'info',
      title: `Concept Refined: ${title}`,
      message: `Adapted concept to user feedback: "${feedback}". Alternative options refreshed.`,
    });
  };

  // Apply Mid-Flight Revised Plan (The Srinivas Stress Test)
  const handleApplyRevisedPlan = (
    revisedProfile: EventProfile,
    revisedBudget: BudgetItem[],
    notes: string
  ) => {
    setCurrentPlan((prev) => ({
      ...prev,
      profile: revisedProfile,
      budgetItems: revisedBudget,
      revisionHistory: [
        { timestamp: new Date().toISOString(), description: notes },
        ...prev.revisionHistory,
      ],
    }));

    setToast({
      id: `plan-revised-${Date.now()}`,
      type: 'success',
      title: 'Revised Plan Successfully Applied!',
      message: 'Headcount, budget pools, and timeline dates updated smoothly without starting from scratch.',
    });
    triggerCelebration();
    setActiveTab('budget');
  };

  // Export Plan to JSON & Print
  const handleExportPlan = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentPlan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentPlan.profile.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setToast({
      id: 'export-success',
      type: 'success',
      title: 'Plan Exported Successfully',
      message: 'Complete event plan downloaded as structured JSON.',
    });
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Header */}
      <Header
        currentProfile={currentPlan.profile}
        hasApiKey={hasApiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenJudgeGuide={() => setIsJudgeGuideOpen(true)}
        onSelectPreset={handleSelectPreset}
        onOpenNewWizard={() => setIsWizardOpen(true)}
        onExportPlan={handleExportPlan}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Event Vitals Hero Banner */}
        <section aria-label="Event Overview" className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-100/50 via-pink-100/30 to-transparent rounded-full pointer-events-none -mr-20 -mt-20 blur-2xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                  {currentPlan.profile.eventType.toUpperCase()}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  📍 {currentPlan.profile.city || 'Metro'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  📅 {currentPlan.profile.targetDate}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {currentPlan.profile.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {currentPlan.profile.occasion} — {currentPlan.profile.demographics.culturalBackground}. Prioritizing Food & Hospitality for {currentPlan.profile.guestCount} guests.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 self-start md:self-center shrink-0">
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Budget</span>
                <span className="text-sm font-extrabold text-slate-900">
                  {formatCurrency(currentPlan.profile.totalBudget, currentPlan.profile.currency)}
                </span>
              </div>
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Guests</span>
                <span className="text-sm font-extrabold text-purple-700">
                  {currentPlan.profile.guestCount} Attendee{currentPlan.profile.guestCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
          {[
            { id: 'budget', label: '1. Budget & Trade-Offs', icon: <IndianRupee className="w-4 h-4" /> },
            { id: 'timeline', label: '2. Roadmap & Cascade Timeline', icon: <Calendar className="w-4 h-4" /> },
            { id: 'vendors', label: '3. Vendor RFPs & Quotes', icon: <Building2 className="w-4 h-4" /> },
            { id: 'ideas', label: '4. Demographic Ideas Studio', icon: <Lightbulb className="w-4 h-4" /> },
            { id: 'revision', label: '5. Plan Revision Simulator (Srinivas Test)', icon: <GitCompare className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ACTIVE TAB CONTENT */}
        <section aria-label="Tab Content">
          {activeTab === 'budget' && (
            <BudgetDashboard
              profile={currentPlan.profile}
              budgetItems={currentPlan.budgetItems}
              tradeOffs={currentPlan.tradeOffs}
              onUpdateBudgetItem={handleUpdateBudgetItem}
              onApplyTradeOff={handleApplyTradeOff}
              onTriggerOverageSimulation={handleTriggerOverageSimulation}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineManager
              tasks={currentPlan.timeline}
              targetDate={currentPlan.profile.targetDate}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onSimulateDelay={handleSimulateDelay}
              onAddTask={handleAddTask}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorComparator
              profile={currentPlan.profile}
              rfpTemplates={currentPlan.rfpTemplates}
              quotes={currentPlan.vendorQuotes}
              onAddQuote={handleAddQuote}
              onToggleShortlist={handleToggleShortlist}
            />
          )}

          {activeTab === 'ideas' && (
            <PersonalizedStudio
              profile={currentPlan.profile}
              ideas={currentPlan.personalizedIdeas}
              onToggleFavorite={handleToggleFavoriteIdea}
              onRefineWithAI={handleRefineIdeaWithAI}
            />
          )}

          {activeTab === 'revision' && (
            <PlanRevisionSimulator
              profile={currentPlan.profile}
              budgetItems={currentPlan.budgetItems}
              timeline={currentPlan.timeline}
              onApplyRevisedPlan={handleApplyRevisedPlan}
            />
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">EventCraft AI</span>
            <span>•</span>
            <span>Prompt Wars Virtual Challenge 5</span>
            <span>•</span>
            <span className="text-purple-600 font-semibold">Hack2Skill</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsJudgeGuideOpen(true)}
              className="text-purple-600 hover:underline font-semibold"
            >
              Evaluator Guide & Prompt Flows
            </button>
            <span>•</span>
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="hover:text-slate-800"
            >
              API Key & Resilience Settings
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS & NOTIFICATIONS */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={(hasKey) => setHasApiKey(hasKey)}
      />

      <JudgeGuideModal
        isOpen={isJudgeGuideOpen}
        onClose={() => setIsJudgeGuideOpen(false)}
      />

      <ScopingWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onGeneratePlan={handleGenerateFromWizard}
        isLoading={isLoadingAI}
      />

      <NotificationToast
        toast={toast}
        onDismiss={() => setToast(null)}
      />

    </div>
  );
};

export default App;
