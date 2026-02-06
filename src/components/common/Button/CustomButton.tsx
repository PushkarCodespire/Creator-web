// ===========================================
// CUSTOM BUTTON COMPONENT
// Enhanced button with animations and gradients
// ===========================================

import React from 'react';
import { Button, ButtonProps } from 'antd';
import { motion } from 'framer-motion';
import { buttonTap, buttonHover } from '../../../styles/animations';
import { colors, shadows } from '../../../styles/tokens';

export interface CustomButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  gradient?: boolean;
  glow?: boolean;
  children?: React.ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  variant = 'primary',
  gradient = false,
  glow = false,
  children,
  style,
  disabled,
  loading,
  ...props
}) => {
  // Get button styles based on variant
  const getButtonStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      borderRadius: '12px',
      fontWeight: 600,
      border: 'none',
      transition: 'all 0.3s ease',
      ...style,
    };

    if (gradient) {
      switch (variant) {
        case 'primary':
          return {
            ...baseStyle,
            background: colors.primary.gradient,
            color: '#ffffff',
            boxShadow: glow ? shadows.glow.primary : shadows.md,
          };
        case 'success':
          return {
            ...baseStyle,
            background: colors.success.gradient,
            color: '#ffffff',
            boxShadow: glow ? shadows.glow.success : shadows.md,
          };
        case 'danger':
          return {
            ...baseStyle,
            background: colors.error.gradient,
            color: '#ffffff',
            boxShadow: glow ? shadows.glow.error : shadows.md,
          };
        default:
          return baseStyle;
      }
    }

    // Non-gradient styles
    switch (variant) {
      case 'secondary':
        return {
          ...baseStyle,
          background: colors.gray[100],
          color: colors.text.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          background: 'transparent',
          border: `1px solid ${colors.gray[300]}`,
          color: colors.text.primary,
        };
      case 'danger':
        return {
          ...baseStyle,
          background: colors.error.solid,
          color: '#ffffff',
        };
      case 'success':
        return {
          ...baseStyle,
          background: colors.success.solid,
          color: '#ffffff',
        };
      default:
        return baseStyle;
    }
  };

  // Wrap button in motion.div to avoid deprecation warning
  return (
    <motion.div
      whileHover={!disabled && !loading ? buttonHover : undefined}
      whileTap={!disabled && !loading ? buttonTap : undefined}
      style={{ display: 'inline-block' }}
    >
      <Button
        {...props}
        disabled={disabled}
        loading={loading}
        style={getButtonStyle()}
        type={variant === 'primary' && !gradient ? 'primary' : 'default'}
      >
        {children}
      </Button>
    </motion.div>
  );
};

export default CustomButton;
