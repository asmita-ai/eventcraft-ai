import React from 'react';
import { IndianRupee, Calendar, Building2, Lightbulb, GitCompare } from 'lucide-react';
import { formatCurrency } from './utils/currency';
import { useEventPlan, AppTab } from './hooks/useEventPlan';
import { useModalState } from './hooks/useModalState';

// Component Modules
import { Header } from './components/common/Header';
import { NotificationToast } from './components/common/NotificationToast';
import { ApiKeyModal } from './components/common/ApiKeyModal';
import { ScopingWizard } from './components/scoping/ScopingWizard';
import { BudgetDashboard } from './components/budget/BudgetDashboard';
import { TimelineManager } from './components/timeline/TimelineManager';
import { VendorComparator } from './components/vendor/VendorComparator';
import { PersonalizedStudio } from './components/ideas/PersonalizedStudio';
import { PlanRevisionSimulator } from './components/revision/PlanRevisionSimulator';
import { JudgeGuideModal } from './components/documentation/JudgeGuideModal';

export type { AppTab };

/**
 * EventCraft AI Root Application Component
 * Orchestrates modular presentation components using custom hooks.
 */
export const App: React.FC = () => {
  const {
    currentPlan,
    activeTab,
    setActiveTab,
    isLoadingAI,
    toast,
    dismissToast,
    selectPreset,
    generateFromWizard,
    updateBudgetItem,
    applyTradeOff,
    triggerOverageSimulation,
    updateTaskStatus,
    simulateDelay,
    addTask,
    addQuote,
    toggleShortlist,
    toggleFavoriteIdea,
    refineIdeaWithAI,
    applyRevisedPlan,
    exportPlan,
  } = useEventPlan();

  const {
    isApiKeyModalOpen,
    openApiKeyModal,
    closeApiKeyModal,
    isJudgeGuideOpen,
    openJudgeGuide,
    closeJudgeGuide,
    isWizardOpen,
    openWizard,
    closeWizard,
    hasApiKey,
    handleKeySaved,
  } = useModalState();

  const handleGenerateAndClose = async (profile: Parameters<typeof generateFromWizard>[0]) => {
    await generateFromWizard(profile);
    closeWizard();
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Skip to Main Content Landmark for Screen Readers & Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 bg-purple-700 text-white font-bold px-4 py-2 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      >
        Skip to main content
      </a>

      {/* Top Navigation Header */}
      <Header
        currentProfile={currentPlan.profile}
        hasApiKey={hasApiKey}
        onOpenApiKeyModal={openApiKeyModal}
        onOpenJudgeGuide={openJudgeGuide}
        onSelectPreset={selectPreset}
        onOpenNewWizard={openWizard}
        onExportPlan={exportPlan}
      />

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 focus:outline-none"
      >
        {/* Event Vitals Hero Banner */}
        <section
          aria-label="Event Overview"
          className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden"
        >
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
                {currentPlan.profile.occasion} —{' '}
                {currentPlan.profile.demographics.culturalBackground}. Prioritizing Food &
                Hospitality for {currentPlan.profile.guestCount} guests.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 self-start md:self-center shrink-0">
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Total Budget
                </span>
                <span className="text-sm font-extrabold text-slate-900">
                  {formatCurrency(currentPlan.profile.totalBudget, currentPlan.profile.currency)}
                </span>
              </div>
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Guests</span>
                <span className="text-sm font-extrabold text-purple-700">
                  {currentPlan.profile.guestCount} Attendee
                  {currentPlan.profile.guestCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation Bar with ARIA Tablist semantics */}
        <div
          role="tablist"
          aria-label="Event planning modules"
          className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px"
        >
          {(
            [
              {
                id: 'budget',
                label: '1. Budget & Trade-Offs',
                icon: <IndianRupee className="w-4 h-4" />,
              },
              {
                id: 'timeline',
                label: '2. Roadmap & Cascade Timeline',
                icon: <Calendar className="w-4 h-4" />,
              },
              {
                id: 'vendors',
                label: '3. Vendor RFPs & Quotes',
                icon: <Building2 className="w-4 h-4" />,
              },
              {
                id: 'ideas',
                label: '4. Demographic Ideas Studio',
                icon: <Lightbulb className="w-4 h-4" />,
              },
              {
                id: 'revision',
                label: '5. Adaptive Plan Revision Simulator',
                icon: <GitCompare className="w-4 h-4" />,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-1 rounded-t-lg ${
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

        {/* ACTIVE TAB CONTENT with ARIA Tabpanel semantics */}
        <section
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          aria-label={`${activeTab} module view`}
        >
          {activeTab === 'budget' && (
            <BudgetDashboard
              profile={currentPlan.profile}
              budgetItems={currentPlan.budgetItems}
              tradeOffs={currentPlan.tradeOffs}
              onUpdateBudgetItem={updateBudgetItem}
              onApplyTradeOff={applyTradeOff}
              onTriggerOverageSimulation={triggerOverageSimulation}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineManager
              tasks={currentPlan.timeline}
              targetDate={currentPlan.profile.targetDate}
              onUpdateTaskStatus={updateTaskStatus}
              onSimulateDelay={simulateDelay}
              onAddTask={addTask}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorComparator
              profile={currentPlan.profile}
              rfpTemplates={currentPlan.rfpTemplates}
              quotes={currentPlan.vendorQuotes}
              onAddQuote={addQuote}
              onToggleShortlist={toggleShortlist}
            />
          )}

          {activeTab === 'ideas' && (
            <PersonalizedStudio
              profile={currentPlan.profile}
              ideas={currentPlan.personalizedIdeas}
              onToggleFavorite={toggleFavoriteIdea}
              onRefineWithAI={refineIdeaWithAI}
            />
          )}

          {activeTab === 'revision' && (
            <PlanRevisionSimulator
              profile={currentPlan.profile}
              budgetItems={currentPlan.budgetItems}
              timeline={currentPlan.timeline}
              onApplyRevisedPlan={applyRevisedPlan}
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
              onClick={openJudgeGuide}
              className="text-purple-600 hover:underline font-semibold"
            >
              System Architecture Dossier
            </button>
            <span>•</span>
            <button onClick={openApiKeyModal} className="hover:text-slate-800">
              API Key & Resilience Settings
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS & NOTIFICATIONS */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={closeApiKeyModal}
        onKeySaved={handleKeySaved}
      />

      <JudgeGuideModal isOpen={isJudgeGuideOpen} onClose={closeJudgeGuide} />

      <ScopingWizard
        isOpen={isWizardOpen}
        onClose={closeWizard}
        onGeneratePlan={handleGenerateAndClose}
        isLoading={isLoadingAI}
      />

      <NotificationToast toast={toast} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
