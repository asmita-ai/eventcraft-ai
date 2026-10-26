/**
 * EventCraft AI Security & Input Sanitization Suite
 * Protects against XSS, injection vectors, prototype pollution, and malformed inputs.
 */

/**
 * Sanitize untrusted user string inputs by stripping executable HTML tags
 * and encoding dangerous characters.
 */
export function sanitizeString(input: string | undefined | null, maxLength = 500): string {
  if (typeof input !== 'string') return '';

  // Enforce bounded length to mitigate DOS / buffer overflows
  const bounded = input.slice(0, maxLength);

  // Strip script tags and dangerous HTML tags directly
  const stripped = bounded
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:[^"']*/gi, '');

  // HTML entity encode remaining sensitive characters
  return stripped
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Safe JSON parser with prototype pollution protection.
 */
export function safeJSONParse<T>(raw: string, fallback: T): T {
  try {
    const parsed = JSON.parse(raw);
    // Mitigate prototype pollution (__proto__, constructor, prototype)
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown | undefined>;
      delete obj['__proto__'];
      delete obj['constructor'];
      delete obj['prototype'];
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * Validate Event Profile parameters to prevent negative numbers, NaN, or boundary violations.
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateEventConstraints(
  totalBudget: number,
  guestCount: number,
  targetDate: string
): ValidationResult {
  const errors: string[] = [];

  if (isNaN(totalBudget) || totalBudget < 5000) {
    errors.push('Total budget must be at least 5,000 in your selected currency.');
  }

  if (totalBudget > 1000000000) {
    errors.push('Total budget exceeds maximum allowed calculation threshold.');
  }

  if (isNaN(guestCount) || guestCount < 1) {
    errors.push('Guest count must be at least 1 attendee.');
  }

  if (guestCount > 50000) {
    errors.push('Guest count exceeds standard event ceiling (50,000).');
  }

  if (!targetDate || isNaN(Date.parse(targetDate))) {
    errors.push('Target date must be a valid calendar date.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
