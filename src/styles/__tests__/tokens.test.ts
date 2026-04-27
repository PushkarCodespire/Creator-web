import { colors, typography, spacing, shadows, borderRadius } from '../tokens';

describe('colors', () => {
  it('is defined', () => {
    expect(colors).toBeDefined();
  });

  it('has primary colors', () => {
    expect(colors.primary).toBeDefined();
    expect(typeof colors.primary.solid).toBe('string');
  });

  it('has error colors', () => {
    expect(colors.error).toBeDefined();
  });
});

describe('typography', () => {
  it('is defined', () => {
    expect(typography).toBeDefined();
  });
});

describe('spacing', () => {
  it('is defined', () => {
    expect(spacing).toBeDefined();
  });
});

describe('shadows', () => {
  it('is defined', () => {
    expect(shadows).toBeDefined();
  });
});

describe('borderRadius', () => {
  it('is defined', () => {
    expect(borderRadius).toBeDefined();
  });
});
