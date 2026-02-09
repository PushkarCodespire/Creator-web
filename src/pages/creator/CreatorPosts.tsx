
import React, { useState, useEffect } from 'react';
import { Typography, Empty, Spin, message, Layout, Modal, Card, Row, Col, Avatar, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { postApi, authApi, getImageUrl } from '../../services/api';
import PostCard from '../../components/Post/PostCard';
import PostCreator from '../../components/Post/PostCreator';
import CustomButton from '../../components/common/Button/CustomButton';

const { Title, Text } = Typography;
const { Content } = Layout;

const CreatorPosts = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [overviewLoading, setOverviewLoading] = useState(true);
    const [overview, setOverview] = useState<any>(null);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        fetchCurrentUser();
        fetchPosts();
        fetchOverview();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await authApi.getCurrentUser();
            setCurrentUser(response.data.data);
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);
            let creatorId;
            if (currentUser?.creator?.id) {
                creatorId = currentUser.creator.id;
            } else {
                const userRes = await authApi.getCurrentUser();
                creatorId = userRes.data.data.creator?.id;
            }

            if (creatorId) {
                const response = await postApi.getFeed({ creatorId, limit: 20 });
                if (response.data.success) {
                    setPosts(response.data.data.posts);
                }
            }
        } catch (error) {
            message.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const fetchOverview = async () => {
        try {
            setOverviewLoading(true);
            const response = await postApi.getStatsOverview();
            setOverview(response.data.data || null);
        } catch (error) {
            console.error('Failed to fetch posts overview:', error);
        } finally {
            setOverviewLoading(false);
        }
    };

    const handlePostCreated = (newPost: any) => {
        setPosts([newPost, ...posts]);
        setCreateModalVisible(false);
        message.success('Post published!');
        fetchOverview();
    };

    const handlePostDeleted = (postId: string) => {
        setPosts(posts.filter(p => p.id !== postId));
        fetchOverview();
    };

    const handlePostUpdate = (postId: string) => {
        // For now just refresh or we could implement edit logic
        console.log('Update post', postId);
    };

    const totals = overview?.totals || {};
    const topPost = overview?.topPost;
    const recentComments = Array.isArray(overview?.recentComments) ? overview.recentComments : [];
    const topPostMedia = Array.isArray(topPost?.media) && topPost.media.length > 0 ? topPost.media[0] : null;
    const topPostImage = topPostMedia?.type === 'image' ? getImageUrl(topPostMedia.url) : '';

    return (
        <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <Title level={2} style={{ marginBottom: 0 }}>My Posts</Title>
                    <Text type="secondary">Manage your social content and interactions</Text>
                </div>
                <CustomButton
                    variant="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => setCreateModalVisible(true)}
                >
                    Create Post
                </CustomButton>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={{ span: 24, order: 1 }} lg={{ span: 8, order: 2 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <Card title="Overview" bodyStyle={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {overviewLoading ? (
                                <div style={{ textAlign: 'center', padding: '12px' }}><Spin /></div>
                            ) : (
                                <Row gutter={[12, 12]}>
                                    <Col span={8}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 700 }}>{totals.followers ?? 0}</div>
                                            <div style={{ fontSize: '12px', color: '#64748B' }}>Followers</div>
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 700 }}>{totals.posts ?? 0}</div>
                                            <div style={{ fontSize: '12px', color: '#64748B' }}>Posts</div>
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 700 }}>{totals.comments ?? 0}</div>
                                            <div style={{ fontSize: '12px', color: '#64748B' }}>Comments</div>
                                        </div>
                                    </Col>
                                </Row>
                            )}
                        </Card>

                        <Card title="Top Post">
                            {overviewLoading ? (
                                <div style={{ textAlign: 'center', padding: '12px' }}><Spin /></div>
                            ) : topPost ? (
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {topPostImage && (
                                        <img
                                            src={topPostImage}
                                            alt="Top post"
                                            style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover' }}
                                        />
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <Text style={{ display: 'block', marginBottom: 8 }}>
                                            {topPost.contentPreview || 'Top post'}
                                        </Text>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                            <Tag color="magenta">{topPost.likes ?? 0} likes</Tag>
                                            <Tag color="blue">{topPost.comments ?? 0} comments</Tag>
                                        </div>
                                        {topPost.publishedAt && (
                                            <div style={{ color: '#64748B', fontSize: 12, marginTop: 6 }}>
                                                Published {new Date(topPost.publishedAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No top post yet" />
                            )}
                        </Card>

                        <Card title="Recent Comments">
                            {overviewLoading ? (
                                <div style={{ textAlign: 'center', padding: '12px' }}><Spin /></div>
                            ) : recentComments.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {recentComments.map((comment: any) => (
                                        <div key={comment.id} style={{ display: 'flex', gap: 12 }}>
                                            <Avatar src={comment.user?.avatar ? getImageUrl(comment.user.avatar) : undefined}>
                                                {comment.user?.name?.[0]?.toUpperCase() || 'U'}
                                            </Avatar>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600 }}>{comment.user?.name || 'User'}</div>
                                                <div style={{ color: '#475569', fontSize: 13 }}>{comment.content}</div>
                                                <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>
                                                    {comment.post?.contentPreview || 'On your post'}
                                                </div>
                                                <div style={{ color: '#94A3B8', fontSize: 11 }}>
                                                    {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No recent comments" />
                            )}
                        </Card>
                    </div>
                </Col>

                <Col xs={{ span: 24, order: 2 }} lg={{ span: 16, order: 1 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Spin size="large" />
                        </div>
                    ) : posts.length > 0 ? (
                        <div className="posts-list">
                            {posts.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onPostDelete={handlePostDeleted}
                                    onPostUpdate={handlePostUpdate}
                                />
                            ))}
                        </div>
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No posts yet"
                        >
                            <CustomButton variant="primary" onClick={() => setCreateModalVisible(true)}>
                                Create your first post
                            </CustomButton>
                        </Empty>
                    )}
                </Col>
            </Row>

            <Modal
                title="Create New Post"
                open={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                footer={null}
                destroyOnClose
                width={600}
            >
                <PostCreator
                    onPostCreated={handlePostCreated}
                    onCancel={() => setCreateModalVisible(false)}
                    placeholder="Share something with your fans..."
                />
            </Modal>
        </Content>
    );
};

export default CreatorPosts;
