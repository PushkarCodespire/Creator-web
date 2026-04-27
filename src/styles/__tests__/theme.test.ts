import { antdTheme, darkTheme, globalStyles } from '../theme';

describe('antdTheme', () => {
  it('is defined', () => {
    expect(antdTheme).toBeDefined();
  });

  it('has token property', () => {
    expect(antdTheme.token).toBeDefined();
  });

  it('has a primary color', () => {
    expect(antdTheme.token?.colorPrimary).toBeDefined();
    expect(typeof antdTheme.token?.colorPrimary).toBe('string');
  });
});

describe('darkTheme', () => {
  it('is defined', () => {
    expect(darkTheme).toBeDefined();
  });

  it('has token property', () => {
    expect(darkTheme.token).toBeDefined();
  });
});

describe('globalStyles', () => {
  it('is a string', () => {
    expect(typeof globalStyles).toBe('string');
  });

  it('is not empty', () => {
    expect(globalStyles.length).toBeGreaterThan(0);
  });
});
