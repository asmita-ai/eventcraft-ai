import { BudgetCategoryKey } from '../types';

/**
 * Metadata configuration for budget categories
 */
export interface CategoryMeta {
  key: BudgetCategoryKey;
  label: string;
  emoji: string;
  description: string;
  priorityWeight: number; // Default importance scale (1-5)
}

export const CATEGORY_DEFINITIONS: Record<BudgetCategoryKey, CategoryMeta> = {
  venue: {
    key: 'venue',
    label: 'Venue & Banquet Hall',
    emoji: '🏛️',
    description: 'Rental fee, mandap/hall grounds, power backup, and basic security',
    priorityWeight: 4,
  },
  catering: {
    key: 'catering',
    label: 'Catering & Food Service',
    emoji: '🍲',
    description: 'Multi-course menus, live counters, service staff, and beverages',
    priorityWeight: 5,
  },
  decoration: {
    key: 'decoration',
    label: 'Decor, Floral & Ambience',
    emoji: '🌸',
    description: 'Stage backdrops, tables, ambient lighting, and floral styling',
    priorityWeight: 3,
  },
  photography: {
    key: 'photography',
    label: 'Photography & Cinematography',
    emoji: '📸',
    description: 'Candid storytelling, traditional photo, drone footage, and albums',
    priorityWeight: 4,
  },
  entertainment: {
    key: 'entertainment',
    label: 'Entertainment, DJ & Audio',
    emoji: '🎵',
    description: 'Professional sound system, DJ/live band, emcee, and performers',
    priorityWeight: 3,
  },
  attire: {
    key: 'attire',
    label: 'Attire, Styling & Makeup',
    emoji: '👗',
    description: 'Host apparel, bridal/groom styling, and hair/makeup artists',
    priorityWeight: 3,
  },
  logistics: {
    key: 'logistics',
    label: 'Logistics, Transit & Favors',
    emoji: '🚌',
    description: 'Guest transportation, welcome hampers, and return gifts',
    priorityWeight: 2,
  },
  contingency: {
    key: 'contingency',
    label: 'Contingency & Reserve Pool',
    emoji: '🛡️',
    description: 'Unforeseen expenses, last-minute vendor tips, and emergency buffer',
    priorityWeight: 4,
  },
};

/**
 * Standard baseline percentage distribution based on celebration archetype
 */
export const ARCHETYPE_BUDGET_WEIGHTS: Record<string, Record<BudgetCategoryKey, number>> = {
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
    logistics: 0.01,
    contingency: 0.05,
  },
  corporate: {
    venue: 0.3,
    catering: 0.35,
    decoration: 0.1,
    photography: 0.08,
    entertainment: 0.07,
    attire: 0.0,
    logistics: 0.05,
    contingency: 0.05,
  },
};
