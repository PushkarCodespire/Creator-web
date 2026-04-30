import { CREATORS } from '../creators-data';

describe('creators-data', () => {
  it('exports a non-empty CREATORS array', () => {
    expect(Array.isArray(CREATORS)).toBe(true);
    expect(CREATORS.length).toBeGreaterThan(0);
  });

  it('each creator has required fields', () => {
    for (const c of CREATORS) {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.title).toBeTruthy();
      expect(Array.isArray(c.tags)).toBe(true);
      expect(Array.isArray(c.questions)).toBe(true);
    }
  });

  it('creator images are strings', () => {
    for (const c of CREATORS) {
      expect(typeof c.cardImg).toBe('string');
      expect(typeof c.modalImg).toBe('string');
    }
  });
});
