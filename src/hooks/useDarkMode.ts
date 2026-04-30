// ===========================================
// DARK MODE HOOK
// ===========================================

import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  // Check system preference or localStorage
  const getInitialMode = (): boolean => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    // Check system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [isDarkMode, setIsDarkMode] = useState(getInitialMode);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('darkMode', isDarkMode.toString());

    // Update document class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Dispatch custom event for same-tab theme updates
    window.dispatchEvent(new Event('darkModeChange'));
  }, [isDarkMode]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a preference
      if (localStorage.getItem('darkMode') === null) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return { isDarkMode, toggleDarkMode, setDarkMode: setIsDarkMode };
};

export default useDarkMode;
