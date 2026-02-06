// ===========================================
// COMMENT COMPOSER COMPONENT
// ===========================================

import { useState } from 'react';
import { Input, Avatar, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { commentApi } from '../../services/api';
import CustomButton from '../common/Button/CustomButton';
import { colors, spacing, typography } from '../../styles/tokens';
import { Comment } from '../../types';

const { TextArea } = Input;

interface CommentComposerProps {
  postId: string;
  parentId?: string;
  placeholder?: string;
  onCommentAdded: (comment: Comment) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export const CommentComposer: React.FC<CommentComposerProps> = ({
  postId,
  parentId,
  placeholder = 'Write a comment...',
  onCommentAdded,
  onCancel,
  autoFocus = false,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      message.warning('Please write something');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await commentApi.createComment(postId, {
        content: content.trim(),
        parentId,
      });

      onCommentAdded(response.data.data);
      setContent('');
      message.success(parentId ? 'Reply posted!' : 'Comment posted!');
      if (onCancel) onCancel();
    } catch (error: any) {
      console.error('Failed to post comment:', error);
      message.error(error.response?.data?.error || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        display: 'flex',
        gap: spacing[3],
        padding: parentId ? spacing[3] : spacing[4],
        background: parentId ? colors.gray[50] : 'white',
        borderRadius: '12px',
        marginBottom: spacing[4],
      }}
    >
      {/* User Avatar */}
      <Avatar
        size={parentId ? 32 : 40}
        src={user?.avatar}
        style={{
          flexShrink: 0,
          background: colors.primary.gradient,
        }}
      >
        {user?.name?.[0]?.toUpperCase()}
      </Avatar>

      {/* Comment Input */}
      <div style={{ flex: 1 }}>
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoSize={{ minRows: parentId ? 2 : 3, maxRows: 6 }}
          style={{
            fontSize: typography.fontSize.base,
            borderRadius: '12px',
            marginBottom: spacing[2],
          }}
          maxLength={1000}
        />

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: typography.fontSize.sm, color: colors.gray[500] }}>
            {content.length}/1000 • Press Ctrl+Enter to submit
          </span>
          <div style={{ display: 'flex', gap: spacing[2] }}>
            {onCancel && (
              <CustomButton variant="ghost" size="small" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </CustomButton>
            )}
            <CustomButton
              variant="primary"
              gradient
              size="small"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!content.trim()}
            >
              {parentId ? 'Reply' : 'Comment'}
            </CustomButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentComposer;
