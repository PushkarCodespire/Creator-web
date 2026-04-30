import { CHAT_CONFIG, isChatWiredUp, getBackendIdForSlug } from '../config';

describe('CHAT_CONFIG', () => {
  it('is defined', () => {
    expect(CHAT_CONFIG).toBeDefined();
  });

  it('has freeTrialLimit of 5', () => {
    expect(CHAT_CONFIG.freeTrialLimit).toBe(5);
  });

  it('has creatorBackendIds object', () => {
    expect(typeof CHAT_CONFIG.creatorBackendIds).toBe('object');
    expect('raghav' in CHAT_CONFIG.creatorBackendIds).toBe(true);
    expect('krishansh' in CHAT_CONFIG.creatorBackendIds).toBe(true);
    expect('ravya' in CHAT_CONFIG.creatorBackendIds).toBe(true);
  });

  it('has apiUrl string', () => {
    expect(typeof CHAT_CONFIG.apiUrl).toBe('string');
  });
});

describe('isChatWiredUp', () => {
  it('returns a boolean', () => {
    expect(typeof isChatWiredUp()).toBe('boolean');
  });

  it('returns false when apiUrl is empty (test env has no VITE_API_URL)', () => {
    // In test env VITE_API_URL is not set so apiUrl is ''
    expect(isChatWiredUp()).toBe(false);
  });
});

describe('getBackendIdForSlug', () => {
  it('returns a string for known slug', () => {
    expect(typeof getBackendIdForSlug('raghav')).toBe('string');
  });

  it('returns empty string for unknown slug', () => {
    expect(getBackendIdForSlug('unknown-creator-xyz')).toBe('');
  });

  it('returns empty string for empty slug', () => {
    expect(getBackendIdForSlug('')).toBe('');
  });
});
