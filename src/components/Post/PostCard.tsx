import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MessageOutlined,
  ShareAltOutlined,
  MoreOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  EditOutlined,
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons';
import { Dropdown, Modal, message, Avatar, Button, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { postApi, getImageUrl } from '../../services/api';
import { CommentSection } from '../Comment';

const { Text } = Typography;

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
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostDelete,
  onPostUpdate,
  showActions = true,
}) => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);

  const isOwnPost = user?.id === post.creator.id;

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
      console.error('Failed to like/unlike post:', error);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    }
  };

  const handleShareClick = async () => {
    const shareUrl = `${window.location.origin}/posts/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Post by ${post.creator.displayName}`, url: shareUrl });
      } catch (err) { console.error(err); }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      message.success('Link copied to clipboard!');
    }
  };

  const handleDeletePost = () => {
    Modal.confirm({
      title: 'Delete Post',
      content: 'Are you sure you want to delete this post? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setIsDeleting(true);
        try {
          await postApi.deletePost(post.id);
          message.success('Post deleted successfully');
          onPostDelete?.(post.id);
        } catch (error: any) {
          message.error(error.response?.data?.error || 'Failed to delete post');
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const menuItems: MenuProps['items'] = isOwnPost
    ? [
      { key: 'edit', label: 'Edit Post', icon: <EditOutlined />, onClick: () => onPostUpdate?.(post.id) },
      { key: 'delete', label: 'Delete Post', icon: <DeleteOutlined />, danger: true, onClick: handleDeletePost },
    ]
    : [{ key: 'report', label: 'Report Post', onClick: () => message.info('Report feature coming soon') }];

  const formatTimestamp = (timestamp: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const renderMedia = () => {
    if (!post.media?.[0]) return null;
    const media = post.media[0];
    return (
      <div style={{
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        marginTop: '16px',
        marginBottom: '16px',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        background: '#F8FAFC'
      }}>
        {media.type === 'image' ? (
          <img src={media.url} alt="" style={{ width: '100%', maxHeight: '600px', objectFit: 'cover', display: 'block' }} />
        ) : (
          <video src={media.url} controls style={{ width: '100%', maxHeight: '600px', objectFit: 'cover', display: 'block' }} />
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        borderRadius: '24px',
        padding: '24px',
        marginBottom: '24px',
        opacity: isDeleting ? 0.5 : 1,
        position: 'relative',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={handleCreatorClick}>
          <div style={{ position: 'relative' }}>
            <Avatar
              size={50}
              src={post.creator.profileImage ? getImageUrl(post.creator.profileImage) : undefined}
              style={{
                border: '2px solid rgba(99, 102, 241, 0.1)',
                background: !post.creator.profileImage ? '#6366F1' : '#F1F5F9',
                color: '#fff',
                fontWeight: 600
              }}
            >
              {post.creator.displayName?.[0]?.toUpperCase()}
            </Avatar>
            {post.creator.isVerified && (
              <CheckCircleFilled style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                color: '#6366F1',
                fontSize: '14px',
                background: '#fff',
                borderRadius: '50%',
                border: '1px solid #fff'
              }} />
            )}
          </div>
          <div>
            <div style={{ color: '#1E293B', fontWeight: 700, fontSize: '16px', lineHeight: 1.2 }}>{post.creator.displayName}</div>
            <div style={{ color: '#64748B', fontSize: '13px', marginTop: '2px' }}>
              {formatTimestamp(post.createdAt)} {post.creator.category ? `• ${post.creator.category}` : ''}
            </div>
          </div>
        </div>

        {showActions && (
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined style={{ color: '#94A3B8', fontSize: '20px' }} />} />
          </Dropdown>
        )}
      </div>

      <div style={{ color: '#334155', fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
        {post.content}
      </div>

      {renderMedia()}

      {showActions && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          paddingTop: '16px',
          marginTop: '8px',
          borderTop: '1px solid rgba(226, 232, 240, 0.6)'
        }}>
          <motion.div whileTap={{ scale: 0.9 }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={handleLike}>
            {isLiked ? <HeartFilled style={{ color: '#F43F5E', fontSize: '22px' }} /> : <HeartOutlined style={{ color: '#64748B', fontSize: '22px' }} />}
            <Text style={{ color: isLiked ? '#F43F5E' : '#64748B', fontWeight: 700, fontSize: '15px' }}>{likesCount.toLocaleString()}</Text>
          </motion.div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={handleCommentClick}>
            <MessageOutlined style={{ color: '#64748B', fontSize: '22px' }} />
            <Text style={{ color: '#64748B', fontWeight: 700, fontSize: '15px' }}>{commentsCount.toLocaleString()}</Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={handleShareClick}>
            <ShareAltOutlined style={{ color: '#64748B', fontSize: '22px' }} />
          </div>
        </div>
      )}

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '24px 0', marginTop: '16px' }}>
              <CommentSection postId={post.id} initialCommentsCount={commentsCount} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
