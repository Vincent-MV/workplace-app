import { daysAgo, formatDate, formatDateTime, todayISO } from './utils';

describe('Utility Functions', () => {
  
  // Custom logic and math
  describe('daysAgo', () => {
    test('should return 0 for today', () => {
      const today = new Date().toISOString();
      expect(daysAgo(today)).toBe(0);
    });

    test('should return 1 for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(daysAgo(yesterday.toISOString())).toBe(1);
    });

    test('should return 5 for a date five days ago', () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      expect(daysAgo(fiveDaysAgo.toISOString())).toBe(5);
    });

    test('should return a negative number for a date in the future', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(daysAgo(tomorrow.toISOString())).toBe(-1);
    });

    test('should ignore time-of-day and treat any time today as 0 days ago', () => {
      const justAfterMidnight = new Date();
      justAfterMidnight.setHours(0, 0, 1, 0);
      expect(daysAgo(justAfterMidnight.toISOString())).toBe(0);

      const justBeforeMidnight = new Date();
      justBeforeMidnight.setHours(23, 59, 59, 999);
      expect(daysAgo(justBeforeMidnight.toISOString())).toBe(0);
    });

    test('should not round a sub-day difference up to a full day (regression for previous Math.ceil bug)', () => {
      // Previously this used Math.ceil on the raw (non-midnight-normalized) time difference,
      // which meant two timestamps on the same calendar day, but a few hours apart, could
      // incorrectly be reported as 1 day ago instead of 0.
      const now = new Date();
      const earlierTodayByFewHours = new Date(now.getTime() - 1000 * 60 * 60 * 3); // 3 hours earlier
      // Only assert same-day when this doesn't cross midnight, to keep the test deterministic.
      if (earlierTodayByFewHours.getDate() === now.getDate()) {
        expect(daysAgo(earlierTodayByFewHours.toISOString())).toBe(0);
      }
    });
  });

  // Native Date wrappers (Good to have, but simple)
  describe('Date Formatters', () => {
    test('todayISO should return YYYY-MM-DD format', () => {
      const result = todayISO();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/); // Regex checks for YYYY-MM-DD
    });

    test('formatDate should not throw on valid date', () => {
      expect(() => formatDate('2026-08-15')).not.toThrow();
    });
  });
});