// ===========================================
// COMMENT ITEM COMPONENT
// ===========================================

import { useState } from 'react';
import { Avatar, Dropdown, message as antMessage, Modal, Input } from 'antd';
import type { MenuProps } from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { commentApi } from '../../services/api';
import CustomButton from '../common/Button/CustomButton';
import CommentComposer from './CommentComposer';
import { colors, spacing, typography } from '../../styles/tokens';
import { likeAnimation } from '../../styles/animations';
import { Comment } from '../../types';

const { TextArea } = Input;

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onCommentUpdate: (commentId: string, updatedComment: Comment) => void;
  onCommentDelete: (commentId: string) => void;
  onReplyAdded: (reply: Comment) => void;
  depth?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  onCommentUpdate,
  onCommentDelete,
  onReplyAdded,
  depth = 0,
}) => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);

  const isOwner = user?.id === comment.userId;
  const isAdmin = user?.role === 'ADMIN';
  const canModify = isOwner || isAdmin;
  const hasReplies = (comment._count?.replies ?? 0) > 0;
  const maxDepth = 3; // Maximum nesting level

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Handle like/unlike
  const handleLike = async () => {
    const previousLiked = isLiked;
    const previousCount = likesCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      if (isLiked) {
        await commentApi.unlikeComment(comment.id);
      } else {
        await commentApi.likeComment(comment.id);
      }
    } catch (error: any) {
      // Revert on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      antMessage.error(error.response?.data?.error || 'Failed to update like');
    }
  };

  // Load replies
  const loadReplies = async () => {
    if (replies.length > 0) {
      setShowReplies(!showReplies);
      return;
    }

    try {
      setIsLoadingReplies(true);
      const response = await commentApi.getReplies(comment.id);
      setReplies(response.data.data.replies || []);
      setShowReplies(true);
    } catch (error) {
      console.error('Failed to load replies:', error);
      antMessage.error('Failed to load replies');
    } finally {
      setIsLoadingReplies(false);
    }
  };

  // Handle edit
  const handleEdit = async () => {
    if (!editContent.trim()) {
      antMessage.warning('Comment cannot be empty');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await commentApi.updateComment(comment.id, { content: editContent.trim() });
      onCommentUpdate(comment.id, response.data.data);
      setIsEditing(false);
      antMessage.success('Comment updated');
    } catch (error: any) {
      console.error('Failed to update comment:', error);
      antMessage.error(error.response?.data?.error || 'Failed to update comment');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Comment',
      content: 'Are you sure you want to delete this comment? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await commentApi.deleteComment(comment.id);
          onCommentDelete(comment.id);
          antMessage.success('Comment deleted');
        } catch (error: any) {
          console.error('Failed to delete comment:', error);
          antMessage.error(error.response?.data?.error || 'Failed to delete comment');
        }
      },
    });
  };

  // Dropdown menu items
  const menuItems: MenuProps['items'] = canModify
    ? [
        {
          key: 'edit',
          label: 'Edit',
          icon: <EditOutlined />,
          onClick: () => setIsEditing(true),
        },
        {
          key: 'delete',
          label: 'Delete',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: handleDelete,
        },
      ]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        marginBottom: spacing[4],
        paddingLeft: depth > 0 ? spacing[8] : 0,
      }}
    >
      <div style={{ display: 'flex', gap: spacing[3] }}>
        {/* Avatar */}
        <Avatar
          size={depth > 0 ? 32 : 40}
          src={comment.user.avatar}
          style={{
            flexShrink: 0,
            background: colors.primary.gradient,
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/profile/${comment.userId}`)}
        >
          {comment.user.name[0]?.toUpperCase()}
        </Avatar>

        {/* Comment Content */}
        <div style={{ flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[2] }}>
            <div>
              <span
                style={{
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.gray[900],
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/profile/${comment.userId}`)}
              >
                {comment.user.name}
              </span>
              <span style={{ marginLeft: spacing[2], fontSize: typography.fontSize.sm, color: colors.gray[500] }}>
                {formatTimeAgo(comment.createdAt)}
              </span>
              {comment.updatedAt !== comment.createdAt && (
                <span style={{ marginLeft: spacing[2], fontSize: typography.fontSize.xs, color: colors.gray[400] }}>(edited)</span>
              )}
            </div>
            {canModify && menuItems.length > 0 && (
              <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                <motion.div whileHover={{ scale: 1.1 }} style={{ cursor: 'pointer', padding: spacing[1] }}>
                  <MoreOutlined style={{ fontSize: typography.fontSize.lg, color: colors.gray[500] }} />
                </motion.div>
              </Dropdown>
            )}
          </div>

          {/* Content or Edit Mode */}
          {isEditing ? (
            <div style={{ marginBottom: spacing[3] }}>
              <TextArea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoSize={{ minRows: 2, maxRows: 6 }}
                maxLength={1000}
                style={{ marginBottom: spacing[2] }}
              />
              <div style={{ display: 'flex', gap: spacing[2] }}>
                <CustomButton size="small" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                  Cancel
                </CustomButton>
                <CustomButton
                  variant="primary"
                  size="small"
                  onClick={handleEdit}
                  loading={isUpdating}
                  disabled={!editContent.trim() || editContent === comment.content}
                >
                  Save
                </CustomButton>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: typography.fontSize.base, color: colors.gray[700], lineHeight: '1.6', marginBottom: spacing[3] }}>
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div style={{ display: 'flex', gap: spacing[4], alignItems: 'center' }}>
              {/* Like Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                style={{ display: 'flex', alignItems: 'center', gap: spacing[1], cursor: 'pointer' }}
              >
                <motion.div variants={likeAnimation} animate={isLiked ? 'like' : 'unlike'}>
                  {isLiked ? (
                    <HeartFilled style={{ color: colors.error.solid, fontSize: typography.fontSize.base }} />
                  ) : (
                    <HeartOutlined style={{ color: colors.gray[500], fontSize: typography.fontSize.base }} />
                  )}
                </motion.div>
                {likesCount > 0 && (
                  <span style={{ fontSize: typography.fontSize.sm, color: colors.gray[600] }}>{likesCount}</span>
                )}
              </motion.div>

              {/* Reply Button */}
              {depth < maxDepth && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReplyComposer(!showReplyComposer)}
                  style={{ display: 'flex', alignItems: 'center', gap: spacing[1], cursor: 'pointer' }}
                >
                  <MessageOutlined style={{ color: colors.gray[500], fontSize: typography.fontSize.base }} />
                  <span style={{ fontSize: typography.fontSize.sm, color: colors.gray[600] }}>Reply</span>
                </motion.div>
              )}

              {/* View Replies Button */}
              {hasReplies && (
                <CustomButton
                  variant="ghost"
                  size="small"
                  onClick={loadReplies}
                  loading={isLoadingReplies}
                  style={{ fontSize: typography.fontSize.sm, padding: `${spacing[1]} ${spacing[2]}` }}
                >
                  {showReplies ? 'Hide' : 'View'} {comment._count?.replies} {comment._count?.replies === 1 ? 'reply' : 'replies'}
                </CustomButton>
              )}
            </div>
          )}

          {/* Reply Composer */}
          {showReplyComposer && (
            <div style={{ marginTop: spacing[3] }}>
              <CommentComposer
                postId={postId}
                parentId={comment.id}
                placeholder={`Reply to ${comment.user.name}...`}
                onCommentAdded={(reply) => {
                  onReplyAdded(reply);
                  setReplies([...replies, reply]);
                  setShowReplyComposer(false);
                  if (!showReplies) setShowReplies(true);
                }}
                onCancel={() => setShowReplyComposer(false)}
                autoFocus
              />
            </div>
          )}

          {/* Nested Replies */}
          {showReplies && replies.length > 0 && (
            <div style={{ marginTop: spacing[4] }}>
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onCommentUpdate={(id, updated) => {
                    setReplies(replies.map((r) => (r.id === id ? updated : r)));
                  }}
                  onCommentDelete={(id) => {
                    setReplies(replies.filter((r) => r.id !== id));
                  }}
                  onReplyAdded={(newReply) => {
                    setReplies([...replies, newReply]);
                  }}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CommentItem;
