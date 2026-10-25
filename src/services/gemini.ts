import { 
  EventProfile, 
  EventPlan, 
  BudgetItem, 
  TimelineTask, 
  TradeOffSuggestion,
  VendorQuoteComparison,
  PersonalizedIdea 
} from '../types';
import { generateHeuristicPlan } from './heuristicGenerator';

const GEMINI_API_STORAGE_KEY = 'eventcraft_gemini_api_key';

export function getStoredApiKey(): string {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(GEMINI_API_STORAGE_KEY);
    if (local && local.trim().length > 0) return local.trim();
  }
  return ((import.meta as any).env?.VITE_GEMINI_API_KEY || '').trim();
}

export function setStoredApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem(GEMINI_API_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(GEMINI_API_STORAGE_KEY);
    }
  }
}

/**
 * Clean and parse JSON from a Gemini response that might have markdown fences
 */
function cleanAndParseJSON<T>(rawText: string, fallback: T): T {
  try {
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    }
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.warn('[Gemini Parser] Failed to parse JSON response. Falling back to heuristic defaults.', err);
    return fallback;
  }
}

/**
 * Internal helper to query Google Gemini REST endpoint with model fallback
 */
async function callGeminiAPI(systemInstruction: string, userPrompt: string): Promise<string | null> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    console.info('[Gemini API] No API key detected. Operating in high-fidelity deterministic heuristic mode.');
    return null;
  }

  // Model sequence: try gemini-2.5-flash first, then gemini-1.5-flash
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemInstruction}\n\nUser Request / Context:\n${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 3500,
          responseMimeType: 'application/json',
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[Gemini API] Model ${model} returned HTTP ${response.status}:`, errorText);
        continue; // Try next model or fallback
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (networkErr) {
      console.warn(`[Gemini API] Failed call to ${model}:`, networkErr);
    }
  }

  return null;
}

/**
 * Generate a complete event plan using Gemini AI, with automatic heuristic fallback
 */
export async function generateEventPlanWithAI(profile: EventProfile): Promise<EventPlan> {
  const fallbackPlan = generateHeuristicPlan(profile);
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    // Immediate clean heuristic plan
    return fallbackPlan;
  }

  const systemPrompt = `You are EventCraft AI, an expert event planning and trade-off optimization assistant designed for Hackathon Challenge 5.
Given an event profile, return a STRICT JSON OBJECT with the following structure:
{
  "budgetItems": [
    {
      "category": "venue" | "catering" | "decoration" | "photography" | "entertainment" | "logistics" | "attire" | "contingency",
      "label": string,
      "allocatedAmount": number,
      "isEstimate": true,
      "perGuestCost": number (optional),
      "isVariableWithGuests": boolean,
      "notes": string
    }
  ],
  "tradeOffs": [
    {
      "id": string,
      "title": string,
      "description": string,
      "category": string,
      "savingsAmount": number,
      "impactLevel": "low" | "medium" | "high",
      "impactExplanation": string,
      "applied": false
    }
  ],
  "timeline": [
    {
      "id": string,
      "title": string,
      "category": string,
      "daysBeforeEvent": number,
      "priority": "critical" | "high" | "medium" | "low",
      "status": "pending" | "in_progress" | "completed",
      "dependencies": string[],
      "cascadeImpactDesc": string,
      "assignedTo": string,
      "notes": string
    }
  ],
  "personalizedIdeas": [
    {
      "id": string,
      "title": string,
      "category": "theme" | "food" | "activities" | "decor" | "accessibility",
      "concept": string,
      "whyItFitsThisAudience": string,
      "estimatedCostRange": string,
      "budgetFriendlyAlternative": string
    }
  ]
}

CRITICAL RULES:
1. Distinguish between assumptions/estimates and verified vendor quotes: all generated budget items MUST set isEstimate: true.
2. The sum of allocatedAmount across budgetItems must equal exactly the totalBudget (${profile.totalBudget}).
3. Prioritize food if catering weight is high, venue if venue weight is high.
4. For tradeOffs: propose realistic compromises based on user flexibles and demographics.
5. In the timeline, reflect true dependencies (e.g. Venue & Date locked before Invitations and Catering).
`;

  const userContext = `Event Profile:
- Occasion: ${profile.occasion} (${profile.eventType})
- Total Budget: ${profile.currency} ${profile.totalBudget}
- Guest Count: ${profile.guestCount}
- Target Date: ${profile.targetDate}
- City: ${profile.city}
- Experience Tier: ${profile.experienceTier}
- Priorities: Food=${profile.priorities.catering}/5, Venue=${profile.priorities.venue}/5, Decor=${profile.priorities.decoration}/5, Photo=${profile.priorities.photography}/5, DJ=${profile.priorities.entertainment}/5, Contingency=${profile.priorities.contingency}/5
- Demographics: ${profile.demographics.childrenPercent}% Children, ${profile.demographics.elderlyPercent}% Seniors. Cultural Background: ${profile.demographics.culturalBackground}
- Must-Haves: ${profile.mustHaves.join(', ')}
- Flexible On: ${profile.flexibles.join(', ')}
`;

  const aiResponse = await callGeminiAPI(systemPrompt, userContext);
  if (!aiResponse) {
    return fallbackPlan;
  }

  const parsed = cleanAndParseJSON<Partial<EventPlan>>(aiResponse, {});

  // Sanitize and merge with fallback guarantees
  const budgetItems: BudgetItem[] = Array.isArray(parsed.budgetItems) && parsed.budgetItems.length > 0
    ? parsed.budgetItems.map((item, idx) => ({
        id: item.id || `budget-item-${idx}`,
        category: item.category || 'contingency',
        label: item.label || 'Item',
        allocatedAmount: Number(item.allocatedAmount) || 10000,
        actualAmount: undefined,
        isEstimate: true,
        confidenceScore: 0.9,
        isVariableWithGuests: Boolean(item.isVariableWithGuests),
        perGuestCost: item.perGuestCost,
        notes: item.notes || '',
      }))
    : fallbackPlan.budgetItems;

  const tradeOffs: TradeOffSuggestion[] = Array.isArray(parsed.tradeOffs) && parsed.tradeOffs.length > 0
    ? parsed.tradeOffs.map((t, idx) => ({
        id: t.id || `tradeoff-${idx}`,
        title: t.title || 'Optimization Option',
        description: t.description || '',
        category: t.category || 'decoration',
        savingsAmount: Number(t.savingsAmount) || 15000,
        impactLevel: t.impactLevel || 'low',
        impactExplanation: t.impactExplanation || '',
        applied: false,
      }))
    : fallbackPlan.tradeOffs;

  const timeline: TimelineTask[] = Array.isArray(parsed.timeline) && parsed.timeline.length > 0
    ? parsed.timeline.map((t, idx) => {
        const days = Number(t.daysBeforeEvent) || 30;
        const targetMs = new Date(profile.targetDate).getTime();
        const deadlineDate = new Date(targetMs - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return {
          id: t.id || `task-${idx}`,
          title: t.title || 'Event Milestone',
          category: t.category || 'general',
          deadlineDate: t.deadlineDate || deadlineDate,
          daysBeforeEvent: days,
          priority: t.priority || 'medium',
          status: t.status || 'pending',
          dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
          cascadeImpactDesc: t.cascadeImpactDesc || '',
          assignedTo: t.assignedTo || 'Organizer',
          notes: t.notes || '',
        };
      })
    : fallbackPlan.timeline;

  const personalizedIdeas: PersonalizedIdea[] = Array.isArray(parsed.personalizedIdeas) && parsed.personalizedIdeas.length > 0
    ? parsed.personalizedIdeas.map((idea, idx) => ({
        id: idea.id || `idea-${idx}`,
        title: idea.title || 'Personalized Concept',
        category: idea.category || 'theme',
        concept: idea.concept || '',
        whyItFitsThisAudience: idea.whyItFitsThisAudience || '',
        estimatedCostRange: idea.estimatedCostRange || `${profile.currency} 10,000`,
        budgetFriendlyAlternative: idea.budgetFriendlyAlternative || '',
        favorited: false,
      }))
    : fallbackPlan.personalizedIdeas;

  return {
    profile,
    budgetItems,
    tradeOffs,
    timeline,
    rfpTemplates: fallbackPlan.rfpTemplates,
    vendorQuotes: fallbackPlan.vendorQuotes,
    personalizedIdeas,
    revisionHistory: [
      {
        timestamp: new Date().toISOString(),
        description: `Plan generated via Google Gemini 2.5 Flash for ${profile.occasion}.`,
      },
    ],
  };
}

/**
 * Multi-Quote Analysis via AI:
 * Takes vendor proposals and identifies hidden charges, clarification queries, and per-guest metrics.
 */
export async function analyzeVendorQuotesAI(
  category: string,
  quotes: VendorQuoteComparison[],
  profile: EventProfile
): Promise<VendorQuoteComparison[]> {
  const apiKey = getStoredApiKey();
  if (!apiKey || quotes.length === 0) {
    return quotes;
  }

  const systemPrompt = `You are a strict procurement auditor for events.
Analyze the following vendor quotes for category "${category}" in ${profile.city}.
Flag any hidden fees (taxes, generator diesel, overtime penalties, service fees, breakage) and draft critical questions the user must ask before signing.
Return a JSON array of the updated quotes matching the schema with populated "hiddenChargesFlagged" and "clarificationQuestions".`;

  const userContext = JSON.stringify({ quotes, guestCount: profile.guestCount, totalBudget: profile.totalBudget });
  const response = await callGeminiAPI(systemPrompt, userContext);
  if (!response) return quotes;

  const parsed = cleanAndParseJSON<VendorQuoteComparison[]>(response, quotes);
  return Array.isArray(parsed) && parsed.length > 0 ? parsed : quotes;
}
