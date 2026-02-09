import { useState, useEffect } from 'react';
import { Modal, List, Avatar, Tag, Rate, Progress, Spin, message, Row, Col } from 'antd';
import { UserOutlined, StarFilled } from '@ant-design/icons';
import { reviewApi, getImageUrl } from '../../services/api';
import { colors, spacing, typography } from '../../styles/tokens';

interface ReviewsModalProps {
    creatorId: string;
    visible: boolean;
    onClose: () => void;
    initialSummary?: any;
}

export const ReviewsModal: React.FC<ReviewsModalProps> = ({ creatorId, visible, onClose, initialSummary }) => {
    const [loading, setLoading] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(initialSummary);
    const [page, setPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        if (visible && creatorId) {
            fetchReviews();
        }
    }, [visible, page, creatorId]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await reviewApi.getReviews(creatorId, { page, limit });
            setReviews(response.data.data.reviews);
            setSummary(response.data.data.summary);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
            message.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const getBreakdownTotal = () => {
        if (!summary?.breakdown) return 0;
        return Object.values(summary.breakdown).reduce((a: any, b: any) => a + b, 0) as number;
    };

    const totalPossible = getBreakdownTotal();

    return (
        <Modal
            title="Creator Reviews"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            bodyStyle={{ maxHeight: '700px', overflowY: 'auto' }}
        >
            <div style={{ marginBottom: spacing[8], padding: spacing[4], background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px' }}>
                <Row gutter={48} align="middle">
                    <Col xs={24} sm={8} style={{ textAlign: 'center', marginBottom: spacing[4] }}>
                        <div style={{ fontSize: '48px', fontWeight: 800, color: '#FFFFFF' }}>
                            {summary?.averageRating ? Number(summary.averageRating).toFixed(1) : '0.0'}
                        </div>
                        <Rate disabled allowHalf value={summary?.averageRating || 0} />
                        <div style={{ color: colors.gray[500], marginTop: '8px' }}>
                            Based on {summary?.totalReviews || 0} reviews
                        </div>
                    </Col>
                    <Col xs={24} sm={16}>
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <span style={{ width: '20px', color: colors.gray[400], fontWeight: 600 }}>{star}</span>
                                <StarFilled style={{ color: colors.warning.solid }} />
                                <Progress
                                    percent={totalPossible > 0 ? ((summary?.breakdown?.[star] || 0) / totalPossible) * 100 : 0}
                                    showInfo={false}
                                    strokeColor={colors.warning.solid}
                                    trailColor="rgba(255, 255, 255, 0.05)"
                                    style={{ flex: 1 }}
                                />
                                <span style={{ width: '30px', color: colors.gray[500], fontSize: '12px', textAlign: 'right' }}>
                                    {summary?.breakdown?.[star] || 0}
                                </span>
                            </div>
                        ))}
                    </Col>
                </Row>
            </div>

            <Spin spinning={loading}>
                <List
                    dataSource={reviews}
                    renderItem={(item) => (
                        <List.Item style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', padding: '24px 0' }}>
                            <List.Item.Meta
                                avatar={<Avatar src={getImageUrl(item.user?.avatar)} icon={<UserOutlined />} size="large" />}
                                title={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '16px' }}>{item.user?.name}</span>
                                        <span style={{ color: colors.gray[500], fontSize: '12px', fontWeight: 400 }}>
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                }
                                description={
                                    <div style={{ marginTop: '8px' }}>
                                        <Rate disabled value={item.rating} style={{ fontSize: '12px', marginBottom: '12px' }} />
                                        <p style={{ color: colors.gray[300], lineHeight: 1.6, fontSize: '14px' }}>
                                            {item.comment}
                                        </p>
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
