// ===========================================
// DESIGN TOKENS
// Design System for AI Creator Platform
// ===========================================

/**
 * Color Palette
 * AI Creator Platform – Brand-first visual identity
 */
export const colors = {
  // Primary – Brand Purple
  primary: {
    // Primary Purple: trust, creativity, AI
    start: '#667EEA',
    end: '#764BA2',
    gradient: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    solid: '#667EEA',
    light: '#A5B4FC',
    dark: '#4C51BF',
    subtle: '#EEF2FF', // Light background for light mode
    subtleDark: '#2A2D5A', // Soft purple for dark mode surfaces
  },

  // Success – Earnings / positive actions
  success: {
    start: '#10B981',
    end: '#22C55E',
    gradient: 'linear-gradient(135deg, #10B981 0%, #22C55E 100%)',
    solid: '#10B981',
    light: '#6EE7B7',
    dark: '#059669',
    subtle: '#ECFDF5',
    subtleDark: '#064E3B',
  },

  // Warning – Alerts / important info
  warning: {
    start: '#F59E0B',
    end: '#FBBF24',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    solid: '#F59E0B',
    light: '#FDE68A',
    dark: '#D97706',
    subtle: '#FFFBEB',
    subtleDark: '#78350F',
  },

  // Error – Destructive actions
  error: {
    start: '#EF4444',
    end: '#DC2626',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    solid: '#EF4444',
    light: '#FCA5A5',
    dark: '#B91C1C',
    subtle: '#FEF2F2',
    subtleDark: '#7F1D1D',
  },

  // Info – Secondary actions / links
  info: {
    solid: '#3B82F6',
    light: '#93C5FD',
    dark: '#1D4ED8',
    subtle: '#EFF6FF',
  },

  // Neutrals – Tailwind-style gray scale
  gray: {
    50: '#FAFBFC',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Semantic surface & text colors
  background: '#FAFBFC',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    disabled: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  // Dark Mode
  dark: {
    background: '#121212',
    surface: '#1e1e1e',
    elevated: '#2c2c2c',
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      disabled: '#6b6b6b',
    },
  },

  // Dark Mode
  social: {
    youtube: '#FF0000',
    instagram:
      'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    twitter: '#1DA1F2',
    facebook: '#1877F2',
  },

  // Semantic brand states
  brand: {
    premiumGold: '#F59E0B',
    creatorBadge: '#10B981',
  },

  // Chat-specific semantic colors
  chat: {
    userBubble: '#667EEA', // You
    aiBubble: '#F3F4F6', // AI responses
  },
};

/**
 * Typography
 * Inter font family with scale
 */
export const typography = {
  fontFamily: {
    // Primary UI font
    base: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    // Display font for hero / key headlines
    display: "'Outfit', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    // Monospace for code, ids
    mono: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Courier New', monospace",
  },

  // Fluid typography scale (desktop base)
  fontSize: {
    // Caption / labels
    xs: '12px',
    // Secondary text
    sm: '14px',
    // Body
    base: '16px',
    // H3 / card titles
    lg: '20px',
    // H2 / section headers
    xl: '24px',
    // H1 / page titles
    '2xl': '32px',
    // Larger H1
    '3xl': '40px',
    // Hero
    '4xl': '48px',
    '5xl': '56px',
    '6xl': '64px',
    '7xl': '72px',
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  letterSpacing: {
    tight: '-0.05em',
    normal: '0',
    wide: '0.05em',
  },
};

/**
 * Spacing
 * 8px-based scale (with 4px micro steps)
 */
export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
};

/**
 * Border Radius
 * Consistent rounding
 */
export const borderRadius = {
  none: '0',
  // Small elements – buttons, tags
  sm: '6px',
  // Medium – inputs, small cards
  md: '12px',
  // Large – cards, surfaces
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  full: '9999px',
};

/**
 * Shadows
 * Depth levels for elevation (design levels 1–4 + glow)
 */
export const shadows = {
  none: 'none',
  // Level 1 – cards at rest
  sm: '0 1px 3px rgba(0, 0, 0, 0.10)',
  // Level 2 – hover / raised
  md: '0 4px 6px rgba(0, 0, 0, 0.10)',
  // Level 3 – floating (dropdowns, popovers)
  lg: '0 10px 15px rgba(0, 0, 0, 0.10)',
  // Level 4 – modals / overlays
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  // Extra-strong for special elements
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  glow: {
    primary: '0 0 20px rgba(102, 126, 234, 0.30)',
    success: '0 0 20px rgba(16, 185, 129, 0.30)',
    warning: '0 0 20px rgba(245, 158, 11, 0.30)',
    error: '0 0 20px rgba(239, 68, 68, 0.30)',
  },
};

/**
 * Z-Index
 * Layering system
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
};

/**
 * Breakpoints
 * Mobile-first responsive design
 */
export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * Transitions
 * Animation durations and easings
 */
export const transitions = {
  duration: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

/**
 * Sizes
 * Common component sizes
 */
export const sizes = {
  avatar: {
    xs: '24px',
    sm: '32px',
    md: '40px',
    lg: '48px',
    xl: '64px',
    '2xl': '80px',
    '3xl': '96px',
  },
  button: {
    sm: '32px',
    md: '40px',
    lg: '48px',
  },
  input: {
    sm: '32px',
    md: '40px',
    lg: '48px',
  },
};

/**
 * Media Queries
 * Helper functions for responsive design
 */
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  mobile: `@media (max-width: ${breakpoints.md})`,
  tablet: `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  desktop: `@media (min-width: ${breakpoints.lg})`,
};

/**
 * Default Theme Export
 */
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  transitions,
  sizes,
  mediaQueries,
};

export default theme;
