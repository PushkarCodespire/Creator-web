import React, { useState, useEffect } from 'react';
import { Card, Empty, Typography, Avatar, Button, Space } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { followApi, getImageUrl } from '../../services/api';
import { motion } from 'framer-motion';
import DashboardContentLoader from '../../components/common/DashboardContentLoader';

const { Title, Text } = Typography;

const UserFollowing = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
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
            console.error('Failed to fetch following:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnfollow = async (creatorId: string) => {
        try {
            await followApi.unfollowCreator(creatorId);
            setFollowing(prev => prev.filter(c => c.id !== creatorId));
        } catch (err) {
            console.error('Failed to unfollow:', err);
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
                <Title level={2} style={{ color: '#fff', marginBottom: '4px', fontWeight: 800 }}>Following</Title>
                <Text style={{ color: '#94A3B8', fontSize: '16px' }}>Creators you follow and support.</Text>
            </div>

            {following.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
                    {following.map((creator) => (
                        <Card
                            key={creator.id}
                            style={{
                                background: 'rgba(30, 41, 59, 0.4)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '24px',
                                overflow: 'hidden'
                            }}
                            bodyStyle={{ padding: '24px', textAlign: 'center' }}
                        >
                            <Avatar
                                size={80}
                                src={getImageUrl(creator.profileImage)}
                                style={{ marginBottom: '16px', border: '2px solid rgba(102, 126, 234, 0.5)' }}
                            />
                            <Title level={4} style={{ color: '#fff', marginBottom: '4px', fontSize: '18px' }}>{creator.displayName}</Title>
                            <Text style={{ color: '#94A3B8', fontSize: '12px', display: 'block', marginBottom: '16px' }}>{creator.bio?.slice(0, 60)}...</Text>

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
                    style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '24px',
                        padding: '40px 0'
                    }}
                >
                    <Empty
                        description={<span style={{ color: '#94A3B8', fontSize: '16px' }}>You are not following any creators yet</span>}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            )}
        </motion.div>
    );
};

export default UserFollowing;
