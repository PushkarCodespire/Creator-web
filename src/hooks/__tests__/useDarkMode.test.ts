import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from '../useDarkMode';

describe('useDarkMode', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('returns isDarkMode, toggleDarkMode, setDarkMode', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(typeof result.current.isDarkMode).toBe('boolean');
    expect(typeof result.current.toggleDarkMode).toBe('function');
    expect(typeof result.current.setDarkMode).toBe('function');
  });

  it('toggles dark mode', () => {
    const { result } = renderHook(() => useDarkMode());
    const initial = result.current.isDarkMode;
    act(() => {
      result.current.toggleDarkMode();
    });
    expect(result.current.isDarkMode).toBe(!initial);
  });

  it('persists dark mode to localStorage', () => {
    const { result } = renderHook(() => useDarkMode());
    act(() => {
      result.current.setDarkMode(true);
    });
    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  it('reads initial value from localStorage', () => {
    localStorage.setItem('darkMode', 'true');
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(true);
  });

  it('adds dark class when isDarkMode is true', () => {
    const { result } = renderHook(() => useDarkMode());
    act(() => {
      result.current.setDarkMode(true);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
