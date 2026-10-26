export type EventType = 'wedding' | 'birthday' | 'community' | 'anniversary' | 'corporate';

export type ExperienceTier = 'budget-smart' | 'balanced-comfort' | 'premium-luxury';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface PriorityWeights {
  catering: number; // 1 to 5
  venue: number; // 1 to 5
  decoration: number; // 1 to 5
  photography: number; // 1 to 5
  entertainment: number; // 1 to 5
  contingency: number; // 1 to 5
}

export interface DemographicProfile {
  childrenPercent: number;
  elderlyPercent: number;
  culturalBackground: string;
  dietaryRestrictions: string[];
  accessibilityNeeds: string[];
}

export interface EventProfile {
  id: string;
  title: string;
  eventType: EventType;
  occasion: string;
  targetDate: string; // ISO date string YYYY-MM-DD
  city: string;
  totalBudget: number;
  currency: CurrencyCode;
  guestCount: number;
  experienceTier: ExperienceTier;
  priorities: PriorityWeights;
  demographics: DemographicProfile;
  mustHaves: string[];
  flexibles: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type BudgetCategoryKey =
  | 'venue'
  | 'catering'
  | 'decoration'
  | 'photography'
  | 'entertainment'
  | 'logistics'
  | 'attire'
  | 'contingency';

export interface BudgetItem {
  id: string;
  category: BudgetCategoryKey;
  label: string;
  allocatedAmount: number;
  actualAmount?: number;
  isEstimate: boolean; // Crucial requirement: AI estimate vs confirmed vendor contract
  confidenceScore?: number; // 0.0 to 1.0
  notes: string;
  perGuestCost?: number;
  isVariableWithGuests: boolean; // Does this scale directly when guests change?
}

export interface TradeOffSuggestion {
  id: string;
  title: string;
  description?: string;
  category: BudgetCategoryKey;
  savingsAmount: number;
  impactLevel: 'low' | 'medium' | 'high';
  impactExplanation: string;
  applied: boolean;
}

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';

export interface TimelineTask {
  id: string;
  title: string;
  category: BudgetCategoryKey | 'general' | 'invitations' | 'legal';
  deadlineDate: string; // YYYY-MM-DD
  daysBeforeEvent: number;
  priority: TaskPriority;
  status: TaskStatus;
  dependencies: string[]; // task IDs that must complete first
  cascadeImpactDesc?: string; // what is blocked if this task delays
  assignedTo?: string;
  estimatedCost?: number;
  notes?: string;
}

export interface VendorQuoteComparison {
  id: string;
  vendorName: string;
  category: BudgetCategoryKey;
  totalQuote: number;
  perGuestRate?: number;
  inclusions: string[];
  exclusions: string[];
  hiddenChargesFlagged: string[];
  clarificationQuestions: string[];
  rating: number;
  pros: string[];
  cons: string[];
  isShortlisted?: boolean;
}

export interface VendorRfpTemplate {
  category: BudgetCategoryKey;
  title: string;
  overviewPrompt: string;
  questionsToAsk: string[];
  keyDeliverablesRequired: string[];
  negotiationTips: string[];
}

export interface PersonalizedIdea {
  id: string;
  title: string;
  category: 'theme' | 'food' | 'activities' | 'decor' | 'accessibility';
  concept: string;
  whyItFitsThisAudience: string;
  estimatedCostRange: string;
  budgetFriendlyAlternative: string;
  favorited?: boolean;
}

export interface RippleEffectItem {
  id: string;
  module: 'budget' | 'timeline' | 'vendor' | 'demographics';
  severity: 'info' | 'warning' | 'danger';
  title: string;
  description: string;
  recommendedAction: string;
}

export interface PlanRevisionAnalysis {
  guestCountDelta: number;
  budgetDelta: number;
  dateShiftWeeks: number;
  impacts: RippleEffectItem[];
  proposedTradeOffs: TradeOffSuggestion[];
  newBudgetBreakdown: BudgetItem[];
  affectedTaskIds: string[];
}

export interface EventPlan {
  profile: EventProfile;
  budgetItems: BudgetItem[];
  tradeOffs: TradeOffSuggestion[];
  timeline: TimelineTask[];
  rfpTemplates: VendorRfpTemplate[];
  vendorQuotes: VendorQuoteComparison[];
  personalizedIdeas: PersonalizedIdea[];
  revisionHistory: {
    timestamp: string;
    description: string;
  }[];
}
