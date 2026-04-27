import { logger } from '../logger';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logger.error always logs', () => {
    logger.error('test error', { detail: 'extra' });
    expect(console.error).toHaveBeenCalledWith('test error', { detail: 'extra' });
  });

  it('logger.info is callable', () => {
    expect(() => logger.info('test info')).not.toThrow();
  });

  it('logger.warn is callable', () => {
    expect(() => logger.warn('test warn')).not.toThrow();
  });

  it('logger.debug is callable', () => {
    expect(() => logger.debug('test debug')).not.toThrow();
  });
});
