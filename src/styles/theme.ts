// ===========================================
// ANT DESIGN THEME OVERRIDE
// Custom theme configuration for Ant Design components
// ===========================================

import { ThemeConfig } from 'antd';
import { colors, typography, borderRadius, shadows, spacing, transitions } from './tokens';

/**
 * Ant Design Theme Configuration
 * Overrides default Ant Design theme with our design tokens
 */
export const antdTheme: ThemeConfig = {
  token: {
    // Colors
    colorPrimary: colors.primary.solid,
    colorSuccess: colors.success.solid,
    colorWarning: colors.warning.solid,
    colorError: colors.error.solid,
    colorInfo: colors.primary.solid,

    // Background
    colorBgContainer: colors.background,
    colorBgElevated: colors.surface,
    colorBgLayout: colors.gray[50],

    // Text
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    colorTextDisabled: colors.text.disabled,

    // Border
    colorBorder: colors.gray[300],
    colorBorderSecondary: colors.gray[200],

    // Typography
    fontFamily: typography.fontFamily.base,
    fontSize: 16,
    fontSizeHeading1: 48,
    fontSizeHeading2: 36,
    fontSizeHeading3: 30,
    fontSizeHeading4: 24,
    fontSizeHeading5: 20,
    lineHeight: typography.lineHeight.normal,

    // Border Radius
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    borderRadiusXS: 4,

    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,

    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,

    // Shadows
    boxShadow: shadows.md,
    boxShadowSecondary: shadows.sm,

    // Control Heights
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,

    // Transitions
    motionDurationFast: '0.15s',
    motionDurationMid: '0.3s',
    motionDurationSlow: '0.5s',

    // Z-Index
    zIndexBase: 0,
    zIndexPopupBase: 1000,

    // Link
    colorLink: colors.primary.solid,
    colorLinkHover: colors.primary.light,
    colorLinkActive: colors.primary.dark,
  },

  components: {
    /**
     * Button Component
     */
    Button: {
      borderRadius: 12,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      fontWeight: typography.fontWeight.semibold,
      primaryShadow: shadows.md,
    },

    /**
     * Card Component
     */
    Card: {
      borderRadiusLG: 16,
      boxShadowTertiary: shadows.lg,
      paddingLG: 24,
    },

    /**
     * Input Component
     */
    Input: {
      borderRadius: 12,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      paddingBlock: 8,
      paddingInline: 12,
    },

    /**
     * Select Component
     */
    Select: {
      borderRadius: 12,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },

    /**
     * Modal Component
     */
    Modal: {
      borderRadiusLG: 16,
      paddingLG: 24,
      boxShadow: shadows['2xl'],
    },

    /**
     * Notification Component
     */
    Notification: {
      borderRadiusLG: 12,
      boxShadow: shadows.xl,
    },

    /**
     * Message Component
     */
    Message: {
      borderRadiusLG: 12,
      boxShadow: shadows.lg,
    },

    /**
     * Dropdown Component
     */
    Dropdown: {
      borderRadiusLG: 12,
      boxShadowSecondary: shadows.lg,
      paddingBlock: 8,
    },

    /**
     * Menu Component
     */
    Menu: {
      borderRadius: 8,
      itemBorderRadius: 8,
      itemPaddingInline: 16,
    },

    /**
     * Tabs Component
     */
    Tabs: {
      borderRadius: 8,
      cardPadding: '16px 24px',
    },

    /**
     * Tag Component
     */
    Tag: {
      borderRadiusSM: 8,
    },

    /**
     * Avatar Component
     */
    Avatar: {
      borderRadius: 9999,
    },

    /**
     * Badge Component
     */
    Badge: {
      dotSize: 8,
    },

    /**
     * Tooltip Component
     */
    Tooltip: {
      borderRadius: 8,
      boxShadowSecondary: shadows.md,
    },

    /**
     * Table Component
     */
    Table: {
      borderRadius: 12,
      headerBg: colors.gray[50],
    },

    /**
     * Pagination Component
     */
    Pagination: {
      borderRadius: 8,
      itemActiveBg: colors.primary.solid,
    },

    /**
     * Switch Component
     */
    Switch: {
      handleSize: 18,
      innerMinMargin: 6,
    },

    /**
     * Slider Component
     */
    Slider: {
      handleSize: 14,
      handleSizeHover: 16,
      railSize: 6,
      handleLineWidth: 2,
    },

    /**
     * Progress Component
     */
    Progress: {
      circleTextFontSize: '1em',
      lineBorderRadius: 100,
    },

    /**
     * Upload Component
     */
    Upload: {
      borderRadiusLG: 12,
    },

    /**
     * Form Component
     */
    Form: {
      itemMarginBottom: 24,
      verticalLabelPadding: '0 0 8px',
    },
  },

  // CSS Variables
  cssVar: true,
};

/**
 * Dark Theme Configuration
 */
export const darkTheme: ThemeConfig = {
  ...antdTheme,
  token: {
    ...antdTheme.token,
    colorBgContainer: colors.dark.background,
    colorBgElevated: colors.dark.surface,
    colorBgLayout: colors.dark.background,
    colorText: colors.dark.text.primary,
    colorTextSecondary: colors.dark.text.secondary,
    colorTextDisabled: colors.dark.text.disabled,
    colorBorder: colors.gray[700],
    colorBorderSecondary: colors.gray[800],
  },
};

/**
 * Global Styles
 * Additional CSS to inject
 */
export const globalStyles = `
  /* Import Inter Font */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  /* Reset and Base Styles */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: ${typography.fontFamily.base};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${colors.gray[100]};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${colors.gray[400]};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${colors.gray[500]};
  }

  /* Selection */
  ::selection {
    background-color: ${colors.primary.light};
    color: white;
  }

  /* Focus Visible (Accessibility) */
  *:focus-visible {
    outline: 2px solid ${colors.primary.solid};
    outline-offset: 2px;
  }

  /* Remove default focus outline for mouse users */
  *:focus:not(:focus-visible) {
    outline: none;
  }

  /* Transitions */
  a, button {
    transition: all ${transitions.duration.base} ${transitions.timing.easeInOut};
  }

  /* Loading Dots Animation */
  @keyframes loading-dots {
    0%, 20% { opacity: 0.2; }
    50% { opacity: 1; }
    80%, 100% { opacity: 0.2; }
  }

  .loading-dots span {
    animation: loading-dots 1.4s infinite;
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: currentColor;
    margin: 0 2px;
  }

  .loading-dots span:nth-child(1) {
    animation-delay: 0s;
  }

  .loading-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .loading-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }

  /* Shimmer Animation for Skeletons */
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  .shimmer {
    background: linear-gradient(
      90deg,
      ${colors.gray[200]} 0%,
      ${colors.gray[100]} 50%,
      ${colors.gray[200]} 100%
    );
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
  }

  /* Gradient Text */
  .gradient-text {
    background: ${colors.primary.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Utility Classes */
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }

  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .gap-1 { gap: ${spacing[1]}; }
  .gap-2 { gap: ${spacing[2]}; }
  .gap-4 { gap: ${spacing[4]}; }

  .cursor-pointer { cursor: pointer; }
  .cursor-not-allowed { cursor: not-allowed; }

  /* Responsive Utilities */
  @media (max-width: 768px) {
    .hide-mobile { display: none !important; }
  }

  @media (min-width: 769px) {
    .hide-desktop { display: none !important; }
  }
`;

export default antdTheme;
