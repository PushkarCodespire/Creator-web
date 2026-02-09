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
    const defaultStyle: React.CSSProperties = {
      borderRadius: '12px',
      fontWeight: 600,
      border: 'none',
      transition: 'all 0.3s ease',
    };

    let variantStyle: React.CSSProperties = {};

    if (gradient) {
      switch (variant) {
        case 'primary':
          variantStyle = {
            background: colors.primary.gradient,
            color: '#ffffff',
            boxShadow: glow ? shadows.glow.primary : shadows.md,
          };
          break;
        case 'success':
          variantStyle = {
            background: colors.success.gradient,
            color: '#ffffff',
            boxShadow: glow ? shadows.glow.success : shadows.md,
          };
          break;
        case 'danger':
          variantStyle = {
            background: colors.error.gradient,
            color: '#ffffff',
            boxShadow: glow ? shadows.glow.error : shadows.md,
          };
          break;
      }
    } else {
      // Non-gradient styles
      switch (variant) {
        case 'secondary':
          variantStyle = {
            background: colors.gray[100],
            color: colors.text.primary,
          };
          break;
        case 'ghost':
          variantStyle = {
            background: 'transparent',
            border: `1px solid ${colors.gray[300]}`,
            color: colors.text.primary,
          };
          break;
        case 'danger':
          variantStyle = {
            background: colors.error.solid,
            color: '#ffffff',
          };
          break;
        case 'success':
          variantStyle = {
            background: colors.success.solid,
            color: '#ffffff',
          };
          break;
      }
    }

    return {
      ...defaultStyle,
      ...variantStyle,
      ...style, // Props style should always override component defaults
    };
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
