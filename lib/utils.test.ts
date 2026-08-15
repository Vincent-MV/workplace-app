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

    describe('with a fixed system time', () => {
      // Dates are built from local (year, month, day, hour, ...) components,
      // rather than hardcoded UTC ISO strings, so the expected calendar-day
      // difference holds true no matter which timezone the test runner uses
      // (daysAgo strips time via the local getHours/setHours).
      afterEach(() => {
        jest.useRealTimers();
      });

      test('should return 0 when the date is later today (same calendar day, different time)', () => {
        // "now" is 09:00, but the date being checked is 20:00 the same day.
        // A naive abs(diff)/ceil implementation would incorrectly report 1 day.
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 7, 15, 9, 0, 0));

        expect(daysAgo(new Date(2026, 7, 15, 20, 0, 0).toISOString())).toBe(0);
      });

      test('should return 1 when the date is yesterday, regardless of the time-of-day gap', () => {
        // "now" is 23:00, the date is 01:00 the previous day: a 22-hour gap that
        // spans a calendar-day boundary. Time-stripping ensures this is exactly 1,
        // not 2 (which Math.ceil on the raw millisecond diff would have produced).
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 7, 15, 23, 0, 0));

        expect(daysAgo(new Date(2026, 7, 14, 1, 0, 0).toISOString())).toBe(1);
      });

      test('should return a negative number for a future date', () => {
        // The updated implementation no longer takes Math.abs() of the diff,
        // so dates in the future should yield negative values.
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 7, 15, 9, 0, 0));

        expect(daysAgo(new Date(2026, 7, 16, 9, 0, 0).toISOString())).toBe(-1);
      });

      test('should return exactly 7 for a date exactly 7 calendar days ago', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 7, 15, 12, 0, 0));

        expect(daysAgo(new Date(2026, 7, 8, 0, 0, 0).toISOString())).toBe(7);
      });

      test('should correctly compute the day count across a month boundary', () => {
        // "now" is Sep 2, the date is Aug 31 (23:50): a short 26-hour gap that
        // still spans two calendar-day boundaries and a month boundary.
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 8, 2, 1, 0, 0));

        expect(daysAgo(new Date(2026, 7, 31, 23, 50, 0).toISOString())).toBe(2);
      });
    });

    test('should return NaN for an invalid date string', () => {
      expect(daysAgo('not-a-real-date')).toBeNaN();
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