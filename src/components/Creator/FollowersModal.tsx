import { useState, useEffect } from 'react';
import { Modal, List, Avatar, Button, message, Popconfirm, Spin } from 'antd';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { creatorApi, getImageUrl } from '../../services/api';
import { colors } from '../../styles/tokens';

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
            message.success('Follower removed successfully');
            fetchFollowers();
        } catch (err) {
            console.error('Failed to remove follower:', err);
            message.error('Failed to remove follower');
        }
    };

    return (
        <Modal
            title="All Followers"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={700}
            bodyStyle={{ maxHeight: '600px', overflowY: 'auto' }}
        >
            <Spin spinning={loading}>
                <List
                    itemLayout="horizontal"
                    dataSource={followers}
                    pagination={{
                        current: page,
                        pageSize: limit,
                        total: total,
                        onChange: (p) => setPage(p),
                        simple: true,
                        style: { textAlign: 'center', marginTop: '24px' }
                    }}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Popconfirm
                                    title="Remove Follower"
                                    description="Are you sure you want to remove this follower?"
                                    onConfirm={() => handleRemoveFollower(item.followerId)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button type="text" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar src={getImageUrl(item.avatar)} icon={<UserOutlined />} />}
                                title={<span style={{ fontWeight: 600 }}>{item.name}</span>}
                                description={
                                    <div>
                                        <div>{item.email}</div>
                                        <div style={{ fontSize: '12px', color: colors.gray[500] }}>
                                            Followed on {new Date(item.followedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Spin>
        </Modal>
    );
};
