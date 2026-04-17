
import React, { useState, useEffect } from 'react';
import { Avatar, Button, Input, message, Skeleton, Typography, Space } from 'antd';
import { UserOutlined, MessageOutlined, SendOutlined } from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { commentApi } from '../../services/api';
import { logger } from '../../utils/logger';

const { Text } = Typography;
const { TextArea } = Input;

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        avatar?: string;
    };
    likesCount: number;
    isLiked?: boolean;
    replies?: Comment[];
}

interface CommentSectionProps {
    postId: string;
    initialCommentsCount?: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, initialCommentsCount = 0 }) => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [totalComments, setTotalComments] = useState(initialCommentsCount);

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await commentApi.getComments(postId);
            if (response.data.success) {
                setComments(response.data.data.comments);
                setTotalComments(response.data.data.pagination.total);
            }
        } catch (error) {
            logger.error('Failed to fetch comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!newComment.trim()) return;

        try {
            setSubmitting(true);
            const response = await commentApi.createComment(postId, {
                content: newComment,
                parentId: replyTo || undefined
            });

            if (response.data.success) {
                message.success('Comment added');
                setNewComment('');
                setReplyTo(null);
                fetchComments(); // Refresh comments to show new one
                setTotalComments(prev => prev + 1);
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (__error) {
            message.error('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (commentId: string, isLiked: boolean) => {
        try {
            if (isLiked) {
                await commentApi.unlikeComment(commentId);
            } else {
                await commentApi.likeComment(commentId);
            }

            // Optimistic update
            setComments(prev => prev.map(comment => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        isLiked: !isLiked,
                        likesCount: isLiked ? comment.likesCount - 1 : comment.likesCount + 1
                    };
                }
                return comment;
            }));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (__error) {
            message.error('Failed to update like');
        }
    };

    const CommentItem = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => (
        <div style={{
            marginBottom: '16px',
            marginLeft: isReply ? '48px' : '0',
            borderLeft: isReply ? '2px solid #f0f0f0' : 'none',
            paddingLeft: isReply ? '16px' : '0'
        }}>
            <div style={{ display: 'flex', gap: '12px' }}>
                <Avatar src={comment.user.avatar} icon={<UserOutlined />} />
                <div style={{ flex: 1 }}>
                    <div style={{ background: '#f5f7fa', padding: '12px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <Text strong>{comment.user.name}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </Text>
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</div>
                    </div>

                    <Space size="small" style={{ marginTop: '4px', marginLeft: '4px' }}>
                        <span
                            onClick={() => handleLike(comment.id, !!comment.isLiked)}
                            style={{
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: comment.isLiked ? '#1890ff' : '#8c8c8c',
                                fontWeight: comment.isLiked ? 600 : 400
                            }}
                        >
                            {comment.isLiked ? 'Liked' : 'Like'} {comment.likesCount > 0 && `(${comment.likesCount})`}
                        </span>
                        <span
                            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                            style={{ cursor: 'pointer', fontSize: '12px', color: '#8c8c8c' }}
                        >
                            Reply
                        </span>
                    </Space>

                    {/* Render Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                            {comment.replies.map(reply => (
                                <CommentItem key={reply.id} comment={reply} isReply={true} />
                            ))}
                        </div>
                    )}

                    {/* Reply Input */}
                    {replyTo === comment.id && (
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                            <Input
                                placeholder={`Reply to ${comment.user.name}...`}
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                onPressEnter={handleSubmit}
                            />
                            <Button type="primary" size="small" onClick={handleSubmit} loading={submitting}>
                                Reply
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="comment-section">
            <div style={{ marginBottom: '24px' }}>
                <Text strong style={{ fontSize: '16px' }}>Comments ({totalComments})</Text>
            </div>

            {!isAuthenticated ? (
                <div style={{ textAlign: 'center', padding: '20px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '24px' }}>
                    <Text type="secondary">Please log in to leave a comment</Text>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                    <Avatar icon={<UserOutlined />} />
                    <div style={{ flex: 1 }}>
                        <TextArea
                            rows={2}
                            placeholder="Write a comment..."
                            value={!replyTo ? newComment : ''}
                            onChange={e => {
                                if (!replyTo) setNewComment(e.target.value);
                            }}
                            style={{ borderRadius: '8px', marginBottom: '8px' }}
                        />
                        <div style={{ textAlign: 'right' }}>
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSubmit}
                                loading={submitting}
                                disabled={!newComment.trim() || !!replyTo}
                            >
                                Post Comment
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <Skeleton avatar paragraph={{ rows: 3 }} active />
            ) : (
                <div className="comments-list">
                    {comments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                    {comments.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <MessageOutlined style={{ fontSize: '32px', color: '#d9d9d9', marginBottom: '8px' }} />
                            <p style={{ color: '#8c8c8c' }}>No comments yet. Be the first to share your thoughts!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentSection;
