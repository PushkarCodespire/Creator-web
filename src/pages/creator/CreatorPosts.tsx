// ===========================================
// CREATOR POSTS PAGE - Premium Light Theme
// ===========================================

import React, { useState, useEffect } from 'react';
import { Typography, Empty, Spin, message, Layout, Modal, Card, Row, Col, Avatar, Tag, Grid, Space, Divider, Button } from 'antd';
import {
    Plus,
    TrendingUp,
    MessageSquare,
    Heart,
    Share2,
    Users,
    LayoutGrid,
    ArrowRight,
    Eye,
    Calendar,
    Zap,
    Sparkles,
    Search,
    ChevronRight,
    MoreVertical,
    Camera
} from 'lucide-react';
import { postApi, authApi, getImageUrl } from '../../services/api';
import PostCard from '../../components/Post/PostCard';
import PostCreator from '../../components/Post/PostCreator';
import CustomButton from '../../components/common/Button/CustomButton';
import { colors, spacing, shadows, borderRadius } from '../../styles/tokens';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { useBreakpoint } = Grid;

const CreatorPosts = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [overviewLoading, setOverviewLoading] = useState(true);
    const [overview, setOverview] = useState<any>(null);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const screens = useBreakpoint();
    const isMobile = !screens.md;

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
            message.error('Failed to load neural feed');
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
        message.success('Neural transmission successful!');
        fetchOverview();
    };

    const handlePostDeleted = (postId: string) => {
        setPosts(posts.filter(p => p.id !== postId));
        fetchOverview();
    };

    const handlePostUpdate = (postId: string) => {
        console.log('Update post', postId);
    };

    const totals = overview?.totals || {};
    const topPost = overview?.topPost;
    const recentComments = Array.isArray(overview?.recentComments) ? overview.recentComments : [];
    const topPostMedia = Array.isArray(topPost?.media) && topPost.media.length > 0 ? topPost.media[0] : null;
    const topPostImage = topPostMedia?.type === 'image' ? getImageUrl(topPostMedia.url) : '';

    const cardStyle = {
        background: '#ffffff',
        borderRadius: '24px',
        border: `1px solid ${colors.gray[100]}`,
        boxShadow: shadows.md,
        overflow: 'hidden'
    };

    const sidebarTitleStyle = {
        fontSize: '18px',
        fontWeight: 800,
        color: colors.text.primary,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px'
    };

    return (
        <Content style={{ padding: isMobile ? spacing[4] : spacing[8], background: colors.background, minHeight: '100vh' }}>
            <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing[10], flexWrap: 'wrap', gap: 24 }}
                >
                    <div>
                        <Title level={isMobile ? 3 : 1} style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.03em', color: colors.text.primary, lineHeight: 1.1 }}>
                            Feed <span style={{ color: colors.primary.solid }}>Nexus</span>
                        </Title>
                        <Text style={{ color: colors.text.secondary, fontSize: isMobile ? '14px' : '16px', fontWeight: 500, marginTop: '12px', display: 'block' }}>
                            Neural transmissions and community resonations
                        </Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<Plus size={18} style={{ marginRight: '8px' }} />}
                        onClick={() => setCreateModalVisible(true)}
                        style={{
                            borderRadius: '8px',
                            fontWeight: 600,
                            height: '44px',
                            padding: '0 24px',
                            background: colors.primary.solid,
                            border: 'none',
                            boxShadow: shadows.md,
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        Initiate Transmission
                    </Button>
                </motion.div>

                <Row gutter={[32, 32]}>
                    {/* Sidebar Overview */}
                    <Col xs={{ span: 24, order: 1 }} lg={{ span: 8, order: 2 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            {/* Neural Stats */}
                            <Card bordered={false} style={cardStyle}>
                                <div style={sidebarTitleStyle}>
                                    <TrendingUp size={20} color={colors.primary.solid} />
                                    <span>Neural Matrix Metrics</span>
                                </div>
                                {overviewLoading ? (
                                    <div style={{ textAlign: 'center', padding: '24px' }}><Spin /></div>
                                ) : (
                                    <Row gutter={[16, 16]}>
                                        {[
                                            { label: 'Followers', value: totals.followers ?? 0, icon: <Users size={14} />, color: colors.primary.solid },
                                            { label: 'Transmissions', value: totals.posts ?? 0, icon: <Zap size={14} />, color: colors.warning.solid },
                                            { label: 'Resonations', value: totals.comments ?? 0, icon: <MessageSquare size={14} />, color: '#ec4899' }
                                        ].map((stat, i) => (
                                            <Col span={8} key={i}>
                                                <div style={{ textAlign: 'center', padding: '16px 8px', background: colors.gray[50], borderRadius: '16px', border: `1px solid ${colors.gray[100]}` }}>
                                                    <div style={{ fontSize: '22px', fontWeight: 900, color: colors.text.primary, letterSpacing: '-0.02em', marginBottom: '4px' }}>{stat.value}</div>
                                                    <div style={{ fontSize: '10px', color: colors.text.tertiary, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                        {stat.label}
                                                    </div>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                )}
                            </Card>

                            {/* Flagship Transmission */}
                            <Card bordered={false} style={cardStyle}>
                                <div style={sidebarTitleStyle}>
                                    <Sparkles size={20} color={colors.warning.solid} />
                                    <span>High Resonance</span>
                                </div>
                                {overviewLoading ? (
                                    <div style={{ textAlign: 'center', padding: '24px' }}><Spin /></div>
                                ) : topPost ? (
                                    <div style={{ position: 'relative' }}>
                                        {topPostImage && (
                                            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', marginBottom: '20px', border: `1px solid ${colors.gray[100]}` }}>
                                                <img
                                                    src={topPostImage}
                                                    alt="Flagship post"
                                                    style={{ width: '100%', height: 180, objectFit: 'cover' }}
                                                />
                                                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                                                    <Tag bordered={false} style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', fontWeight: 700, backdropFilter: 'blur(10px)' }}>TOP STREAM</Tag>
                                                </div>
                                            </div>
                                        )}
                                        <div style={{ padding: '0 4px' }}>
                                            <Paragraph ellipsis={{ rows: 2 }} style={{ color: colors.text.primary, fontWeight: 600, fontSize: '15px', lineHeight: 1.5, marginBottom: '20px' }}>
                                                "{topPost.contentPreview || 'Nexus Transmission Active'}"
                                            </Paragraph>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ec4899', fontWeight: 800, fontSize: '13px' }}>
                                                    <Heart size={14} fill="#ec4899" /> {topPost.likes ?? 0}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.primary.solid, fontWeight: 800, fontSize: '13px' }}>
                                                    <MessageSquare size={14} fill={colors.primary.subtle} /> {topPost.comments ?? 0}
                                                </div>
                                                <div style={{ marginLeft: 'auto', color: colors.text.tertiary, fontSize: '11px', fontWeight: 700 }}>
                                                    {topPost.publishedAt ? new Date(topPost.publishedAt).toLocaleDateString() : 'SYNCED'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span style={{ fontWeight: 600, color: colors.text.tertiary }}>Neural void. No top stream.</span>} />
                                )}
                            </Card>

                            {/* Recent Community Resonance */}
                            <Card bordered={false} style={cardStyle}>
                                <div style={sidebarTitleStyle}>
                                    <MessageSquare size={20} color="#ec4899" />
                                    <span>Community Echoes</span>
                                </div>
                                {overviewLoading ? (
                                    <div style={{ textAlign: 'center', padding: '24px' }}><Spin /></div>
                                ) : recentComments.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {recentComments.map((comment: any) => (
                                            <div key={comment.id} style={{ display: 'flex', gap: 16, paddingBottom: '20px', borderBottom: `1px solid ${colors.gray[50]}` }}>
                                                <Avatar
                                                    size={44}
                                                    src={comment.user?.avatar ? getImageUrl(comment.user.avatar) : undefined}
                                                    style={{ border: `2px solid ${colors.gray[100]}`, background: colors.gray[50] }}
                                                />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                        <Text strong style={{ color: colors.text.primary, fontSize: '14px', letterSpacing: '-0.01em' }}>{comment.user?.name || 'Neural Entity'}</Text>
                                                        <Text style={{ color: colors.text.tertiary, fontSize: '10px', fontWeight: 700 }}>{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'NOW'}</Text>
                                                    </div>
                                                    <Paragraph ellipsis={{ rows: 2 }} style={{ color: colors.text.secondary, fontSize: '13px', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                                                        {comment.content}
                                                    </Paragraph>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span style={{ fontWeight: 600, color: colors.text.tertiary }}>Neural silence.</span>} />
                                )}
                            </Card>
                        </div>
                    </Col>

                    {/* Main Posts Feed */}
                    <Col xs={{ span: 24, order: 2 }} lg={{ span: 16, order: 1 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {loading ? (
                                <div style={{ background: '#ffffff', borderRadius: '24px', padding: '120px 0', border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.md, textAlign: 'center' }}>
                                    <Spin size="large" />
                                    <div style={{ marginTop: '24px', fontWeight: 700, color: colors.text.tertiary, letterSpacing: '0.05em' }}>SYNCHRONIZING FEED...</div>
                                </div>
                            ) : posts.length > 0 ? (
                                <AnimatePresence>
                                    {posts.map((post, index) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            style={{
                                                background: '#ffffff',
                                                borderRadius: '24px',
                                                border: `1px solid ${colors.gray[100]}`,
                                                boxShadow: shadows.md,
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <PostCard
                                                post={post}
                                                onPostDelete={handlePostDeleted}
                                                onPostUpdate={handlePostUpdate}
                                                currentCreatorId={currentUser?.creator?.id}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            ) : (
                                <div style={{ background: '#ffffff', borderRadius: '24px', padding: '100px 40px', border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.md, textAlign: 'center' }}>
                                    <div style={{ background: colors.primary.subtle, width: '80px', height: '80px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', color: colors.primary.solid }}>
                                        <LayoutGrid size={40} />
                                    </div>
                                    <Title level={4} style={{ fontWeight: 800, color: colors.text.primary, marginBottom: '16px' }}>Empty Neural Channel</Title>
                                    <Paragraph style={{ color: colors.text.secondary, fontSize: '16px', maxWidth: '400px', margin: '0 auto 40px', fontWeight: 500 }}>
                                        No transmissions detected in your feed matrix. Start synchronizing with your community now.
                                    </Paragraph>
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={() => setCreateModalVisible(true)}
                                        style={{ height: '44px', borderRadius: '8px', fontWeight: 600, padding: '0 32px', background: colors.primary.solid, border: 'none', boxShadow: shadows.md }}
                                    >
                                        Initiate First Transmission
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </div>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: colors.primary.subtle, padding: '8px', borderRadius: '10px' }}>
                            <Zap size={20} style={{ color: colors.primary.solid }} />
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: colors.text.primary, letterSpacing: '-0.02em' }}>
                            Neural Transmission
                        </div>
                    </div>
                }
                open={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                footer={null}
                destroyOnClose
                width={640}
                centered
                className="premium-modal"
            >
                <div style={{ paddingTop: '24px' }}>
                    <PostCreator
                        onPostCreated={handlePostCreated}
                        onCancel={() => setCreateModalVisible(false)}
                        placeholder="What knowledge would you like to stream today? Use @mentions to resonate..."
                    />
                </div>
            </Modal>

            <style>{`
                .premium-modal .ant-modal-content {
                    border-radius: 12px !important;
                    padding: 32px !important;
                    background: #FFFFFF !important;
                    border: 1px solid ${colors.gray[100]} !important;
                    box-shadow: ${shadows.xl} !important;
                }
                .premium-modal .ant-modal-header {
                    border-bottom: none !important;
                    margin-bottom: 0 !important;
                    background: transparent !important;
                }
                
                /* Override PostCard internal styles for cleaner look in the list */
                div[style*="box-shadow"] > div > .ant-card {
                    border: none !important;
                    box-shadow: none !important;
                    background: transparent !important;
                }
            `}</style>
        </Content>
    );
};

export default CreatorPosts;
