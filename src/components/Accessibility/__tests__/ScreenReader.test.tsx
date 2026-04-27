import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { ScreenReaderAnnouncement, useScreenReaderAnnouncement, getAriaLabel } from '../ScreenReader';

describe('ScreenReaderAnnouncement', () => {
  it('renders hidden element', () => {
    const { container } = render(<ScreenReaderAnnouncement />);
    expect(container.firstChild).toBeTruthy();
  });
});

describe('useScreenReaderAnnouncement', () => {
  it('returns announce function and announcementRef', () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());
    expect(typeof result.current.announce).toBe('function');
    expect(result.current.announcementRef).toBeDefined();
  });

  it('announce does not throw without element', () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());
    expect(() => result.current.announce('Test message')).not.toThrow();
  });
});

describe('getAriaLabel', () => {
  it('returns label for known element', () => {
    expect(getAriaLabel('chat-input')).toBe('Type your message');
  });

  it('returns label with context', () => {
    const label = getAriaLabel('creator-card', 'John Doe');
    expect(label).toBe('View creator profile: John Doe');
  });

  it('returns element name for unknown element', () => {
    expect(getAriaLabel('custom-element')).toBe('custom-element');
  });

  it('returns search label', () => {
    expect(getAriaLabel('search')).toBe('Search creators');
  });
});
