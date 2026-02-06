// ===========================================
// CUSTOM CARD COMPONENT
// Enhanced card with hover effects and depth
// ===========================================

import React from 'react';
import { Card, CardProps } from 'antd';
import { motion } from 'framer-motion';
import { cardHover } from '../../../styles/animations';
import { colors, shadows, borderRadius } from '../../../styles/tokens';

export interface CustomCardProps extends CardProps {
  depth?: 1 | 2 | 3;
  gradient?: boolean;
  gradientBorder?: boolean;
  hoverable?: boolean;
  children: React.ReactNode;
}

const CustomCard: React.FC<CustomCardProps> = ({
  depth = 1,
  gradient = false,
  gradientBorder = false,
  hoverable = false,
  children,
  style,
  ...props
}) => {
  // Get shadow based on depth
  const getShadow = () => {
    switch (depth) {
      case 1:
        return shadows.md;
      case 2:
        return shadows.lg;
      case 3:
        return shadows.xl;
      default:
        return shadows.md;
    }
  };

  // Base card styles
  const cardStyle: React.CSSProperties = {
    borderRadius: borderRadius.lg,
    boxShadow: getShadow(),
    border: 'none',
    overflow: 'hidden',
    ...style,
  };

  // Gradient background
  if (gradient) {
    cardStyle.background = colors.primary.gradient;
    cardStyle.color = '#ffffff';
  }

  // Gradient border effect
  if (gradientBorder) {
    cardStyle.background = '#ffffff';
    cardStyle.position = 'relative';
    cardStyle.padding = '2px';
  }

  // Wrap card in motion.div to avoid deprecation warning
  const cardContent = (
    <Card
      {...props}
      style={gradientBorder ? {
        ...cardStyle,
        background: colors.primary.gradient,
      } : cardStyle}
      bordered={false}
    >
      {gradientBorder ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: borderRadius.md,
            padding: '20px',
          }}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </Card>
  );

  if (hoverable) {
    return (
      <motion.div
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        style={{ width: '100%' }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};

export default CustomCard;
