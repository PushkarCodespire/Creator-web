// ===========================================
// FOLLOW BUTTON COMPONENT
// Instagram-style follow button with state management
// ===========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAddOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { followApi } from '../../services/api';
import CustomButton from '../common/Button/CustomButton';
import { buttonHover, buttonTap } from '../../styles/animations';
import { logger } from '../../utils/logger';
import { colors } from '../../styles/tokens';

export interface FollowButtonProps {
  creatorId: string;
  initialFollowing?: boolean;
  initialFollowerCount?: number;
  size?: 'small' | 'middle' | 'large';
  variant?: 'primary' | 'secondary' | 'ghost';
  showCount?: boolean;
  block?: boolean;
  onFollowChange?: (isFollowing: boolean, newCount: number) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  creatorId,
  initialFollowing = false,
  initialFollowerCount = 0,
  size = 'middle',
  variant = 'primary',
  showCount = false,
  block = false,
  onFollowChange,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Check if user is following this creator on mount
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await followApi.checkFollowing(creatorId);
          setIsFollowing(response.data.data.isFollowing);
        } catch (error) {
          logger.error('Error checking follow status:', error);
        }
      }
    };

    checkFollowStatus();
  }, [creatorId, isAuthenticated, user]);

  const handleFollowClick = async () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      message.info('Please login to follow creators');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    // Prevent double-clicking
    if (isLoading) return;

    // Optimistic update
    const previousFollowing = isFollowing;
    const previousCount = followerCount;
    const newFollowing = !isFollowing;
    const newCount = newFollowing ? followerCount + 1 : followerCount - 1;

    setIsFollowing(newFollowing);
    setFollowerCount(newCount);
    setIsLoading(true);

    try {
      if (newFollowing) {
        await followApi.followCreator(creatorId);
        message.success('Successfully followed!');
      } else {
        await followApi.unfollowCreator(creatorId);
        message.success('Unfollowed');
      }

      // Notify parent component
      if (onFollowChange) {
        onFollowChange(newFollowing, newCount);
      }
    } catch (error: unknown) {
      // Revert optimistic update on error
      setIsFollowing(previousFollowing);
      setFollowerCount(previousCount);

      const err = error as { response?: { data?: { error?: string } } };
      const errorMessage = err.response?.data?.error || 'Failed to update follow status';
      message.error(errorMessage);

      logger.error('Error toggling follow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return '';
    if (isFollowing) {
      return isHovered ? 'Unfollow' : 'Following';
    }
    return 'Follow';
  };

  const getButtonIcon = () => {
    if (isLoading) {
      return <LoadingOutlined spin />;
    }
    if (isFollowing) {
      return isHovered ? null : <CheckOutlined />;
    }
    return <UserAddOutlined />;
  };

  const getButtonVariant = () => {
    if (isFollowing) {
      return isHovered ? 'danger' : 'secondary';
    }
    return variant;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: block ? 'stretch' : 'center', gap: '4px' }}>
      <motion.div
        whileHover={buttonHover}
        whileTap={buttonTap}
        style={{ width: block ? '100%' : 'auto' }}
      >
        <CustomButton
          variant={getButtonVariant()}
          gradient={!isFollowing && variant === 'primary'}
          size={size}
          onClick={handleFollowClick}
          disabled={isLoading}
          icon={getButtonIcon()}
          block={block}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            minWidth: block ? 'auto' : '120px',
            transition: 'all 0.3s ease',
          }}
        >
          {getButtonText()}
        </CustomButton>
      </motion.div>

      {showCount && (
        <AnimatePresence mode="wait">
          <motion.div
            key={followerCount}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            style={{
              fontSize: '12px',
              color: colors.gray[500],
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            {followerCount.toLocaleString()} {followerCount === 1 ? 'follower' : 'followers'}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default FollowButton;
