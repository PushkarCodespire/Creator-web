import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from './useDarkMode';

describe('useDarkMode', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    // Reset matchMedia mock to return false by default
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('defaults to false when no localStorage and system prefers light', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(false);
  });

  it('defaults to true when system prefers dark', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(true);
  });

  it('reads initial value from localStorage ("true")', () => {
    localStorage.setItem('darkMode', 'true');
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(true);
  });

  it('reads initial value from localStorage ("false")', () => {
    localStorage.setItem('darkMode', 'false');
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(false);
  });

  it('toggleDarkMode toggles from false to true', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(false);

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.isDarkMode).toBe(true);
  });

  it('toggleDarkMode toggles from true to false', () => {
    localStorage.setItem('darkMode', 'true');
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(true);

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.isDarkMode).toBe(false);
  });

  it('setDarkMode sets to a specific value', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.setDarkMode(true);
    });
    expect(result.current.isDarkMode).toBe(true);

    act(() => {
      result.current.setDarkMode(false);
    });
    expect(result.current.isDarkMode).toBe(false);
  });

  it('persists dark mode to localStorage', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  it('adds "dark" class to documentElement when dark mode is on', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.setDarkMode(true);
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes "dark" class from documentElement when dark mode is off', () => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'true');

    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.setDarkMode(false);
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('dispatches "darkModeChange" event on toggle', () => {
    const listener = vi.fn();
    window.addEventListener('darkModeChange', listener);

    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(listener).toHaveBeenCalled();

    window.removeEventListener('darkModeChange', listener);
  });

  it('registers a listener for system preference changes', () => {
    const addEventListenerSpy = vi.fn();
    const removeEventListenerSpy = vi.fn();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: addEventListenerSpy,
        removeEventListener: removeEventListenerSpy,
        dispatchEvent: vi.fn(),
      })),
    });

    const { unmount } = renderHook(() => useDarkMode());

    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
