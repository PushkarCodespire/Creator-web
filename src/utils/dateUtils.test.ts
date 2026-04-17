import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTime, formatDateTime, formatShortDate } from './dateUtils';

describe('dateUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Fix "now" to 2024-06-15T12:00:00Z
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatRelativeTime', () => {
    it('returns "just now" for less than 60 seconds ago', () => {
      const date = new Date('2024-06-15T11:59:30Z');
      expect(formatRelativeTime(date)).toBe('just now');
    });

    it('returns "1 minute ago" for exactly 1 minute ago', () => {
      const date = new Date('2024-06-15T11:59:00Z');
      expect(formatRelativeTime(date)).toBe('1 minute ago');
    });

    it('returns plural minutes', () => {
      const date = new Date('2024-06-15T11:45:00Z');
      expect(formatRelativeTime(date)).toBe('15 minutes ago');
    });

    it('returns "1 hour ago" for exactly 1 hour', () => {
      const date = new Date('2024-06-15T11:00:00Z');
      expect(formatRelativeTime(date)).toBe('1 hour ago');
    });

    it('returns plural hours', () => {
      const date = new Date('2024-06-15T06:00:00Z');
      expect(formatRelativeTime(date)).toBe('6 hours ago');
    });

    it('returns "1 day ago" for 1 day', () => {
      const date = new Date('2024-06-14T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('1 day ago');
    });

    it('returns plural days', () => {
      const date = new Date('2024-06-12T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('3 days ago');
    });

    it('returns "1 week ago" for 7 days', () => {
      const date = new Date('2024-06-08T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('1 week ago');
    });

    it('returns plural weeks', () => {
      const date = new Date('2024-06-01T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('2 weeks ago');
    });

    it('returns "1 month ago" for ~30 days', () => {
      const date = new Date('2024-05-15T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('1 month ago');
    });

    it('returns plural months', () => {
      const date = new Date('2024-03-15T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('3 months ago');
    });

    it('returns "1 year ago" for ~365 days', () => {
      const date = new Date('2023-06-15T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('1 year ago');
    });

    it('returns plural years', () => {
      const date = new Date('2022-06-15T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('2 years ago');
    });

    it('accepts a string date', () => {
      const date = '2024-06-15T11:50:00Z';
      expect(formatRelativeTime(date)).toBe('10 minutes ago');
    });

    it('accepts a Date object', () => {
      const date = new Date('2024-06-15T11:50:00Z');
      expect(formatRelativeTime(date)).toBe('10 minutes ago');
    });
  });

  describe('formatDateTime', () => {
    it('formats a Date object to readable string', () => {
      const date = new Date('2024-01-15T15:30:00Z');
      const result = formatDateTime(date);
      // The exact format depends on locale, but should contain key parts
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('formats a string date', () => {
      const result = formatDateTime('2024-01-15T15:30:00Z');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });
  });

  describe('formatShortDate', () => {
    it('formats to short date with month and day', () => {
      const date = new Date('2024-03-20T00:00:00Z');
      const result = formatShortDate(date);
      expect(result).toContain('Mar');
      expect(result).toContain('20');
    });

    it('accepts a string date', () => {
      const result = formatShortDate('2024-12-25T00:00:00Z');
      expect(result).toContain('Dec');
      expect(result).toContain('25');
    });
  });
});
