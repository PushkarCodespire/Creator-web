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
      borderRadius: '10px',
      fontWeight: 500,
      border: 'none',
      height: props.size === 'large' ? '44px' : props.size === 'small' ? '32px' : '40px',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    let variantStyle: React.CSSProperties = {};

    switch (variant) {
      case 'primary':
        variantStyle = {
          background: colors.primary.solid,
          color: colors.primary.foreground,
          boxShadow: shadows.md,
        };
        break;
      case 'secondary':
        variantStyle = {
          background: colors.surface,
          border: `1px solid ${colors.gray[200]}`,
          color: colors.text.primary,
          boxShadow: shadows.sm,
        };
        break;
      case 'ghost':
        variantStyle = {
          background: 'transparent',
          color: colors.primary.solid,
          padding: 0,
          height: 'auto',
        };
        break;
      case 'danger':
        variantStyle = {
          background: colors.error.solid,
          color: '#ffffff',
          boxShadow: shadows.sm,
        };
        break;
      case 'success':
        variantStyle = {
          background: colors.success.solid,
          color: '#ffffff',
          boxShadow: shadows.sm,
        };
        break;
    }

    return {
      ...defaultStyle,
      ...variantStyle,
      ...style,
    };
  };

  return (
    <motion.div
      whileHover={!disabled && !loading ? { y: -1, boxShadow: shadows.hover } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      style={{ display: 'inline-block', width: props.block ? '100%' : 'auto' }}
    >
      <Button
        {...props}
        disabled={disabled}
        loading={loading}
        style={getButtonStyle()}
        type={variant === 'primary' ? 'primary' : 'default'}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          {children}
        </span>
      </Button>
    </motion.div>
  );
};

export default CustomButton;
