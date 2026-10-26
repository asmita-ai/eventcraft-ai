import { CurrencyCode } from '../types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

/**
 * Format a number into clean currency format.
 * For INR, supports standard Indian lakh/crore formatting or readable compact format.
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  compact = false
): string {
  if (isNaN(amount)) return `${CURRENCY_SYMBOLS[currency]}0`;

  if (compact) {
    if (currency === 'INR') {
      if (Math.abs(amount) >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
      }
      if (Math.abs(amount) >= 100000) {
        return `₹${(amount / 100000).toFixed(2)} L`;
      }
      if (Math.abs(amount) >= 1000) {
        return `₹${(amount / 1000).toFixed(1)} k`;
      }
      return `₹${Math.round(amount)}`;
    } else {
      if (Math.abs(amount) >= 1000000) {
        return `${CURRENCY_SYMBOLS[currency]}${(amount / 1000000).toFixed(1)}M`;
      }
      if (Math.abs(amount) >= 1000) {
        return `${CURRENCY_SYMBOLS[currency]}${(amount / 1000).toFixed(1)}k`;
      }
      return `${CURRENCY_SYMBOLS[currency]}${Math.round(amount)}`;
    }
  }

  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse an input string into a number.
 */
export function parseCurrencyInput(val: string): number {
  const cleaned = val.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
