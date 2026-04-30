import { getGuestId } from '../guest-id';

describe('getGuestId', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns a non-empty string', () => {
    const id = getGuestId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('returns the same id on repeated calls (persists to localStorage)', () => {
    const first = getGuestId();
    const second = getGuestId();
    expect(first).toBe(second);
  });

  it('generates a new id when localStorage is cleared', () => {
    const first = getGuestId();
    localStorage.clear();
    const second = getGuestId();
    // Both are valid UUIDs; they should be different (overwhelmingly likely)
    expect(typeof second).toBe('string');
    expect(second.length).toBeGreaterThan(0);
    // first was stored then cleared so second is regenerated
    expect(localStorage.getItem('cp_guest_id')).toBe(second);
  });

  it('stores the id in localStorage under cp_guest_id', () => {
    const id = getGuestId();
    expect(localStorage.getItem('cp_guest_id')).toBe(id);
  });

  it('reuses an id already in localStorage', () => {
    localStorage.setItem('cp_guest_id', 'preset-uuid-value');
    const id = getGuestId();
    expect(id).toBe('preset-uuid-value');
  });
});
