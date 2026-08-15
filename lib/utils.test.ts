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

    test('should return 7 for a date seven days ago', () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      expect(daysAgo(sevenDaysAgo.toISOString())).toBe(7);
    });

    test('should return a negative number for a date in the future', () => {
      // Regression test: the old implementation used Math.abs(), which made
      // it impossible to distinguish past from future dates. The current
      // implementation should surface future dates as negative values.
      const fiveDaysFromNow = new Date();
      fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
      expect(daysAgo(fiveDaysFromNow.toISOString())).toBe(-5);
    });

    test('should return 0 for two timestamps on the same calendar day, regardless of time of day', () => {
      // Boundary test: even though these two instants are ~23h59m apart,
      // they fall on the same local calendar day, so daysAgo should treat
      // them as "today" (0), since the time-of-day is stripped before diffing.
      jest.useFakeTimers();
      const now = new Date(2026, 7, 15, 23, 59, 0);
      const earlierToday = new Date(2026, 7, 15, 0, 1, 0);
      jest.setSystemTime(now);

      expect(daysAgo(earlierToday.toISOString())).toBe(0);

      jest.useRealTimers();
    });

    test('should return 1 for a date on the previous calendar day even if less than 24 hours have elapsed', () => {
      // Boundary test: these two instants are only ~10 minutes apart in real
      // time, but they cross a midnight boundary, so daysAgo should report 1
      // full day rather than 0.
      jest.useFakeTimers();
      const now = new Date(2026, 7, 15, 0, 5, 0);
      const lateLastNight = new Date(2026, 7, 14, 23, 55, 0);
      jest.setSystemTime(now);

      expect(daysAgo(lateLastNight.toISOString())).toBe(1);

      jest.useRealTimers();
    });

    test('should return the same result when called multiple times with the same input', () => {
      const someDate = new Date(2026, 7, 10, 12, 30, 0).toISOString();
      expect(daysAgo(someDate)).toBe(daysAgo(someDate));
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