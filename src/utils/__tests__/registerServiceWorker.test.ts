vi.mock('../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import {
  registerServiceWorker,
  unregisterServiceWorker,
  requestNotificationPermission,
  isStandalone,
  setupInstallPrompt,
} from '../registerServiceWorker';

describe('registerServiceWorker', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('registerServiceWorker()', () => {
    it('does not add a load event listener when serviceWorker is not in navigator', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      // Remove serviceWorker from navigator
      const originalDescriptor = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');
      Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true });

      registerServiceWorker();

      expect(addEventListenerSpy).not.toHaveBeenCalledWith('load', expect.any(Function));

      // Restore
      if (originalDescriptor) {
        Object.defineProperty(navigator, 'serviceWorker', originalDescriptor);
      }
    });

    it('adds a load event listener when serviceWorker is in navigator', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      // Ensure serviceWorker is present
      if (!('serviceWorker' in navigator)) {
        Object.defineProperty(navigator, 'serviceWorker', {
          value: { register: vi.fn().mockResolvedValue({ addEventListener: vi.fn() }), addEventListener: vi.fn() },
          configurable: true,
        });
      }

      registerServiceWorker();

      expect(addEventListenerSpy).toHaveBeenCalledWith('load', expect.any(Function));
    });
  });

  describe('unregisterServiceWorker()', () => {
    it('does nothing when serviceWorker is not in navigator', () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');
      Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true });

      // Should not throw
      expect(() => unregisterServiceWorker()).not.toThrow();

      if (originalDescriptor) {
        Object.defineProperty(navigator, 'serviceWorker', originalDescriptor);
      }
    });

    it('calls ready.then when serviceWorker is available', () => {
      const unregisterMock = vi.fn().mockResolvedValue(true);
      const readyPromise = Promise.resolve({ unregister: unregisterMock });
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { ready: readyPromise },
        configurable: true,
      });

      unregisterServiceWorker();

      return readyPromise.then(() => {
        expect(unregisterMock).toHaveBeenCalled();
      });
    });
  });

  describe('requestNotificationPermission()', () => {
    it('returns false when Notification is not in window', async () => {
      const originalNotification = (window as any).Notification;
      delete (window as any).Notification;

      const result = await requestNotificationPermission();

      expect(result).toBe(false);

      if (originalNotification !== undefined) {
        (window as any).Notification = originalNotification;
      }
    });

    it('returns true when permission is granted', async () => {
      (window as any).Notification = { requestPermission: vi.fn().mockResolvedValue('granted') };
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {},
        configurable: true,
      });

      const result = await requestNotificationPermission();

      expect(result).toBe(true);
    });

    it('returns false when permission is denied', async () => {
      (window as any).Notification = { requestPermission: vi.fn().mockResolvedValue('denied') };
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {},
        configurable: true,
      });

      const result = await requestNotificationPermission();

      expect(result).toBe(false);
    });
  });

  describe('isStandalone()', () => {
    it('returns true when matchMedia display-mode standalone matches', () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: true,
        media: '(display-mode: standalone)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as MediaQueryList);

      expect(isStandalone()).toBe(true);
    });

    it('returns false when nothing matches', () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: false,
        media: '(display-mode: standalone)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as MediaQueryList);

      // Ensure navigator.standalone is falsy and document.referrer has no android-app://
      Object.defineProperty(window.navigator, 'standalone', { value: false, configurable: true });

      expect(isStandalone()).toBe(false);
    });
  });

  describe('setupInstallPrompt()', () => {
    it('registers a beforeinstallprompt event listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const callback = vi.fn();

      setupInstallPrompt(callback);

      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
    });
  });
});
