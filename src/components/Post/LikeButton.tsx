// ===========================================
// LIKE BUTTON COMPONENT
// Instagram-style like button with heart animation
// ===========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartOutlined, HeartFilled, LoadingOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { postApi } from '../../services/api';
import { likeAnimation } from '../../styles/animations';
import { colors } from '../../styles/tokens';

export interface LikeButtonProps {
  postId: string;
  initialLiked?: boolean;
  initialLikeCount?: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  onLikeChange?: (isLiked: boolean, newCount: number) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  postId,
  initialLiked = false,
  initialLikeCount = 0,
  size = 'medium',
  showCount = true,
  onLikeChange,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  // Update state when props change
  useEffect(() => {
    setIsLiked(initialLiked);
    setLikeCount(initialLikeCount);
  }, [initialLiked, initialLikeCount]);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click if inside a clickable card

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      message.info('Please login to like posts');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    // Prevent double-clicking
    if (isLoading) return;

    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likeCount;
    const newLiked = !isLiked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;

    setIsLiked(newLiked);
    setLikeCount(newCount);
    setIsLoading(true);

    try {
      if (newLiked) {
        await postApi.likePost(postId);
      } else {
        await postApi.unlikePost(postId);
      }

      // Notify parent component
      if (onLikeChange) {
        onLikeChange(newLiked, newCount);
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setIsLiked(previousLiked);
      setLikeCount(previousCount);

      const errorMessage = error.response?.data?.error || 'Failed to update like';
      message.error(errorMessage);

      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { fontSize: '16px', gap: '4px' };
      case 'large':
        return { fontSize: '28px', gap: '8px' };
      default:
        return { fontSize: '22px', gap: '6px' };
    }
  };

  const sizeStyle = getSizeStyle();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: sizeStyle.gap,
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={handleLikeClick}
    >
      <motion.div
        variants={likeAnimation}
        animate={isLiked ? 'like' : 'unlike'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: sizeStyle.fontSize,
        }}
      >
        {isLoading ? (
          <LoadingOutlined spin style={{ color: colors.gray[400] }} />
        ) : isLiked ? (
          <HeartFilled
            style={{
              color: colors.error.solid,
              filter: 'drop-shadow(0 2px 4px rgba(244, 63, 94, 0.3))',
            }}
          />
        ) : (
          <HeartOutlined
            style={{
              color: colors.gray[600],
              transition: 'color 0.2s ease',
            }}
          />
        )}
      </motion.div>

      {showCount && (
        <AnimatePresence mode="wait">
          <motion.span
            key={likeCount}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{
              fontSize: size === 'small' ? '12px' : size === 'large' ? '18px' : '14px',
              fontWeight: 600,
              color: isLiked ? colors.error.solid : colors.gray[700],
            }}
          >
            {likeCount > 0 ? likeCount.toLocaleString() : ''}
          </motion.span>
        </AnimatePresence>
      )}
    </div>
  );
};

export default LikeButton;
