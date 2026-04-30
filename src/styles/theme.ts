// ===========================================
// ANT DESIGN THEME OVERRIDE
// Custom theme configuration for Ant Design components
// ===========================================

import { ThemeConfig } from 'antd';
import { colors, typography, shadows } from './tokens';

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
    colorBgLayout: colors.background,

    // Text
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    colorTextDisabled: colors.text.disabled,

    // Border
    colorBorder: colors.gray[200],
    colorBorderSecondary: colors.gray[100],

    // Typography
    fontFamily: typography.fontFamily.base,
    fontSize: 15, // CodeSpire base
    fontSizeHeading1: 36,
    fontSizeHeading2: 28,
    fontSizeHeading3: 20,
    fontSizeHeading4: 18,
    fontSizeHeading5: 15,
    lineHeight: typography.lineHeight.normal,

    // Border Radius
    borderRadius: 8,
    borderRadiusLG: 12, // CodeSpire card radius
    borderRadiusSM: 8,
    borderRadiusXS: 4,

    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,

    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,

    // Shadows
    boxShadow: shadows.md,
    boxShadowSecondary: shadows.sm,

    // Control Heights
    controlHeight: 40,
    controlHeightLG: 44, // CodeSpire primary button height
    controlHeightSM: 32,
  },

  components: {
    /**
     * Button Component
     */
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 44,
      fontWeight: 500,
      primaryShadow: shadows.md,
    },

    /**
     * Card Component
     */
    Card: {
      borderRadiusLG: 12,
      boxShadowTertiary: shadows.md,
      paddingLG: 24,
    },

    /**
     * Input Component
     */
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },

    /**
     * Modal Component
     */
    Modal: {
      borderRadiusLG: 12,
      paddingLG: 24,
      boxShadow: shadows.lg,
    },

    /**
     * Table Component
     */
    Table: {
      borderRadius: 12,
      headerBg: colors.gray[100],
    },
  },

  // CSS Variables
  cssVar: true,
};

/**
 * Dark Theme Configuration (Simplified for CodeSpire)
 */
export const darkTheme: ThemeConfig = {
  ...antdTheme,
  token: {
    ...antdTheme.token,
    colorBgContainer: colors.gray[900],
    colorBgElevated: '#1a202c',
    colorBgLayout: colors.gray[900],
    colorText: '#ffffff',
    colorTextSecondary: colors.gray[400],
    colorTextDisabled: colors.gray[600],
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
    background-color: ${colors.background};
    color: ${colors.text.primary};
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
    background: ${colors.gray[300]};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${colors.gray[400]};
  }

  /* Selection */
  ::selection {
    background-color: ${colors.primary.subtle};
    color: ${colors.primary.solid};
  }

  /* Focus Visible (Accessibility) */
  *:focus-visible {
    outline: 2px solid ${colors.primary.solid};
    outline-offset: 2px;
  }

  /* Transitions */
  a, button {
    transition: all 0.2s ease-in-out;
  }

  /* Card and Depth Classes */
  .codespire-card {
    background: ${colors.surface};
    border: 1px solid ${colors.gray[200]};
    border-radius: 12px;
    box-shadow: ${shadows.md};
    padding: 24px;
  }

  .codespire-button-primary {
    background: ${colors.primary.solid};
    color: ${colors.primary.foreground};
    height: 44px;
    font-weight: 500;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 20px;
    cursor: pointer;
    border: none;
  }

  /* Typography Utilities */
  .title-main {
    font-size: 36px;
    font-weight: 700;
    color: ${colors.text.primary};
    letter-spacing: -0.02em;
  }

  .subtitle-main {
    font-size: 18px;
    font-weight: 600;
    color: ${colors.text.primary};
  }

  .body-text {
    font-size: 15px;
    color: ${colors.text.secondary};
  }

  .label-caps {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${colors.text.tertiary};
  }
`;

export default antdTheme;
