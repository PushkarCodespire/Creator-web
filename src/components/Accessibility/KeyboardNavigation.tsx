// ===========================================
// KEYBOARD NAVIGATION UTILITIES
// Enhanced keyboard navigation support
// ===========================================

import { useEffect, useRef } from 'react';

/**
 * Hook to handle keyboard navigation
 * Provides focus management and keyboard shortcuts
 */
export function useKeyboardNavigation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Escape key - close modals/drawers
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.ant-modal');
        const drawers = document.querySelectorAll('.ant-drawer');
        if (modals.length > 0 || drawers.length > 0) {
          // Trigger close on the last opened modal/drawer
          const closeButton = document.querySelector('.ant-modal-close, .ant-drawer-close') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        }
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const focusableElements = containerRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;

        if (focusableElements && focusableElements.length > 0) {
          const currentIndex = Array.from(focusableElements).findIndex(
            (el) => el === document.activeElement
          );

          if (currentIndex !== -1) {
            e.preventDefault();
            const nextIndex =
              e.key === 'ArrowDown'
                ? (currentIndex + 1) % focusableElements.length
                : (currentIndex - 1 + focusableElements.length) % focusableElements.length;
            focusableElements[nextIndex].focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return containerRef;
}

/**
 * Hook for focus trap (for modals, drawers)
 */
export function useFocusTrap(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const modal = document.querySelector('.ant-modal, .ant-drawer') as HTMLElement;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(focusableSelectors) as NodeListOf<HTMLElement>;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      modal.removeEventListener('keydown', handleTab);
    };
  }, [isActive]);
}

/**
 * Component to add skip navigation link
 */
export const SkipNavigation: React.FC = () => {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        top: '-40px',
        left: '0',
        background: colors.primary.solid,
        color: '#fff',
        padding: '8px 16px',
        textDecoration: 'none',
        zIndex: 10000,
        borderRadius: '0 0 4px 0',
      }}
      onFocus={(e) => {
        e.currentTarget.style.top = '0';
      }}
      onBlur={(e) => {
        e.currentTarget.style.top = '-40px';
      }}
    >
      Skip to main content
    </a>
  );
};

// Import colors for SkipNavigation
import { colors } from '../../styles/tokens';



