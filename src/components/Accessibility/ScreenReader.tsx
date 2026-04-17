// ===========================================
// SCREEN READER SUPPORT
// ARIA labels and live regions
// ===========================================

import { useRef } from 'react';

/**
 * Hook to announce messages to screen readers
 */
export function useScreenReaderAnnouncement() {
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.setAttribute('aria-atomic', 'true');
      announcementRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  return { announce, announcementRef };
}

/**
 * Screen reader announcement component
 */
export const ScreenReaderAnnouncement: React.FC = () => {
  return (
    <div
      id="screen-reader-announcements"
      ref={(el) => {
        if (el) {
          el.setAttribute('aria-live', 'polite');
          el.setAttribute('aria-atomic', 'true');
          el.style.position = 'absolute';
          el.style.left = '-10000px';
          el.style.width = '1px';
          el.style.height = '1px';
          el.style.overflow = 'hidden';
        }
      }}
    />
  );
};

/**
 * Helper to generate ARIA labels for interactive elements
 */
export const getAriaLabel = (element: string, context?: string): string => {
  const labels: Record<string, string> = {
    'chat-input': 'Type your message',
    'send-button': 'Send message',
    'creator-card': 'View creator profile',
    'start-chat': 'Start conversation with this creator',
    'search': 'Search creators',
    'filter': 'Filter creators',
    'menu': 'Navigation menu',
    'close': 'Close',
    'back': 'Go back',
  };

  const baseLabel = labels[element] || element;
  return context ? `${baseLabel}: ${context}` : baseLabel;
};



