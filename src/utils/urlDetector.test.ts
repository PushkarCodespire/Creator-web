import { describe, it, expect } from 'vitest';
import { detectUrls, isValidUrl, extractFirstUrl } from './urlDetector';

describe('urlDetector', () => {
  describe('detectUrls', () => {
    it('returns empty array for empty string', () => {
      expect(detectUrls('')).toEqual([]);
    });

    it('returns empty array for null/undefined', () => {
      expect(detectUrls(null as unknown as string)).toEqual([]);
      expect(detectUrls(undefined as unknown as string)).toEqual([]);
    });

    it('detects a single HTTP URL', () => {
      expect(detectUrls('visit http://example.com for more')).toEqual([
        'http://example.com',
      ]);
    });

    it('detects a single HTTPS URL', () => {
      expect(detectUrls('see https://example.com/page')).toEqual([
        'https://example.com/page',
      ]);
    });

    it('detects multiple URLs in text', () => {
      const text = 'check http://a.com and https://b.com/path today';
      const urls = detectUrls(text);
      expect(urls).toHaveLength(2);
      expect(urls).toContain('http://a.com');
      expect(urls).toContain('https://b.com/path');
    });

    it('returns empty array when no URLs found', () => {
      expect(detectUrls('no urls here just text')).toEqual([]);
    });

    it('detects URLs with query parameters', () => {
      const urls = detectUrls('go to https://example.com/search?q=test&page=1');
      expect(urls).toHaveLength(1);
      expect(urls[0]).toContain('q=test');
    });

    it('detects URLs with paths', () => {
      const urls = detectUrls('https://example.com/a/b/c');
      expect(urls).toEqual(['https://example.com/a/b/c']);
    });
  });

  describe('isValidUrl', () => {
    it('returns true for valid http URL', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('returns true for valid https URL', () => {
      expect(isValidUrl('https://example.com/path')).toBe(true);
    });

    it('returns false for plain text', () => {
      expect(isValidUrl('not a url')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidUrl('')).toBe(false);
    });

    it('returns true for URL with port', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('returns true for ftp protocol', () => {
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
    });

    it('returns false for partial URL without protocol', () => {
      expect(isValidUrl('example.com')).toBe(false);
    });
  });

  describe('extractFirstUrl', () => {
    it('returns the first URL from text', () => {
      expect(
        extractFirstUrl('visit http://first.com and http://second.com')
      ).toBe('http://first.com');
    });

    it('returns null when no URL found', () => {
      expect(extractFirstUrl('no urls here')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(extractFirstUrl('')).toBeNull();
    });
  });
});
