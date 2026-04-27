import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useKeyboardNavigation, useFocusTrap, SkipNavigation } from '../KeyboardNavigation';

describe('useKeyboardNavigation', () => {
  it('returns a containerRef', () => {
    const { result } = renderHook(() => useKeyboardNavigation());
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('current');
  });

  it('cleans up on unmount without error', () => {
    const { unmount } = renderHook(() => useKeyboardNavigation());
    expect(() => unmount()).not.toThrow();
  });
});

describe('useFocusTrap', () => {
  it('works when not active', () => {
    const { unmount } = renderHook(() => useFocusTrap(false));
    expect(() => unmount()).not.toThrow();
  });

  it('works when active', () => {
    const { unmount } = renderHook(() => useFocusTrap(true));
    expect(() => unmount()).not.toThrow();
  });
});

describe('SkipNavigation', () => {
  it('renders skip link', () => {
    const { getByText } = render(<SkipNavigation />);
    expect(getByText('Skip to main content')).toBeTruthy();
  });
});
