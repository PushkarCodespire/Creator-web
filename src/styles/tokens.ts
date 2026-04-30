// ===========================================
// DESIGN TOKENS - CodeSpire Design System
// ===========================================

export interface ColorScale {
  solid: string;
  light: string;
  dark: string;
  subtle: string;
  start: string;
  end: string;
  [key: string]: string;
}

export const colors: {
  primary: ColorScale & { 50: string; 100: string; 600: string; 700: string; 900: string; gradient: string };
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
  dark: {
    surface: string;
    elevated: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    }
  };
  gray: Record<number | string, string>;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
} = {
  // Primary – CodeSpire Blue
  primary: {
    solid: '#1268ff',
    foreground: '#ffffff',
    background: '#ffffff',
    light: '#40a9ff',
    dark: '#0f52cc',
    subtle: '#e6f0ff',
    50: '#e6f0ff',
    100: '#cce1ff',
    600: '#0f52cc',
    700: '#0b3d99',
    900: '#031763',
    gradient: 'linear-gradient(135deg, #1268ff 0%, #0b3d99 100%)',
    start: '#1268ff',
    end: '#0b3d99',
  },

  // Secondary/Accent
  orange: '#ff6b1a',
  purple: '#5700ff',

  // Success – Green
  success: {
    solid: '#10b981',
    light: '#34d399',
    dark: '#059669',
    subtle: '#ecfdf5',
    start: '#10b981',
    end: '#059669',
  },

  // Warning – Orange
  warning: {
    solid: '#faad14',
    light: '#ffc53d',
    dark: '#d48806',
    subtle: '#fffbe6',
    start: '#faad14',
    end: '#d48806',
  },

  // Error – Red
  error: {
    solid: '#ff4d4f',
    light: '#ff7875',
    dark: '#d9363e',
    subtle: '#fff1f0',
    start: '#ff4d4f',
    end: '#d9363e',
  },

  // Info – Blue
  info: {
    solid: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    subtle: '#eff6ff',
    start: '#3b82f6',
    end: '#2563eb',
  },

  // Dark Mode Tokens
  dark: {
    surface: '#0f172a',
    elevated: '#1e293b',
    border: '#334155',
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      tertiary: '#64748b',
    }
  },

  // Neutrals - CodeSpire Slate Scale
  gray: {
    50: '#f9fafb', // App Background
    100: '#f2f4f7', // Secondary Background
    200: '#e5e7eb', // Borders
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6a7282', // Text Tertiary
    600: '#4a5565', // Text Secondary
    700: '#374151',
    800: '#1f2937',
    900: '#101828', // Text Primary / Dark Base
  },

  // Semantic surfaces
  background: '#f9fafb',
  surface: '#ffffff',
  border: '#e5e7eb',

  text: {
    primary: '#101828',
    secondary: '#4a5565',
    tertiary: '#6a7282',
    disabled: '#9ca3af',
    inverse: '#ffffff',
  },

  // Accent background
  accent: 'rgba(18, 104, 255, 0.08)',
};

export const typography = {
  fontFamily: {
    base: "'Inter', sans-serif",
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '15px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
  } as Record<string, string>,
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  } as Record<string, number>,
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
  } as Record<string, number>,
};

export const spacing: Record<number | string, string> = {
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
};

export const borderRadius = {
  none: '0',
  sm: '8px',
  md: '12px', // Standard Card
  lg: '16px', // Upload areas
  full: '9999px',
};

export const shadows: {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  hover: string;
  glow: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
} = {
  none: 'none',
  sm: '0 1px 0 rgba(3, 23, 99, 0.04)', // Subtle shadow
  md: '0 8px 16px rgba(16, 24, 40, 0.06)', // CodeSpire Shadow
  lg: '0 12px 24px rgba(16, 24, 40, 0.08)', // CodeSpire Large Shadow
  xl: '0 20px 25px -5px rgba(16, 24, 40, 0.1), 0 10px 10px -5px rgba(16, 24, 40, 0.04)',
  hover: '0 12px 24px rgba(16, 24, 40, 0.08)',
  glow: {
    primary: '0 0 20px rgba(18, 104, 255, 0.3)',
    success: '0 0 20px rgba(16, 185, 129, 0.3)',
    warning: '0 0 20px rgba(250, 173, 20, 0.3)',
    error: '0 0 20px rgba(255, 77, 79, 0.3)',
  }
};

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
};

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
};

export default theme;
