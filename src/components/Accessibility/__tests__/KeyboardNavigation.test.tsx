vi.mock('../../../styles/tokens', () => ({
  colors: {
    primary: { solid: '#7c3aed' },
    gray: { 100: '#f3f4f6', 200: '#e5e7eb' },
  },
}));

import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import {
  useKeyboardNavigation,
  useFocusTrap,
  SkipNavigation,
} from '../KeyboardNavigation';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Wrapper that exposes the containerRef from useKeyboardNavigation */
function KeyboardNavWrapper({ children }: { children?: React.ReactNode }) {
  const containerRef = useKeyboardNavigation();
  return (
    <div ref={containerRef} data-testid="nav-container">
      {children}
    </div>
  );
}

/** Wrapper that activates/deactivates the focus trap */
function FocusTrapWrapper({ isActive }: { isActive: boolean }) {
  useFocusTrap(isActive);
  return (
    <div className="ant-modal">
      <button>First</button>
      <button>Second</button>
      <button>Last</button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SkipNavigation
// ---------------------------------------------------------------------------

describe('SkipNavigation', () => {
  it('renders a skip link', () => {
    render(<SkipNavigation />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toBeInTheDocument();
  });

  it('points to #main-content', () => {
    render(<SkipNavigation />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('is visually hidden by default (top:-40px)', () => {
    render(<SkipNavigation />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveStyle({ top: '-40px' });
  });

  it('becomes visible on focus', () => {
    render(<SkipNavigation />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    fireEvent.focus(link);
    expect(link).toHaveStyle({ top: '0' });
  });

  it('hides again on blur', () => {
    render(<SkipNavigation />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    fireEvent.focus(link);
    fireEvent.blur(link);
    expect(link).toHaveStyle({ top: '-40px' });
  });
});

// ---------------------------------------------------------------------------
// useKeyboardNavigation — Escape key
// ---------------------------------------------------------------------------

describe('useKeyboardNavigation – Escape key', () => {
  it('mounts and unmounts without errors', () => {
    const { unmount } = render(<KeyboardNavWrapper />);
    expect(document.querySelector('[data-testid="nav-container"]')).toBeInTheDocument();
    unmount();
  });

  it('Escape key clicks .ant-modal-close when a modal is present', () => {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ant-modal-close';
    const clickSpy = vi.fn();
    closeBtn.addEventListener('click', clickSpy);

    const modal = document.createElement('div');
    modal.className = 'ant-modal';
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);

    render(<KeyboardNavWrapper />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(clickSpy).toHaveBeenCalledTimes(1);

    document.body.removeChild(modal);
  });

  it('Escape key does nothing when no modal/drawer is present', () => {
    render(<KeyboardNavWrapper />);
    // Should not throw
    expect(() => fireEvent.keyDown(document, { key: 'Escape' })).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// useKeyboardNavigation — Arrow key navigation
// ---------------------------------------------------------------------------

describe('useKeyboardNavigation – Arrow keys', () => {
  it('ArrowDown moves focus to next focusable element', () => {
    render(
      <KeyboardNavWrapper>
        <button>A</button>
        <button>B</button>
        <button>C</button>
      </KeyboardNavWrapper>
    );

    const [a, b] = screen.getAllByRole('button');
    act(() => a.focus());
    expect(document.activeElement).toBe(a);

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(b);
  });

  it('ArrowUp moves focus to previous focusable element', () => {
    render(
      <KeyboardNavWrapper>
        <button>A</button>
        <button>B</button>
        <button>C</button>
      </KeyboardNavWrapper>
    );

    const [a, b] = screen.getAllByRole('button');
    act(() => b.focus());
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(a);
  });

  it('ignores Arrow keys when typing in an input', () => {
    render(
      <KeyboardNavWrapper>
        <input data-testid="text-input" />
        <button>A</button>
        <button>B</button>
      </KeyboardNavWrapper>
    );

    const input = screen.getByTestId('text-input');
    act(() => input.focus());

    // Should not throw and should not move focus away from the input
    fireEvent.keyDown(input, { key: 'ArrowDown', target: input });
    expect(document.activeElement).toBe(input);
  });
});

// ---------------------------------------------------------------------------
// useFocusTrap
// ---------------------------------------------------------------------------

describe('useFocusTrap', () => {
  it('renders children when inactive', () => {
    render(<FocusTrapWrapper isActive={false} />);
    expect(screen.getByText('First')).toBeInTheDocument();
  });

  it('focuses the first element when activated', () => {
    render(<FocusTrapWrapper isActive />);
    // First focusable element inside .ant-modal should receive focus
    expect(document.activeElement?.textContent).toBe('First');
  });

  it('does not throw when activated but no modal element exists', () => {
    // useFocusTrap looks for .ant-modal; if nothing matches, it should bail
    function NoModal() {
      useFocusTrap(true);
      return <div><button>Lone</button></div>;
    }
    expect(() => render(<NoModal />)).not.toThrow();
  });
});
