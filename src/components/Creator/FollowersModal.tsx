import { useState, useEffect } from 'react';
import { Modal, List, Avatar, Button, message, Popconfirm, Spin } from 'antd';
import { User, Trash2, Users } from 'lucide-react';
import { creatorApi, getImageUrl } from '../../services/api';
import { colors, spacing, shadows, borderRadius } from '../../styles/tokens';

interface FollowersModalProps {
    visible: boolean;
    onClose: () => void;
}

export const FollowersModal: React.FC<FollowersModalProps> = ({ visible, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [followers, setFollowers] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 20;

    useEffect(() => {
        if (visible) {
            fetchFollowers();
        }
    }, [visible, page]);

    const fetchFollowers = async () => {
        setLoading(true);
        try {
            const response = await creatorApi.getFollowers({ page, limit });
            setFollowers(response.data.data.followers);
            setTotal(response.data.data.totals.total);
        } catch (err) {
            console.error('Failed to fetch followers:', err);
            message.error('Failed to load followers');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFollower = async (followerId: string) => {
        try {
            await creatorApi.removeFollower(followerId);
            message.success('Follower removed from matrix');
            fetchFollowers();
        } catch (err) {
            console.error('Failed to remove follower:', err);
            message.error('Failed to remove follower');
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                    <div style={{ background: colors.primary.subtle, padding: '8px', borderRadius: '10px' }}>
                        <Users size={20} style={{ color: colors.primary.solid }} />
                    </div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: colors.text.primary }}>Neural Followers</div>
                        <div style={{ fontSize: '12px', color: colors.text.tertiary, fontWeight: 500 }}>Total Matrix Capacity: {total}</div>
                    </div>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
            centered
            className="premium-modal"
        >
            <Spin spinning={loading} tip="Synchronizing followers...">
                <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
                    <List
                        itemLayout="horizontal"
                        dataSource={followers}
                        pagination={total > limit ? {
                            current: page,
                            pageSize: limit,
                            total: total,
                            onChange: (p) => setPage(p),
                            simple: true,
                            style: { textAlign: 'center', marginTop: '24px' }
                        } : false}
                        renderItem={(item) => (
                            <List.Item
                                style={{
                                    padding: '16px',
                                    borderRadius: '12px',
                                    marginBottom: '8px',
                                    transition: 'all 0.2s ease',
                                    border: `1px solid ${colors.gray[100]}`,
                                    background: '#FFFFFF'
                                }}
                                className="follower-item"
                                actions={[
                                    <Popconfirm
                                        title="Remove Follower"
                                        description="Are you sure you want to disconnect this follower from your matrix?"
                                        onConfirm={() => handleRemoveFollower(item.followerId)}
                                        okText="Disconnect"
                                        cancelText="Cancel"
                                        okButtonProps={{ danger: true, style: { borderRadius: '8px' } }}
                                        cancelButtonProps={{ style: { borderRadius: '8px' } }}
                                    >
                                        <Button
                                            type="text"
                                            danger
                                            icon={<Trash2 size={16} />}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        />
                                    </Popconfirm>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <div style={{ position: 'relative' }}>
                                            <Avatar
                                                src={getImageUrl(item.avatar)}
                                                icon={<User size={20} />}
                                                size={48}
                                                style={{ border: `2px solid ${colors.gray[100]}`, background: colors.gray[50] }}
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                width: 12,
                                                height: 12,
                                                background: colors.success.solid,
                                                borderRadius: '50%',
                                                border: '2px solid #fff'
                                            }} />
                                        </div>
                                    }
                                    title={<span style={{ fontWeight: 700, color: colors.text.primary, fontSize: '15px' }}>{item.name}</span>}
                                    description={
                                        <div>
                                            <div style={{ color: colors.text.secondary, fontSize: '13px', fontWeight: 500 }}>{item.email}</div>
                                            <div style={{ fontSize: '11px', color: colors.text.tertiary, marginTop: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                                Connected since {new Date(item.followedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </div>
            </Spin>
            <style>{`
                .follower-item:hover {
                    box-shadow: ${shadows.md};
                    border-color: ${colors.primary.subtle} !important;
                    transform: translateY(-2px);
                }
                .premium-modal .ant-modal-content {
                    border-radius: 20px !important;
                    padding: 24px !important;
                    background: #FFFFFF !important;
                    border: none !important;
                    box-shadow: ${shadows.xl} !important;
                }
                .premium-modal .ant-modal-header {
                    margin-bottom: 24px !important;
                    background: transparent !important;
                }
            `}</style>
        </Modal>
    );
};

