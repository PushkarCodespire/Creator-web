// ===========================================
// POST CARD COMPONENT - Premium Light Theme
// ===========================================

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Share2, MoreVertical, CircleCheck, Trash2, Edit, Heart, ExternalLink, Play, Download } from 'lucide-react';
import { downloadFromUrl } from '../../utils/fileDownloadUtils';
import { Dropdown, Modal, message, Avatar, Button, Typography, Tag } from 'antd';
// eslint-disable-next-line no-duplicate-imports
import type { MenuProps } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { postApi, getImageUrl } from '../../services/api';
import { CommentSection } from '../Comment';
import { colors, shadows } from '../../styles/tokens';
import { logger } from '../../utils/logger';

const { Text, Paragraph } = Typography;

export interface PostData {
  id: string;
  content: string;
  media?: Array<{ type: 'image' | 'video'; url: string }>;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'POLL';
  createdAt: string;
  isLiked: boolean;
  likesCount: number;
  commentsCount?: number;
  sharesCount?: number;
  creator: {
    id: string;
    displayName: string;
    profileImage?: string;
    isVerified: boolean;
    category?: string;
  };
}

export interface PostCardProps {
  post: PostData;
  onPostDelete?: (postId: string) => void;
  onPostUpdate?: (postId: string) => void;
  showActions?: boolean;
  currentCreatorId?: string;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostDelete,
  onPostUpdate,
  showActions = true,
  currentCreatorId,
}) => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean>(post.isLiked);
  const [likesCount, setLikesCount] = useState<number>(post.likesCount);
  const [commentsCount, _setCommentsCount] = useState(post.commentsCount || 0);

  useEffect(() => {
    setIsLiked(post.isLiked);
    setLikesCount(post.likesCount);
  }, [post.isLiked, post.likesCount]);

  const isOwnPost = user?.id === post.creator.id
    || user?.creator?.id === post.creator.id
    || (!!currentCreatorId && currentCreatorId === post.creator.id);

  const handleCreatorClick = () => navigate(`/creator/${post.creator.id}`);
  const handleCommentClick = () => setShowComments(!showComments);

  const handleLike = async () => {
    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

      if (newLikedState) {
        await postApi.likePost(post.id);
      } else {
        await postApi.unlikePost(post.id);
      }
    } catch (error) {
      logger.error('Failed to like/unlike post:', error);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    }
  };

  const handleShareClick = async () => {
    const shareUrl = `${window.location.origin}/posts/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Post by ${post.creator.displayName}`, url: shareUrl });
      } catch (err) { logger.error(err as string); }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      message.success('Nexus link copied to clipboard!');
    }
  };

  const handleDeletePost = () => {
    Modal.confirm({
      title: 'Purge Transmission?',
      content: 'Are you sure you want to disconnect this neural transmission from the matrix?',
      okText: 'Purge',
      okType: 'danger',
      cancelText: 'Cancel',
      okButtonProps: { style: { borderRadius: '10px', fontWeight: 700 } },
      cancelButtonProps: { style: { borderRadius: '10px', fontWeight: 700 } },
      onOk: async () => {
        setIsDeleting(true);
        try {
          await postApi.deletePost(post.id);
          message.success('Transmission purged');
          onPostDelete?.(post.id);
        } catch (error: unknown) {
          const err = error as { response?: { data?: { error?: string } } };
          message.error(err.response?.data?.error || 'Failed to purge');
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const menuItems: MenuProps['items'] = isOwnPost
    ? [
      { key: 'edit', label: 'Modify Matrix', icon: <Edit size={16} />, onClick: () => onPostUpdate?.(post.id) },
      { key: 'delete', label: 'Purge Stream', icon: <Trash2 size={16} />, danger: true, onClick: handleDeletePost },
    ]
    : [{ key: 'report', label: 'Report Disruption', icon: <ExternalLink size={16} />, onClick: () => { message.info('Analytics pending'); } }];

  const formatTimestamp = (timestamp: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return 'NOW';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return new Date(timestamp).toLocaleDateString();
  };

  const renderMedia = () => {
    if (!post.media?.[0]) return null;
    const media = post.media[0];
    return (
      <div style={{
        width: '100%',
        borderRadius: '20px',
        overflow: 'hidden',
        marginTop: '20px',
        marginBottom: '20px',
        border: `1px solid ${colors.gray[100]}`,
        background: colors.gray[50],
        position: 'relative'
      }}>
        {media.type === 'image' ? (
          <>
            <img src={media.url} alt="" style={{ width: '100%', maxHeight: '640px', objectFit: 'cover', display: 'block' }} />
            <motion.div
              whileHover={{ scale: 1.1, background: 'rgba(0,0,0,0.8)' }}
              onClick={(e) => {
                e.stopPropagation();
                downloadFromUrl(media.url, `post-image-${post.id}`);
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                zIndex: 2
              }}
            >
              <Download size={20} />
            </motion.div>
          </>
        ) : (
          <div style={{ position: 'relative' }}>
            <video src={media.url} controls style={{ width: '100%', maxHeight: '640px', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
              <Tag bordered={false} icon={<Play size={12} fill="currentColor" />} style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', fontWeight: 700, backdropFilter: 'blur(10px)', padding: '4px 12px' }}>NEURAL FEED</Tag>
            </div>
            <motion.div
              whileHover={{ scale: 1.1, background: 'rgba(0,0,0,0.8)' }}
              onClick={(e) => {
                e.stopPropagation();
                downloadFromUrl(media.url, `post-video-${post.id}`);
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                zIndex: 2
              }}
            >
              <Download size={20} />
            </motion.div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        padding: '32px',
        opacity: isDeleting ? 0.4 : 1,
        position: 'relative',
        transition: 'all 0.3s ease'
      }}
      className="premium-post-card"
    >
      {/* Post Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={handleCreatorClick}>
          <div style={{ position: 'relative' }}>
            <Avatar
              size={56}
              src={post.creator.profileImage ? getImageUrl(post.creator.profileImage) : undefined}
              style={{
                border: `3px solid ${colors.gray[100]}`,
                background: !post.creator.profileImage ? colors.primary.gradient : '#F8FAFC',
                boxShadow: shadows.sm
              }}
            >
              {post.creator.displayName?.[0]?.toUpperCase()}
            </Avatar>
            {post.creator.isVerified && (
              <div style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                background: '#fff',
                borderRadius: '50%',
                padding: '2px'
              }}>
                <CircleCheck size={18} fill={colors.primary.solid} color="#fff" />
              </div>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text style={{ color: colors.text.primary, fontWeight: 800, fontSize: '17px', letterSpacing: '-0.01em' }}>{post.creator.displayName}</Text>
              {post.creator.category && <Tag bordered={false} style={{ background: colors.gray[50], color: colors.text.tertiary, borderRadius: '6px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{post.creator.category}</Tag>}
            </div>
            <Text style={{ color: colors.text.tertiary, fontSize: '13px', fontWeight: 600 }}>
              Synchronized {formatTimestamp(post.createdAt)} ago
            </Text>
          </div>
        </div>

        {showActions && (
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight" overlayStyle={{ borderRadius: '12px', minWidth: '160px' }}>
            <Button type="text" icon={<MoreVertical size={20} color={colors.text.tertiary} />} style={{ borderRadius: '10px' }} />
          </Dropdown>
        )}
      </div>

      {/* Post Content */}
      <div style={{ padding: '0 4px' }}>
        <Paragraph style={{ color: colors.text.primary, fontSize: '17px', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: '20px', fontWeight: 500 }}>
          {post.content}
        </Paragraph>

        {renderMedia()}
      </div>

      {/* Post Actions */}
      {showActions && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          paddingTop: '24px',
          marginTop: '8px',
          borderTop: `1px solid ${colors.gray[50]}`
        }}>
          <motion.div whileTap={{ scale: 0.9 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={handleLike}>
            <div style={{
              padding: '10px',
              borderRadius: '12px',
              background: isLiked ? '#fff1f2' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}>
              <Heart size={22} fill={isLiked ? '#e11d48' : 'none'} color={isLiked ? '#e11d48' : colors.text.tertiary} />
            </div>
            <Text style={{ color: isLiked ? '#e11d48' : colors.text.tertiary, fontWeight: 800, fontSize: '15px' }}>{likesCount.toLocaleString()}</Text>
          </motion.div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={handleCommentClick}>
            <div style={{
              padding: '10px',
              borderRadius: '12px',
              background: showComments ? colors.primary.subtle : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}>
              <MessageSquare size={22} fill={showComments ? colors.primary.solid : 'none'} color={showComments ? colors.primary.solid : colors.text.tertiary} />
            </div>
            <Text style={{ color: showComments ? colors.primary.solid : colors.text.tertiary, fontWeight: 800, fontSize: '15px' }}>{commentsCount.toLocaleString()}</Text>
          </div>

          <motion.div whileTap={{ scale: 0.9 }} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={handleShareClick}>
            <div style={{
              padding: '10px',
              borderRadius: '12px',
              background: colors.gray[50],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Share2 size={20} color={colors.text.tertiary} />
            </div>
          </motion.div>
        </div>
      )}

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: '32px', marginTop: '24px', borderTop: `2px dashed ${colors.gray[50]}` }}>
              <CommentSection postId={post.id} initialCommentsCount={commentsCount} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .premium-post-card:hover {
            background: ${colors.gray[50]}11;
        }
      `}</style>
    </div>
  );
};

export default PostCard;
