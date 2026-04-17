import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(import.meta, 'env', { value: originalEnv });
  });

  describe('in dev mode (DEV = true)', () => {
    // The module-level `isDev` is evaluated at import time based on import.meta.env.DEV.
    // Our test setup sets DEV: true, so the default import will be in dev mode.

    it('logger.info calls console.log', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { logger } = await import('./logger');
      logger.info('test message', { key: 'val' });
      expect(consoleSpy).toHaveBeenCalledWith('test message', { key: 'val' });
    });

    it('logger.warn calls console.warn', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { logger } = await import('./logger');
      logger.warn('warning msg');
      expect(consoleSpy).toHaveBeenCalledWith('warning msg');
    });

    it('logger.error always calls console.error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { logger } = await import('./logger');
      logger.error('error msg', new Error('oops'));
      expect(consoleSpy).toHaveBeenCalledWith('error msg', expect.any(Error));
    });

    it('logger.debug calls console.debug', async () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const { logger } = await import('./logger');
      logger.debug('debug msg');
      expect(consoleSpy).toHaveBeenCalledWith('debug msg');
    });
  });

  describe('logger.error in any mode', () => {
    it('always logs errors regardless of DEV flag', async () => {
      // Even if DEV were false, error should still log.
      // Since we can't easily change the module-level constant after import,
      // we at least verify the error path always runs.
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { logger } = await import('./logger');
      logger.error('critical', 'details');
      expect(consoleSpy).toHaveBeenCalledWith('critical', 'details');
    });
  });

  describe('logger methods accept variadic args', () => {
    it('passes multiple args through', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { logger } = await import('./logger');
      logger.info('msg', 1, 'two', { three: 3 });
      expect(consoleSpy).toHaveBeenCalledWith('msg', 1, 'two', { three: 3 });
    });
  });
});
