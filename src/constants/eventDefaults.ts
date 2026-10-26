/**
 * System-wide numeric thresholds and boundary constants
 * Enforces the Single Source of Truth pattern across validation, components, and tests.
 */
export const EVENT_BOUNDS = {
  MIN_BUDGET: 5_000,
  MAX_BUDGET: 1_000_000_000,
  MIN_GUESTS: 1,
  MAX_GUESTS: 50_000,
  MAX_STRING_LENGTH: 500,
  DEFAULT_OVERAGE_TRIGGER_PERCENT: 0.2, // 20% over-budget threshold
  DEFAULT_CONTINGENCY_RATIO: 0.05, // 5% baseline contingency reserve
} as const;

export const SIMULATION_PRESETS = {
  STRESS_TEST: {
    GUEST_DELTA: 50,
    BUDGET_DELTA_PERCENT: -15,
    DATE_SHIFT_WEEKS: -2,
    LABEL: 'Load Stress Scenario (+50G, -15%, -2W)',
  },
} as const;

export const STORAGE_KEYS = {
  API_KEY: 'eventcraft_gemini_api_key',
  SAVED_PLAN: 'eventcraft_active_plan',
} as const;
