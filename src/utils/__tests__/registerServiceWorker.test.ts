vi.mock('../logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import {
  registerServiceWorker,
  unregisterServiceWorker,
  requestNotificationPermission,
  isStandalone,
  setupInstallPrompt,
} from '../registerServiceWorker';

describe('registerServiceWorker', () => {
  it('registers a load listener when serviceWorker is available', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    const mockRegister = vi.fn().mockResolvedValue({
      addEventListener: vi.fn(),
      installing: null,
    });
    const mockSW = {
      register: mockRegister,
      addEventListener: vi.fn(),
      controller: null,
    };
    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockSW,
      configurable: true,
    });

    registerServiceWorker();
    expect(addEventListenerSpy).toHaveBeenCalledWith('load', expect.any(Function));

    addEventListenerSpy.mockRestore();
  });
});

describe('unregisterServiceWorker', () => {
  it('calls serviceWorker.ready when available', () => {
    const mockUnregister = vi.fn();
    const mockReady = Promise.resolve({ unregister: mockUnregister });
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { ready: mockReady },
      configurable: true,
    });
    expect(() => unregisterServiceWorker()).not.toThrow();
  });
});

describe('requestNotificationPermission', () => {
  it('returns false when permission is denied', async () => {
    (window as any).Notification = { requestPermission: vi.fn().mockResolvedValue('denied') };
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { ready: Promise.resolve({}) },
      configurable: true,
    });

    const result = await requestNotificationPermission();
    expect(result).toBe(false);
  });

  it('returns true when permission is granted', async () => {
    (window as any).Notification = { requestPermission: vi.fn().mockResolvedValue('granted') };
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { ready: Promise.resolve({}) },
      configurable: true,
    });

    const result = await requestNotificationPermission();
    expect(result).toBe(true);
  });
});

describe('isStandalone', () => {
  it('returns a boolean', () => {
    const result = isStandalone();
    expect(typeof result).toBe('boolean');
  });
});

describe('setupInstallPrompt', () => {
  it('registers beforeinstallprompt listener', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const onInstallable = vi.fn();
    setupInstallPrompt(onInstallable);
    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
    addEventListenerSpy.mockRestore();
  });
});
