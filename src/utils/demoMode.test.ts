import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock logger so we can spy on logger.info without worrying about isDev flag
vi.mock('./logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import {
  isDemoMode,
  getDemoMessage,
  showDemoTooltip,
  getDemoDataIndicator,
  isDemoBannerDismissed,
  resetDemoBanner,
  logDemoInfo,
} from './demoMode';
import { logger } from './logger';

describe('demoMode', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('isDemoMode', () => {
    it('returns true when VITE_DEMO_MODE is "true"', () => {
      vi.stubEnv('VITE_DEMO_MODE', 'true');
      expect(isDemoMode()).toBe(true);
    });

    it('returns false when VITE_DEMO_MODE is not set', () => {
      vi.stubEnv('VITE_DEMO_MODE', '');
      expect(isDemoMode()).toBe(false);
    });

    it('returns false when VITE_DEMO_MODE is "false"', () => {
      vi.stubEnv('VITE_DEMO_MODE', 'false');
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
      vi.stubEnv('VITE_DEMO_MODE', 'false');
      showDemoTooltip('payment');
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('logs message when in demo mode', () => {
      vi.stubEnv('VITE_DEMO_MODE', 'true');
      showDemoTooltip('payment');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[DEMO MODE]')
      );
    });

    it('sets title on element when in demo mode', () => {
      vi.stubEnv('VITE_DEMO_MODE', 'true');
      const el = document.createElement('div');
      showDemoTooltip('payment', el);
      expect(el.title).toContain('DEMO MODE');
    });
  });

  describe('getDemoDataIndicator', () => {
    it('returns empty string when not in demo mode', () => {
      vi.stubEnv('VITE_DEMO_MODE', 'false');
      expect(getDemoDataIndicator()).toBe('');
    });

    it('returns "(Demo Data)" when in demo mode', () => {
      vi.stubEnv('VITE_DEMO_MODE', 'true');
      expect(getDemoDataIndicator()).toBe('(Demo Data)');
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
      vi.stubEnv('VITE_DEMO_MODE', 'false');
      logDemoInfo();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('logs demo info when in demo mode', () => {
      vi.stubEnv('VITE_DEMO_MODE', 'true');
      logDemoInfo();
      expect(logger.info).toHaveBeenCalled();
    });
  });
});
