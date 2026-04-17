// ===========================================
// CUSTOM CARD COMPONENT
// Enhanced card with hover effects and depth
// ===========================================

import React from 'react';
import { Card, CardProps } from 'antd';
import { motion } from 'framer-motion';
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  gradient = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        return shadows.hover;
      default:
        return shadows.md;
    }
  };

  // Base card styles
  const cardStyle: React.CSSProperties = {
    borderRadius: borderRadius.md, // CodeSpire Card 12px
    boxShadow: getShadow(),
    border: `1px solid ${colors.gray[200]}`,
    overflow: 'hidden',
    background: colors.surface,
    ...style,
  };

  // Wrap card in motion.div to avoid deprecation warning
  const cardContent = (
    <Card
      {...props}
      style={cardStyle}
      bordered={false}
      styles={{
        header: {
          borderBottom: `1px solid ${colors.gray[100]}`,
          padding: '16px 24px',
          fontWeight: 600,
        },
        body: {
          padding: '24px',
          ...props.styles?.body,
        }
      }}
    >
      {children}
    </Card>
  );

  if (hoverable) {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: shadows.hover }}
        transition={{ duration: 0.2 }}
        style={{ width: '100%' }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};

export default CustomCard;
