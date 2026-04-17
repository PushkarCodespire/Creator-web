import React, { useState, useEffect } from 'react';
import { Card, Empty, Typography, Avatar, Button, Space } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { followApi, getImageUrl } from '../../services/api';
import { motion } from 'framer-motion';
import DashboardContentLoader from '../../components/common/DashboardContentLoader';
import { colors, shadows } from '../../styles/tokens';
import { logger } from '../../utils/logger';

const { Title, Text } = Typography;

const UserFollowing = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [following, setFollowing] = useState<any[]>([]);

    useEffect(() => {
        if (user?.id) {
            fetchFollowing();
        }
    }, [user?.id]);

    const fetchFollowing = async () => {
        try {
            setLoading(true);
            const response = await followApi.getFollowing(user?.id || '');
            setFollowing(response.data.data.following || []);
        } catch (err) {
            logger.error('Failed to fetch following:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnfollow = async (creatorId: string) => {
        try {
            await followApi.unfollowCreator(creatorId);
            setFollowing(prev => prev.filter(c => c.id !== creatorId));
        } catch (err) {
            logger.error('Failed to unfollow:', err);
        }
    };

    if (loading) return <DashboardContentLoader />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '32px' }}
        >
            <div style={{ marginBottom: '32px' }}>
                <Title level={2} style={{ color: colors.text.primary, marginBottom: '4px', fontWeight: 800, letterSpacing: '-0.02em' }}>Following</Title>
                <Text style={{ color: colors.text.tertiary, fontSize: '16px', fontWeight: 500 }}>Creators you follow and support.</Text>
            </div>

            {following.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
                    {following.map((creator) => (
                        <Card
                            key={creator.id}
                            bordered={false}
                            style={{
                                background: '#ffffff',
                                borderRadius: '24px',
                                border: `1px solid ${colors.gray[100]}`,
                                boxShadow: shadows.md,
                                overflow: 'hidden',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            bodyStyle={{ padding: '24px', textAlign: 'center' }}
                        >
                            <Avatar
                                size={80}
                                src={getImageUrl(creator.profileImage)}
                                style={{
                                    marginBottom: '16px',
                                    border: `2px solid ${colors.primary.subtle}`,
                                    background: colors.gray[50]
                                }}
                            />
                            <Title level={4} style={{ color: colors.text.primary, marginBottom: '4px', fontSize: '18px', fontWeight: 800 }}>{creator.displayName}</Title>
                            <Text style={{ color: colors.text.tertiary, fontSize: '12px', display: 'block', marginBottom: '16px', fontWeight: 600 }}>{creator.bio?.slice(0, 60)}...</Text>

                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Button type="primary" block onClick={() => navigate(`/creator/${creator.id}`)}>
                                    View Profile
                                </Button>
                                <Button type="text" danger onClick={() => handleUnfollow(creator.id)}>
                                    Unfollow
                                </Button>
                            </Space>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card
                    bordered={false}
                    style={{
                        background: '#ffffff',
                        border: `1px solid ${colors.gray[100]}`,
                        borderRadius: '24px',
                        padding: '60px 0',
                        textAlign: 'center',
                        boxShadow: shadows.md
                    }}
                >
                    <Empty
                        description={<span style={{ color: colors.text.tertiary, fontSize: '16px', fontWeight: 500 }}>You are not following any creators yet</span>}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            )}
        </motion.div>
    );
};

export default UserFollowing;
