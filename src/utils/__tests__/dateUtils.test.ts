import { formatRelativeTime, formatDateTime, formatShortDate } from '../dateUtils';

describe('formatRelativeTime', () => {
  it('returns "just now" for recent dates', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('returns minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('5 minutes ago');
  });

  it('returns singular minute', () => {
    const date = new Date(Date.now() - 1 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('1 minute ago');
  });

  it('returns hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('3 hours ago');
  });

  it('returns days ago', () => {
    const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('3 days ago');
  });

  it('returns weeks ago', () => {
    const date = new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('2 weeks ago');
  });

  it('accepts string date', () => {
    const date = new Date(Date.now() - 30 * 1000);
    expect(formatRelativeTime(date.toISOString())).toBe('just now');
  });
});

describe('formatDateTime', () => {
  it('returns a formatted date string', () => {
    const date = new Date('2024-01-15T15:30:00');
    const result = formatDateTime(date);
    expect(result).toContain('2024');
    expect(typeof result).toBe('string');
  });

  it('accepts string date', () => {
    const result = formatDateTime('2024-06-01T10:00:00');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatShortDate', () => {
  it('returns short date format', () => {
    const date = new Date('2024-01-15');
    const result = formatShortDate(date);
    expect(result).toContain('Jan');
    expect(result).toContain('15');
  });

  it('accepts string date', () => {
    const result = formatShortDate('2024-06-01');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
