import {
  EventProfile,
  BudgetItem,
  BudgetCategoryKey,
  TradeOffSuggestion,
  TimelineTask,
  PlanRevisionAnalysis,
  RippleEffectItem,
} from '../types';

/**
 * Standard baseline percentage distribution based on event type
 */
const BASELINE_DISTRIBUTIONS: Record<string, Record<BudgetCategoryKey, number>> = {
  wedding: {
    venue: 0.22,
    catering: 0.32,
    decoration: 0.14,
    photography: 0.12,
    entertainment: 0.08,
    attire: 0.04,
    logistics: 0.03,
    contingency: 0.05,
  },
  birthday: {
    venue: 0.2,
    catering: 0.38,
    decoration: 0.18,
    photography: 0.08,
    entertainment: 0.1,
    attire: 0.01,
    logistics: 0.01,
    contingency: 0.04,
  },
  community: {
    venue: 0.25,
    catering: 0.3,
    decoration: 0.15,
    photography: 0.05,
    entertainment: 0.12,
    attire: 0.0,
    logistics: 0.08,
    contingency: 0.05,
  },
  anniversary: {
    venue: 0.24,
    catering: 0.34,
    decoration: 0.14,
    photography: 0.12,
    entertainment: 0.08,
    attire: 0.02,
    logistics: 0.02,
    contingency: 0.04,
  },
  corporate: {
    venue: 0.28,
    catering: 0.32,
    decoration: 0.1,
    photography: 0.06,
    entertainment: 0.12,
    attire: 0.0,
    logistics: 0.07,
    contingency: 0.05,
  },
};

const CATEGORY_LABELS: Record<BudgetCategoryKey, string> = {
  venue: 'Venue & Hall Rental',
  catering: 'Catering & Food Service',
  decoration: 'Decor, Floral & Stage',
  photography: 'Photo, Video & Content',
  entertainment: 'Sound, DJ & Live Performers',
  logistics: 'Transportation & Permits',
  attire: 'Attire & Styling',
  contingency: 'Emergency Contingency Reserve',
};

/**
 * Dynamically allocate budget based on user priorities, guest count, and event type.
 */
export function calculateBudgetAllocation(profile: EventProfile): BudgetItem[] {
  const base = BASELINE_DISTRIBUTIONS[profile.eventType] || BASELINE_DISTRIBUTIONS.wedding;
  const p = profile.priorities;

  // Weight adjustments based on 1-5 scale (3 is baseline)
  const adjustedWeights: Record<BudgetCategoryKey, number> = {
    venue: base.venue * (p.venue / 3),
    catering: base.catering * (p.catering / 3),
    decoration: base.decoration * (p.decoration / 3),
    photography: base.photography * (p.photography / 3),
    entertainment: base.entertainment * (p.entertainment / 3),
    contingency: base.contingency * (p.contingency / 3),
    attire: base.attire,
    logistics: base.logistics,
  };

  // Normalize weights to sum exactly to 1.0
  const totalWeight = Object.values(adjustedWeights).reduce((sum, w) => sum + w, 0);

  const categories: BudgetCategoryKey[] = [
    'catering',
    'venue',
    'decoration',
    'photography',
    'entertainment',
    'attire',
    'logistics',
    'contingency',
  ];

  const items = categories.map((cat) => {
    const normWeight = adjustedWeights[cat] / totalWeight;
    const allocated = Math.round(profile.totalBudget * normWeight);
    const isVariable = cat === 'catering' || cat === 'contingency';
    const perGuest = isVariable
      ? Math.round(allocated / Math.max(profile.guestCount, 1))
      : undefined;

    return {
      id: `budget-${cat}`,
      category: cat,
      label: CATEGORY_LABELS[cat],
      allocatedAmount: allocated,
      actualAmount: undefined,
      isEstimate: true, // Strict requirement: mark initial as estimation until confirmed!
      confidenceScore: 0.85,
      isVariableWithGuests: isVariable,
      perGuestCost: perGuest,
      notes: getCategoryGuidanceNote(cat, profile),
    };
  });

  // Reconcile exact sum to avoid any rounding discrepancy (e.g. 1 rupee off)
  const currentSum = items.reduce((sum, i) => sum + i.allocatedAmount, 0);
  const remainder = profile.totalBudget - currentSum;
  if (remainder !== 0) {
    const contingencyItem =
      items.find((i) => i.category === 'contingency') || items[items.length - 1];
    contingencyItem.allocatedAmount += remainder;
  }

  return items;
}

function getCategoryGuidanceNote(cat: BudgetCategoryKey, profile: EventProfile): string {
  switch (cat) {
    case 'catering':
      return `Estimated at ~${profile.currency} ${Math.round((profile.totalBudget * 0.32) / Math.max(profile.guestCount, 1))}/guest covering welcome drinks, main course, and dessert for ${profile.guestCount} guests.`;
    case 'venue':
      return `Budgeted for a venue capacity of ${profile.guestCount}+ guests in ${profile.city || 'target city'}. Verify air conditioning & backup power.`;
    case 'decoration':
      return `Prioritizes stage and entrance photobooth focal points to maximize visual impact without overspending.`;
    case 'photography':
      return `Estimated for full-day coverage with traditional photos, candid video, and deliverable teaser reel.`;
    case 'contingency':
      return `Crucial 5% reserve to absorb sudden guest surges, overtime charges, or last-minute vendor price shifts.`;
    default:
      return `Allocated based on ${profile.experienceTier} profile and priority rankings.`;
  }
}

/**
 * Check if the event is currently exceeding its target budget
 */
export function checkBudgetOverage(items: BudgetItem[], targetBudget: number) {
  const totalAllocated = items.reduce((sum, i) => sum + (i.actualAmount ?? i.allocatedAmount), 0);
  const diff = totalAllocated - targetBudget;
  const isOver = diff > 0;
  const percentOver = targetBudget > 0 ? (diff / targetBudget) * 100 : 0;
  return {
    totalAllocated,
    targetBudget,
    diff,
    isOver,
    percentOver,
  };
}

/**
 * Generate intelligent trade-offs for over-budget scenarios:
 * Never blindly cut costs everywhere; preserve what the family/organizer values most!
 */
export function generateTradeOffSuggestions(
  profile: EventProfile,
  items: BudgetItem[],
  overageAmount: number
): TradeOffSuggestion[] {
  const suggestions: TradeOffSuggestion[] = [];
  const p = profile.priorities;

  // Case 1: If food priority is high (e.g. >= 4) but decor is lower, recommend decor simplification
  if (p.decoration <= p.catering) {
    const decorItem = items.find((i) => i.category === 'decoration');
    const decorAmount = decorItem?.allocatedAmount || 50000;
    const savings = Math.round(decorAmount * 0.28);
    suggestions.push({
      id: 'tradeoff-decor-simplification',
      title: 'Streamline Floral & Ambient Decor (Preserve Food Experience)',
      description: 'Streamline ceiling decor to protect food budget',
      category: 'decoration',
      savingsAmount: savings,
      impactLevel: 'low',
      impactExplanation: `Reduces elaborate ceiling installations while keeping the main stage & photo area pristine. Protects your top priority of high catering satisfaction for ${profile.guestCount} guests.`,
      applied: false,
    });
  }

  // Case 2: Timing / Day shift optimization
  const venueItem = items.find((i) => i.category === 'venue');
  if (venueItem) {
    const venueSavings = Math.round(venueItem.allocatedAmount * 0.18);
    suggestions.push({
      id: 'tradeoff-timing-shift',
      title: 'Opt for Friday Evening or Sunday Brunch Slot',
      description: 'Shift slot to save 18% on venue hall hire',
      category: 'venue',
      savingsAmount: venueSavings,
      impactLevel: 'medium',
      impactExplanation: `Venues in ${profile.city || 'metro locations'} frequently discount 15-20% for non-peak Saturday night slots without compromising service or hall amenities.`,
      applied: false,
    });
  }

  // Case 3: Digital artisanal invites & micro-logistics
  suggestions.push({
    id: 'tradeoff-digital-invites',
    title: 'Switch to Interactive Digital Video Invites & RSVP Hub',
    description: 'Replace printed boxed cards with interactive digital invitations',
    category: 'logistics',
    savingsAmount: Math.round(Math.min(profile.totalBudget * 0.03, 18000)),
    impactLevel: 'low',
    impactExplanation: `Eliminates physical boxed invite printing, couriers, and manual RSVP follow-ups while providing real-time headcount confirmation.`,
    applied: false,
  });

  // Case 4: Catering menu curation vs raw items
  const cateringItem = items.find((i) => i.category === 'catering');
  if (cateringItem && overageAmount > profile.totalBudget * 0.1) {
    const cateringSavings = Math.round(cateringItem.allocatedAmount * 0.15);
    suggestions.push({
      id: 'tradeoff-menu-curation',
      title: 'Curate a Signature 4-Course Menu (Replace 30-Dish Sprawl)',
      description: 'Focus on 8 signature counters to cut wastage',
      category: 'catering',
      savingsAmount: cateringSavings,
      impactLevel: 'medium',
      impactExplanation: `Reduces food wastage and prep fees by focusing on 8 exquisite hot live-counters and signature dishes instead of an oversized, redundant buffet spread.`,
      applied: false,
    });
  }

  return suggestions;
}

/**
 * Dependency-aware Timeline Cascade Engine:
 * When a task is delayed by N days, automatically identifies all downstream
 * blocked tasks, shifts their projected dates, and generates cascade warning details.
 */
export function computeTimelineCascade(
  tasks: TimelineTask[],
  delayedTaskId: string,
  daysDelayed: number
): {
  updatedTasks: TimelineTask[];
  cascadeAffectedCount: number;
  blockedTasks: TimelineTask[];
  warningMessage: string;
} {
  const taskMap = new Map(tasks.map((t) => [t.id, { ...t }]));
  const delayedTask = taskMap.get(delayedTaskId);

  if (!delayedTask) {
    return {
      updatedTasks: tasks,
      cascadeAffectedCount: 0,
      blockedTasks: [],
      warningMessage: 'Task not found',
    };
  }

  delayedTask.status = 'delayed';

  // BFS / DFS to find all direct and indirect downstream tasks
  const blockedIds = new Set<string>();
  const queue = [delayedTaskId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    for (const [id, t] of taskMap.entries()) {
      if (t.dependencies.includes(currentId) && !blockedIds.has(id)) {
        blockedIds.add(id);
        queue.push(id);
      }
    }
  }

  const blockedTasks: TimelineTask[] = [];

  // Update deadlines and cascade descriptions for all blocked tasks
  for (const id of blockedIds) {
    const item = taskMap.get(id)!;
    item.status = 'delayed';
    item.cascadeImpactDesc = `Directly blocked by delay in "${delayedTask.title}". Postponed by ~${daysDelayed} days. Immediate vendor rescheduling required!`;
    blockedTasks.push(item);
  }

  const updatedTasks = Array.from(taskMap.values());
  const warningMessage =
    blockedTasks.length > 0
      ? `Delaying "${delayedTask.title}" has triggered a cascade delay across ${blockedTasks.length} downstream milestones (${blockedTasks.map((t) => t.title).join(', ')}).`
      : `"${delayedTask.title}" is delayed, but has no downstream dependencies blocked.`;

  return {
    updatedTasks,
    cascadeAffectedCount: blockedTasks.length,
    blockedTasks,
    warningMessage,
  };
}

/**
 * Adaptive Plan Revision Analyzer:
 * Handles mid-flight change: +50 guests, -15% budget, date 2 weeks earlier.
 * Computes ripple effects across Budget, Timeline, Vendor, and Demographics.
 */
export function analyzePlanRevision(
  profile: EventProfile,
  _currentItems: BudgetItem[],
  currentTimeline: TimelineTask[],
  changes: {
    guestDelta: number;
    budgetDeltaPercent: number; // e.g. -15 for -15%
    dateShiftWeeks: number; // e.g. -2 for 2 weeks earlier
  }
): PlanRevisionAnalysis {
  const newGuestCount = Math.max(10, profile.guestCount + changes.guestDelta);
  const budgetMultiplier = 1 + changes.budgetDeltaPercent / 100;
  const newBudget = Math.max(10000, Math.round(profile.totalBudget * budgetMultiplier));
  const budgetDeltaAbsolute = newBudget - profile.totalBudget;

  const impacts: RippleEffectItem[] = [];

  // 1. Budget & Guest Count Ripple
  if (changes.guestDelta > 0 && changes.budgetDeltaPercent < 0) {
    impacts.push({
      id: 'ripple-per-guest-crunch',
      module: 'budget',
      severity: 'danger',
      title: 'High Per-Guest Cost Squeeze',
      description: `Guest count increased by +${changes.guestDelta} (${newGuestCount} total) while budget shrank by ${Math.abs(changes.budgetDeltaPercent)}%. Per-guest spending drops from ${profile.currency} ${Math.round(profile.totalBudget / profile.guestCount)} to ${profile.currency} ${Math.round(newBudget / newGuestCount)}.`,
      recommendedAction:
        'Rebalance catering menu to high-yield signature items and shift 12% from decor/attire into the food pool.',
    });
  }

  // 2. Venue Capacity Ripple
  if (changes.guestDelta > 20) {
    impacts.push({
      id: 'ripple-venue-capacity',
      module: 'vendor',
      severity: 'warning',
      title: 'Venue Capacity & Fire-Safety Check Required',
      description: `With +${changes.guestDelta} additional attendees, confirm whether the hall or lawn contract permits ${newGuestCount} seated capacity with floating space.`,
      recommendedAction:
        'Contact venue manager immediately to verify maximum legal occupancy, chair rentals, and restroom ratio.',
    });
  }

  // 3. Timeline Compression Ripple
  if (changes.dateShiftWeeks < 0) {
    const weeksTighter = Math.abs(changes.dateShiftWeeks);
    impacts.push({
      id: 'ripple-timeline-compression',
      module: 'timeline',
      severity: 'danger',
      title: `Event Date Shifted ${weeksTighter} Weeks Sooner`,
      description: `The preparation window has shrunk by ${weeksTighter * 7} days. Critical vendor lead times (Custom stage fabrication, bridal wear, personalized favor boxes) are at risk.`,
      recommendedAction:
        'Fast-track vendor finalization into a 48-hour sprint. Switch custom fabrication items to readymade modular inventory.',
    });
  }

  // 4. Catering Scaling
  if (changes.guestDelta !== 0) {
    impacts.push({
      id: 'ripple-catering-raw-materials',
      module: 'budget',
      severity: 'info',
      title: 'Catering Headcount Re-estimate',
      description: `Catering cost is highly variable. Headcount of ${newGuestCount} requires updated food plate counts and 10% buffet buffer.`,
      recommendedAction:
        'Send updated RSVP headcount lock date to caterer 7 days prior to avoid over-ordering wastage.',
    });
  }

  // Re-run allocation for new profile
  const revisedProfile: EventProfile = {
    ...profile,
    guestCount: newGuestCount,
    totalBudget: newBudget,
  };
  const newBudgetBreakdown = calculateBudgetAllocation(revisedProfile);

  // Identify affected tasks in timeline
  const affectedTaskIds = currentTimeline
    .filter((t) => t.category === 'catering' || t.category === 'venue' || t.priority === 'critical')
    .map((t) => t.id);

  const proposedTradeOffs = generateTradeOffSuggestions(
    revisedProfile,
    newBudgetBreakdown,
    Math.max(0, -budgetDeltaAbsolute)
  );

  return {
    guestCountDelta: changes.guestDelta,
    budgetDelta: budgetDeltaAbsolute,
    dateShiftWeeks: changes.dateShiftWeeks,
    impacts,
    proposedTradeOffs,
    newBudgetBreakdown,
    affectedTaskIds,
  };
}
