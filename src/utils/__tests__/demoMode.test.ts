vi.mock('../logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { getDemoMessage, isDemoBannerDismissed, resetDemoBanner, getDemoDataIndicator } from '../demoMode';

describe('getDemoMessage', () => {
  it('returns payment message', () => {
    expect(getDemoMessage('payment')).toContain('Payment');
  });

  it('returns email message', () => {
    expect(getDemoMessage('email')).toContain('email');
  });

  it('returns payout message', () => {
    expect(getDemoMessage('payout')).toContain('Payouts');
  });

  it('returns default message for unknown feature', () => {
    expect(getDemoMessage('unknown-feature')).toContain('demo mode');
  });

  it('is case-insensitive', () => {
    expect(getDemoMessage('PAYMENT')).toContain('Payment');
  });
});

describe('isDemoBannerDismissed', () => {
  beforeEach(() => localStorage.clear());

  it('returns false when not dismissed', () => {
    expect(isDemoBannerDismissed()).toBe(false);
  });

  it('returns true when dismissed', () => {
    localStorage.setItem('demo-mode-banner-dismissed', 'true');
    expect(isDemoBannerDismissed()).toBe(true);
  });

  it('accepts custom storage key', () => {
    localStorage.setItem('custom-key', 'true');
    expect(isDemoBannerDismissed('custom-key')).toBe(true);
  });
});

describe('resetDemoBanner', () => {
  it('removes dismissal from localStorage', () => {
    localStorage.setItem('demo-mode-banner-dismissed', 'true');
    resetDemoBanner();
    expect(localStorage.getItem('demo-mode-banner-dismissed')).toBeNull();
  });
});

describe('getDemoDataIndicator', () => {
  it('returns empty string when not in demo mode', () => {
    // VITE_DEMO_MODE is 'false' per setup.ts
    expect(getDemoDataIndicator()).toBe('');
  });
});
