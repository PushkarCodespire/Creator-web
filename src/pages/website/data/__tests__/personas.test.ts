vi.mock('../creators-data', () => ({
  CREATORS: [
    {
      id: 'creator-slug',
      name: 'Test Creator',
      title: 'Expert',
      chats: '100+ Chats',
      about: 'About text',
      tags: ['tag1'],
      questions: ['Question 1?', 'Question 2?'],
      cardImg: '/card.jpg',
      modalImg: '/modal.jpg',
    },
  ],
}));

import { PERSONAS, getPersonaBySlug } from '../personas';

describe('PERSONAS', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(PERSONAS)).toBe(true);
    expect(PERSONAS.length).toBeGreaterThan(0);
  });

  it('each persona has required fields', () => {
    PERSONAS.forEach((p) => {
      expect(typeof p.slug).toBe('string');
      expect(typeof p.name).toBe('string');
      expect(typeof p.title).toBe('string');
      expect(typeof p.about).toBe('string');
      expect(Array.isArray(p.starters)).toBe(true);
    });
  });

  it('includes the mocked creator converted to a persona', () => {
    const match = PERSONAS.find((p) => p.slug === 'creator-slug');
    expect(match).toBeDefined();
    expect(match?.name).toBe('Test Creator');
    expect(match?.title).toBe('Expert');
  });

  it('includes the hardcoded find-expert personas', () => {
    const slugs = PERSONAS.map((p) => p.slug);
    expect(slugs).toContain('brandon-burchard');
    expect(slugs).toContain('dr-todd-howard');
    expect(slugs).toContain('dr-tom-segall');
    expect(slugs).toContain('nick-drab');
  });
});

describe('getPersonaBySlug', () => {
  it('returns the correct persona for a known slug', () => {
    const p = getPersonaBySlug('brandon-burchard');
    expect(p).not.toBeNull();
    expect(p?.name).toBe('Brandon Burchard');
  });

  it('returns null for an unknown slug', () => {
    expect(getPersonaBySlug('does-not-exist')).toBeNull();
  });

  it('returns null for an empty slug', () => {
    expect(getPersonaBySlug('')).toBeNull();
  });

  it('returns the creator-derived persona by slug', () => {
    const p = getPersonaBySlug('creator-slug');
    expect(p).not.toBeNull();
    expect(p?.name).toBe('Test Creator');
  });
});
