// ===========================================
// EMPTY STATE COMPONENT
// Beautiful illustrations for empty states
// ===========================================

import React from 'react';
import { Button, Typography } from 'antd';
import { colors, spacing } from '../../../styles/tokens';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../../styles/animations';

const { Title, Text } = Typography;

export interface EmptyStateProps {
  type?: 'no-data' | 'no-results' | 'error' | 'no-posts' | 'no-chats' | 'no-notifications';
  title?: string;
  description?: string;
  action?: {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  // Flat props support
  actionText?: string;
  onAction?: () => void;
  illustration?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-data',
  title,
  description,
  action: actionProp,
  actionText,
  onAction,
  illustration,
}) => {
  // Normalize action
  const action = actionProp || (actionText && onAction ? { text: actionText, onClick: onAction } : undefined);
  // Default illustrations based on type
  const getIllustration = () => {
    if (illustration) return illustration;

    switch (type) {
      case 'no-data':
        return (
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" fill={colors.gray[100]} />
            <path
              d="M70 90 L90 110 L130 70"
              stroke={colors.primary.solid}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="100" cy="100" r="60" stroke={colors.gray[300]} strokeWidth="2" fill="none" />
          </svg>
        );

      case 'no-results':
        return (
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <circle cx="80" cy="80" r="50" stroke={colors.gray[300]} strokeWidth="8" fill="none" />
            <line
              x1="120"
              y1="120"
              x2="170"
              y2="170"
              stroke={colors.gray[300]}
              strokeWidth="8"
              strokeLinecap="round"
            />
            <circle cx="80" cy="80" r="30" fill={colors.gray[100]} />
          </svg>
        );

      case 'error':
        return (
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" fill="#fee" />
            <circle cx="100" cy="100" r="60" fill={colors.error.solid} opacity="0.2" />
            <text
              x="100"
              y="120"
              textAnchor="middle"
              fill={colors.error.solid}
              fontSize="80"
              fontWeight="bold"
            >
              !
            </text>
          </svg>
        );

      case 'no-posts':
        return (
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <rect x="40" y="60" width="120" height="100" rx="12" fill={colors.gray[100]} />
            <rect x="60" y="80" width="80" height="8" rx="4" fill={colors.gray[300]} />
            <rect x="60" y="100" width="60" height="8" rx="4" fill={colors.gray[300]} />
            <rect x="60" y="120" width="70" height="8" rx="4" fill={colors.gray[300]} />
            <circle cx="100" cy="30" r="20" fill={colors.primary.solid} opacity="0.2" />
            <path
              d="M95 30 L100 35 L105 25"
              stroke={colors.primary.solid}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        );

      case 'no-chats':
        return (
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <path
              d="M50 80 L50 140 L80 140 L100 160 L100 140 L150 140 L150 80 Z"
              fill={colors.gray[100]}
              stroke={colors.gray[300]}
              strokeWidth="2"
            />
            <circle cx="80" cy="110" r="4" fill={colors.gray[400]} />
            <circle cx="100" cy="110" r="4" fill={colors.gray[400]} />
            <circle cx="120" cy="110" r="4" fill={colors.gray[400]} />
          </svg>
        );

      case 'no-notifications':
        return (
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <path
              d="M100 60 C85 60 75 70 75 85 L75 110 L65 130 L135 130 L125 110 L125 85 C125 70 115 60 100 60 Z"
              fill={colors.gray[100]}
              stroke={colors.gray[300]}
              strokeWidth="2"
            />
            <path d="M90 135 Q100 145 110 135" stroke={colors.gray[300]} strokeWidth="2" fill="none" />
            <line
              x1="100"
              y1="50"
              x2="100"
              y2="60"
              stroke={colors.gray[300]}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );

      default:
        return null;
    }
  };

  // Default titles and descriptions
  const getDefaultTitle = () => {
    if (title) return title;
    switch (type) {
      case 'no-data':
        return 'No Data Found';
      case 'no-results':
        return 'No Results Found';
      case 'error':
        return 'Something Went Wrong';
      case 'no-posts':
        return 'No Posts Yet';
      case 'no-chats':
        return 'No Conversations';
      case 'no-notifications':
        return 'No Notifications';
      default:
        return 'Nothing to Show';
    }
  };

  const getDefaultDescription = () => {
    if (description) return description;
    switch (type) {
      case 'no-data':
        return 'There is no data to display at the moment.';
      case 'no-results':
        return 'Try adjusting your search or filters.';
      case 'error':
        return 'We encountered an error. Please try again.';
      case 'no-posts':
        return 'Start creating your first post to engage with your audience.';
      case 'no-chats':
        return 'Start chatting with creators to see conversations here.';
      case 'no-notifications':
        return 'We\'ll notify you when something new happens.';
      default:
        return '';
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${spacing[12]} ${spacing[6]}`,
        textAlign: 'center',
      }}
    >
      {/* Illustration */}
      <div style={{ marginBottom: spacing[6] }}>{getIllustration()}</div>

      {/* Title */}
      <Title level={3} style={{ marginBottom: spacing[2], color: colors.text.primary }}>
        {getDefaultTitle()}
      </Title>

      {/* Description */}
      <Text style={{ color: colors.text.secondary, marginBottom: spacing[6], maxWidth: '400px' }}>
        {getDefaultDescription()}
      </Text>

      {/* Action Button */}
      {action && (
        <Button
          type="primary"
          size="large"
          icon={action.icon}
          onClick={action.onClick}
          style={{
            borderRadius: '12px',
            fontWeight: 600,
          }}
        >
          {action.text}
        </Button>
      )}
    </motion.div>
  );
};

export { EmptyState };
export default EmptyState;
