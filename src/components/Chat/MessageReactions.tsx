// ===========================================
// MESSAGE REACTIONS COMPONENT
// ===========================================

import { useState } from 'react';
import { Popover, Tooltip, message as antMessage } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { reactionApi } from '../../services/api';
import { MessageReaction } from '../../types';
import { colors, spacing, typography } from '../../styles/tokens';
import { logger } from '../../utils/logger';

interface MessageReactionsProps {
  messageId: string;
  reactions?: { [emoji: string]: MessageReaction[] };
  onReactionChange?: (reactions: { [emoji: string]: MessageReaction[] }) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions = {},
  onReactionChange,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [_loading, setLoading] = useState(false);

  const handleReactionClick = async (emoji: string) => {
    if (!user) {
      antMessage.info('Please login to react to messages');
      return;
    }

    try {
      setLoading(true);
      const userReacted = reactions[emoji]?.some((r) => r.userId === user.id);

      if (userReacted) {
        // Remove reaction
        await reactionApi.removeReaction(messageId, emoji);

        const newReactions = { ...reactions };
        newReactions[emoji] = newReactions[emoji].filter((r) => r.userId !== user.id);
        if (newReactions[emoji].length === 0) {
          delete newReactions[emoji];
        }

        if (onReactionChange) onReactionChange(newReactions);
        antMessage.success('Reaction removed');
      } else {
        // Add reaction
        const response = await reactionApi.addReaction(messageId, emoji);
        const newReaction = response.data.data;

        const newReactions = { ...reactions };
        if (!newReactions[emoji]) {
          newReactions[emoji] = [];
        }
        newReactions[emoji].push(newReaction);

        if (onReactionChange) onReactionChange(newReactions);
        antMessage.success('Reaction added');
      }

      setPickerOpen(false);
    } catch (error: unknown) {
      logger.error('Failed to update reaction:', error);
      const err = error as { response?: { data?: { error?: string } } };
      antMessage.error(err.response?.data?.error || 'Failed to update reaction');
    } finally {
      setLoading(false);
    }
  };

  const reactionEntries = Object.entries(reactions);
  const _hasReactions = reactionEntries.length > 0;

  const pickerContent = (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: spacing[2],
        padding: spacing[2],
      }}
    >
      {QUICK_REACTIONS.map((emoji) => {
        const userReacted = reactions[emoji]?.some((r) => r.userId === user?.id);
        return (
          <motion.div
            key={emoji}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleReactionClick(emoji)}
            style={{
              fontSize: '24px',
              cursor: 'pointer',
              padding: spacing[2],
              borderRadius: '8px',
              textAlign: 'center',
              background: userReacted ? colors.primary.light : 'transparent',
              border: userReacted ? `2px solid ${colors.primary.solid}` : 'none',
            }}
          >
            {emoji}
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1], flexWrap: 'wrap', marginTop: spacing[2] }}>
      {/* Existing Reactions */}
      <AnimatePresence>
        {reactionEntries.map(([emoji, reactionList]) => {
          const count = reactionList.length;
          const userReacted = reactionList.some((r) => r.userId === user?.id);
          const names = reactionList.map((r) => r.user.name).join(', ');

          return (
            <Tooltip key={emoji} title={names}>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReactionClick(emoji)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[1],
                  padding: `${spacing[1]} ${spacing[2]}`,
                  borderRadius: '16px',
                  background: userReacted ? colors.primary.light : colors.gray[100],
                  border: userReacted ? `2px solid ${colors.primary.solid}` : `1px solid ${colors.gray[200]}`,
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm,
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '16px' }}>{emoji}</span>
                {count > 1 && (
                  <span
                    style={{
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.semibold,
                      color: userReacted ? colors.primary.solid : colors.gray[700],
                    }}
                  >
                    {count}
                  </span>
                )}
              </motion.div>
            </Tooltip>
          );
        })}
      </AnimatePresence>

      {/* Add Reaction Button */}
      <Popover
        content={pickerContent}
        trigger="click"
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        placement="top"
      >
        <Tooltip title="Add reaction">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: colors.gray[100],
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.primary.light;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.gray[100];
            }}
          >
            <SmileOutlined style={{ fontSize: '14px', color: colors.gray[600] }} />
          </motion.div>
        </Tooltip>
      </Popover>
    </div>
  );
};

export default MessageReactions;
