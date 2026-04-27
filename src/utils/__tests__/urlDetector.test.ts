import { detectUrls, isValidUrl, extractFirstUrl } from '../urlDetector';

describe('detectUrls', () => {
  it('returns empty array for empty string', () => {
    expect(detectUrls('')).toEqual([]);
  });

  it('returns empty array for text without URLs', () => {
    expect(detectUrls('Hello world, no links here')).toEqual([]);
  });

  it('detects a single URL', () => {
    const result = detectUrls('Check out https://example.com for more');
    expect(result).toEqual(['https://example.com']);
  });

  it('detects multiple URLs', () => {
    const result = detectUrls('Visit https://foo.com and https://bar.org');
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('https://foo.com');
    expect(result[1]).toBe('https://bar.org');
  });

  it('detects http URLs', () => {
    const result = detectUrls('See http://example.com');
    expect(result).toEqual(['http://example.com']);
  });
});

describe('isValidUrl', () => {
  it('returns true for valid URL', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('returns true for URL with path', () => {
    expect(isValidUrl('https://example.com/path?q=1')).toBe(true);
  });

  it('returns false for plain text', () => {
    expect(isValidUrl('not a url')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidUrl('')).toBe(false);
  });
});

describe('extractFirstUrl', () => {
  it('returns null for text without URLs', () => {
    expect(extractFirstUrl('no url here')).toBeNull();
  });

  it('returns first URL', () => {
    expect(extractFirstUrl('See https://first.com and https://second.com')).toBe('https://first.com');
  });
});
