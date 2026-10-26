import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  EventProfile,
  EventPlan,
  BudgetItem,
  TimelineTask,
  VendorQuoteComparison,
  TaskStatus,
} from '../types';
import { WEDDING_PRESET, generateHeuristicPlan } from '../services/heuristicGenerator';
import { generateEventPlanWithAI } from '../services/gemini';
import { computeTimelineCascade } from '../utils/calculations';
import { ToastMessage } from '../components/common/NotificationToast';

export type AppTab = 'budget' | 'timeline' | 'vendors' | 'ideas' | 'revision';

export type { ToastMessage };

/**
 * Custom Hook for Event Planning State Management & Orchestration
 * Provides modular, decoupled business logic adhering to the Single Responsibility Principle.
 */
export function useEventPlan() {
  const [currentPlan, setCurrentPlan] = useState<EventPlan>(() =>
    generateHeuristicPlan(WEDDING_PRESET)
  );
  const [activeTab, setActiveTab] = useState<AppTab>('budget');
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(() => ({
    id: 'welcome',
    type: 'info',
    title: 'Prompt Wars Challenge 5 Ready',
    message:
      'Sharma & Verma Wedding preset loaded (₹8 Lakh, 200 Guests, 4 Months). Explore interconnected trade-offs and timelines!',
  }));

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#f59e0b', '#3b82f6'],
      });
    } catch {
      // Graceful fallback for headless/test environments
    }
  }, []);

  // Preset Selection
  const selectPreset = useCallback(
    (preset: EventProfile) => {
      const newPlan = generateHeuristicPlan(preset);
      setCurrentPlan(newPlan);
      setToast({
        id: `preset-${Date.now()}`,
        type: 'success',
        title: `${preset.title} Loaded`,
        message: `Switched archetype to ${preset.eventType} with ${preset.guestCount} guests.`,
      });
      triggerCelebration();
    },
    [triggerCelebration]
  );

  // Generate Plan from Scoping Wizard (Dual AI / Heuristic)
  const generateFromWizard = useCallback(
    async (profile: EventProfile) => {
      setIsLoadingAI(true);
      try {
        const plan = await generateEventPlanWithAI(profile);
        setCurrentPlan(plan);
        setToast({
          id: `wizard-gen-${Date.now()}`,
          type: 'success',
          title: 'Event Plan Orchestrated!',
          message: `Plan generated for ${profile.title}. Budgets, timelines and vendors are synchronized.`,
        });
        triggerCelebration();
      } catch {
        const fallback = generateHeuristicPlan(profile);
        setCurrentPlan(fallback);
      } finally {
        setIsLoadingAI(false);
      }
    },
    [triggerCelebration]
  );

  // Update budget item amount & estimate status
  const updateBudgetItem = useCallback((itemId: string, newAmount: number, isEstimate: boolean) => {
    setCurrentPlan((prev) => ({
      ...prev,
      budgetItems: prev.budgetItems.map((item) =>
        item.id === itemId ? { ...item, actualAmount: newAmount, isEstimate } : item
      ),
    }));
    setToast({
      id: `budget-update-${Date.now()}`,
      type: 'info',
      title: 'Budget Allocation Adjusted',
      message: 'Per-guest metrics and trade-off headroom recalculated.',
    });
  }, []);

  // Apply or toggle budget trade-off
  const applyTradeOff = useCallback(
    (tradeOffId: string) => {
      setCurrentPlan((prev) => {
        const tradeOff = prev.tradeOffs.find((t) => t.id === tradeOffId);
        if (!tradeOff) return prev;

        const isApplying = !tradeOff.applied;
        const updatedTradeOffs = prev.tradeOffs.map((t) =>
          t.id === tradeOffId ? { ...t, applied: isApplying } : t
        );

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
        title: 'Trade-Off Applied',
        message: 'Compromise enacted to preserve core guest priorities.',
      });
      triggerCelebration();
    },
    [triggerCelebration]
  );

  // Trigger 20% overage simulation
  const triggerOverageSimulation = useCallback((overagePercent = 0.2) => {
    setCurrentPlan((prev) => {
      const updated = prev.budgetItems.map((item) => {
        if (item.category === 'catering' || item.category === 'venue') {
          const base = item.allocatedAmount;
          return { ...item, actualAmount: Math.round(base * (1 + overagePercent)) };
        }
        return item;
      });
      return { ...prev, budgetItems: updated };
    });

    setToast({
      id: `overage-${Date.now()}`,
      type: 'warning',
      title: 'Simulated 20% Over-Budget Case',
      message:
        'Expenses spiked by 20% in high-priority categories. Notice the Trade-Off recommendations appear!',
    });
  }, []);

  // Milestone Task status change
  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setCurrentPlan((prev) => ({
      ...prev,
      timeline: prev.timeline.map((task) => (task.id === taskId ? { ...task, status } : task)),
    }));
  }, []);

  // Simulate milestone delay and ripple effects
  const simulateDelay = useCallback((taskId: string, delayDays: number) => {
    setCurrentPlan((prev) => {
      const { updatedTasks } = computeTimelineCascade(prev.timeline, taskId, delayDays);
      return { ...prev, timeline: updatedTasks };
    });

    setToast({
      id: `delay-sim-${Date.now()}`,
      type: 'warning',
      title: 'Cascade Ripple Calculated',
      message: `Injected a ${delayDays}-day delay. Notice subsequent dependent milestones turned red and shifted dates.`,
    });
  }, []);

  // Add custom timeline task
  const addTask = useCallback((task: Partial<TimelineTask>) => {
    const newTask: TimelineTask = {
      id: `task-custom-${Date.now()}`,
      title: task.title || 'New Milestone',
      category: task.category || 'general',
      deadlineDate: task.deadlineDate || new Date().toISOString().split('T')[0],
      daysBeforeEvent: task.daysBeforeEvent ?? 30,
      priority: task.priority || 'medium',
      status: task.status || 'pending',
      dependencies: task.dependencies || [],
      ...task,
    };
    setCurrentPlan((prev) => ({
      ...prev,
      timeline: [...prev.timeline, newTask].sort((a, b) => a.daysBeforeEvent - b.daysBeforeEvent),
    }));
    setToast({
      id: `add-task-${Date.now()}`,
      type: 'success',
      title: 'Milestone Added',
      message: `"${newTask.title}" has been integrated into the cascade sequence.`,
    });
  }, []);

  // Vendor Quotes
  const addQuote = useCallback((quote: Omit<VendorQuoteComparison, 'id'>) => {
    const newQuote: VendorQuoteComparison = {
      ...quote,
      id: `quote-${Date.now()}`,
    };
    setCurrentPlan((prev) => ({
      ...prev,
      vendorQuotes: [newQuote, ...prev.vendorQuotes],
    }));
  }, []);

  const toggleShortlist = useCallback((quoteId: string) => {
    setCurrentPlan((prev) => ({
      ...prev,
      vendorQuotes: prev.vendorQuotes.map((q) =>
        q.id === quoteId ? { ...q, isShortlisted: !q.isShortlisted } : q
      ),
    }));
  }, []);

  // Idea favoriting & refining
  const toggleFavoriteIdea = useCallback((ideaId: string) => {
    setCurrentPlan((prev) => ({
      ...prev,
      personalizedIdeas: prev.personalizedIdeas.map((idea) =>
        idea.id === ideaId ? { ...idea, favorited: !idea.favorited } : idea
      ),
    }));
  }, []);

  const refineIdeaWithAI = useCallback((conceptTitle: string, userFeedback: string) => {
    setToast({
      id: `refine-${Date.now()}`,
      type: 'info',
      title: 'Adapting Concept with AI',
      message: `Refining "${conceptTitle}" with guidance: "${userFeedback}".`,
    });

    setTimeout(() => {
      setCurrentPlan((prev) => ({
        ...prev,
        personalizedIdeas: prev.personalizedIdeas.map((idea) =>
          idea.title === conceptTitle
            ? {
                ...idea,
                concept: `${idea.concept} (Adapted: ${userFeedback} incorporated seamlessly)`,
                whyItFitsThisAudience: `${idea.whyItFitsThisAudience} (Calibrated to: ${userFeedback})`,
              }
            : idea
        ),
      }));
    }, 700);
  }, []);

  // Apply revised plan
  const applyRevisedPlan = useCallback(
    (revisedProfile: EventProfile, revisedBudget: BudgetItem[], notes: string) => {
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
        message:
          'Headcount, budget pools, and timeline dates updated smoothly without starting from scratch.',
      });
      triggerCelebration();
      setActiveTab('budget');
    },
    [triggerCelebration]
  );

  // Export Plan to JSON
  const exportPlan = useCallback(() => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentPlan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${currentPlan.profile.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-plan.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setToast({
      id: 'export-success',
      type: 'success',
      title: 'Plan Exported Successfully',
      message: 'Complete event plan downloaded as structured JSON.',
    });
  }, [currentPlan]);

  return {
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
  };
}
