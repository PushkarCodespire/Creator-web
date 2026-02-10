
import React, { useEffect, useState } from 'react';
import { Card, Avatar, Button, Typography, Image, Space, Divider, Dropdown, Menu, message } from 'antd';
import {
    HeartOutlined,
    HeartFilled,
    MessageOutlined,
    ShareAltOutlined,
    MoreOutlined,
    DeleteOutlined,
    EditOutlined,
    GlobalOutlined,
    LockOutlined,
    UserOutlined
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { postApi, getImageUrl } from '../../services/api';
import CommentSection from './CommentSection';

const { Text, Paragraph } = Typography;

interface Post {
    id: string;
    content: string;
    media?: any[];
    type: string; // 'TEXT', 'IMAGE', 'VIDEO'
    createdAt: string;
    updatedAt: string;
    likesCount: number;
    commentsCount: number;
    isLiked?: boolean;
    isPublished: boolean;
    creator: {
        id: string;
        displayName: string;
        profileImage?: string;
        isVerified?: boolean;
        userId?: string;
    };
}

interface PostCardProps {
    post: Post;
    currentUserId?: string; // To check ownership
    onDelete?: (postId: string) => void;
    onUpdate?: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onDelete, onUpdate }) => {
    const [isLiked, setIsLiked] = useState<boolean>(!!post.isLiked);
    const [likesCount, setLikesCount] = useState<number>(post.likesCount);
    const [showComments, setShowComments] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const isOwner = currentUserId === post.creator.userId;

    // Sync local like state with fresh post data (e.g. after refetch/refresh)
    useEffect(() => {
        setIsLiked(!!post.isLiked);
        setLikesCount(post.likesCount);
    }, [post.isLiked, post.likesCount]);

    const handleLike = async () => {
        try {
            if (isLiked) {
                await postApi.unlikePost(post.id);
                setLikesCount(prev => Math.max(0, prev - 1));
            } else {
                await postApi.likePost(post.id);
                setLikesCount(prev => prev + 1);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            message.error('Failed to update like status');
        }
    };

    const handleDelete = async () => {
        if (!onDelete) return;
        try {
            await postApi.deletePost(post.id);
            message.success('Post deleted');
            onDelete(post.id);
        } catch (error) {
            message.error('Failed to delete post');
        }
    };

    const menu = (
        <Menu>
            {isOwner && (
                <>
                    <Menu.Item key="edit" icon={<EditOutlined />}>
                        Edit Post
                    </Menu.Item>
                    <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={handleDelete}>
                        Delete Post
                    </Menu.Item>
                </>
            )}
            <Menu.Item key="report" danger={!isOwner}>
                Report
            </Menu.Item>
        </Menu>
    );

    const renderMedia = () => {
        if (!post.media || post.media.length === 0) return null;

        if (post.type === 'IMAGE') {
            return (
                <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden' }}>
                    <Image.PreviewGroup>
                        <div style={{ display: 'grid', gridTemplateColumns: post.media.length > 1 ? 'repeat(2, 1fr)' : '1fr', gap: '4px' }}>
                            {post.media.map((item, index) => (
                                <Image
                                    key={index}
                                    src={getImageUrl(item.url)}
                                    alt="Post media"
                                    style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                                />
                            ))}
                        </div>
                    </Image.PreviewGroup>
                </div>
            );
        }

        if (post.type === 'VIDEO') {
            return (
                <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden' }}>
                    {post.media.map((item, index) => (
                        <div key={index}>
                            <video
                                controls
                                src={getImageUrl(item.url)}
                                style={{ width: '100%', borderRadius: '12px', maxHeight: '500px', backgroundColor: '#000' }}
                            />
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    return (
        <Card
            style={{
                marginBottom: '24px',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid #f0f0f0'
            }}
            bodyStyle={{ padding: '20px' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Avatar size={48} src={getImageUrl(post.creator.profileImage)} icon={<UserOutlined />} />
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Text strong style={{ fontSize: '16px' }}>{post.creator.displayName}</Text>
                            {post.creator.isVerified && <span style={{ color: '#1890ff' }}>✓</span>}
                        </div>
                        <Space size="small" style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                            <span>•</span>
                            {post.isPublished ? <GlobalOutlined /> : <LockOutlined />}
                        </Space>
                    </div>
                </div>
                <Dropdown overlay={menu} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined style={{ fontSize: '20px' }} />} />
                </Dropdown>
            </div>

            {/* Content */}
            <div style={{ marginBottom: '16px' }}>
                <Paragraph
                    ellipsis={!isExpanded ? { rows: 3, expandable: true, onExpand: () => setIsExpanded(true) } : false}
                    style={{ fontSize: '15px', lineHeight: '1.6', color: '#262626', marginBottom: '8px' }}
                >
                    {post.content}
                </Paragraph>
                {renderMedia()}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '4px', paddingRight: '4px' }}>
                <Space size="large">
                    <Space
                        onClick={handleLike}
                        style={{ cursor: 'pointer', color: isLiked ? '#ff4d4f' : '#595959', transition: 'all 0.3s' }}
                    >
                        {isLiked ? <HeartFilled style={{ fontSize: '20px' }} /> : <HeartOutlined style={{ fontSize: '20px' }} />}
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{likesCount}</span>
                    </Space>

                    <Space
                        onClick={() => setShowComments(!showComments)}
                        style={{ cursor: 'pointer', color: '#595959', transition: 'all 0.3s' }}
                    >
                        <MessageOutlined style={{ fontSize: '20px' }} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{post.commentsCount}</span>
                    </Space>

                    <Space style={{ cursor: 'pointer', color: '#595959' }}>
                        <ShareAltOutlined style={{ fontSize: '20px' }} />
                    </Space>
                </Space>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div style={{ marginTop: '20px' }}>
                    <Divider style={{ margin: '16px 0' }} />
                    <CommentSection postId={post.id} initialCommentsCount={post.commentsCount} />
                </div>
            )}
        </Card>
    );
};

export default PostCard;
