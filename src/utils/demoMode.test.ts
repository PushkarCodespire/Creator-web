import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isDemoMode,
  getDemoMessage,
  showDemoTooltip,
  getDemoDataIndicator,
  isDemoBannerDismissed,
  resetDemoBanner,
  logDemoInfo,
} from './demoMode';

describe('demoMode', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Restore env
    Object.defineProperty(import.meta, 'env', { value: originalEnv });
  });

  describe('isDemoMode', () => {
    it('returns false when VITE_DEMO_MODE is not set', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...originalEnv, VITE_DEMO_MODE: undefined },
      });
      expect(isDemoMode()).toBe(false);
    });

    it('returns false when VITE_DEMO_MODE is "false"', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...originalEnv, VITE_DEMO_MODE: 'false' },
      });
      expect(isDemoMode()).toBe(false);
    });
  });

  describe('getDemoMessage', () => {
    it('returns payment message for "payment"', () => {
      const msg = getDemoMessage('payment');
      expect(msg).toContain('Payment processing is simulated');
    });

    it('returns email message for "email"', () => {
      const msg = getDemoMessage('email');
      expect(msg).toContain('Email sending is disabled');
    });

    it('returns payout message for "payout"', () => {
      const msg = getDemoMessage('payout');
      expect(msg).toContain('Payouts are simulated');
    });

    it('returns openai message for "openai"', () => {
      const msg = getDemoMessage('openai');
      expect(msg).toContain('AI chat is fully functional');
    });

    it('returns default message for unknown feature', () => {
      const msg = getDemoMessage('unknown-feature');
      expect(msg).toContain('demo mode for demonstration purposes');
    });

    it('is case-insensitive', () => {
      const msg = getDemoMessage('PAYMENT');
      expect(msg).toContain('Payment processing is simulated');
    });
  });

  describe('showDemoTooltip', () => {
    it('does nothing when not in demo mode', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...originalEnv, VITE_DEMO_MODE: 'false' },
      });
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      showDemoTooltip('payment');
      expect(consoleSpy).not.toHaveBeenCalled();
    });

  });

  describe('getDemoDataIndicator', () => {
    it('returns empty string when not in demo mode', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...originalEnv, VITE_DEMO_MODE: 'false' },
      });
      expect(getDemoDataIndicator()).toBe('');
    });

  });

  describe('isDemoBannerDismissed', () => {
    it('returns false when not dismissed', () => {
      expect(isDemoBannerDismissed()).toBe(false);
    });

    it('returns true when dismissed', () => {
      localStorage.setItem('demo-mode-banner-dismissed', 'true');
      expect(isDemoBannerDismissed()).toBe(true);
    });

    it('supports custom storage key', () => {
      localStorage.setItem('my-key', 'true');
      expect(isDemoBannerDismissed('my-key')).toBe(true);
    });
  });

  describe('resetDemoBanner', () => {
    it('removes the banner dismissal from localStorage', () => {
      localStorage.setItem('demo-mode-banner-dismissed', 'true');
      resetDemoBanner();
      expect(localStorage.getItem('demo-mode-banner-dismissed')).toBeNull();
    });

    it('supports custom storage key', () => {
      localStorage.setItem('my-key', 'true');
      resetDemoBanner('my-key');
      expect(localStorage.getItem('my-key')).toBeNull();
    });
  });

  describe('logDemoInfo', () => {
    it('does nothing when not in demo mode', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { ...originalEnv, VITE_DEMO_MODE: 'false' },
      });
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logDemoInfo();
      expect(consoleSpy).not.toHaveBeenCalled();
    });

  });
});
