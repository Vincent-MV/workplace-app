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