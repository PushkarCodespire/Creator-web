import { useState, useEffect } from 'react';
import { Modal, List, Avatar, Rate, Progress, Spin, message, Row, Col } from 'antd';
import { User, Star, StarHalf, MessageSquare } from 'lucide-react';
import { reviewApi, getImageUrl } from '../../services/api';
import { colors, spacing, shadows, borderRadius } from '../../styles/tokens';

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
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                    <div style={{ background: colors.warning.subtle, padding: '8px', borderRadius: '10px' }}>
                        <Star size={20} style={{ color: colors.warning.solid, fill: colors.warning.solid }} />
                    </div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: colors.text.primary }}>Creator Feedback Matrix</div>
                        <div style={{ fontSize: '12px', color: colors.text.tertiary, fontWeight: 500 }}>Verified interactions from your neural audience</div>
                    </div>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            centered
            className="premium-modal"
        >
            <div style={{
                marginBottom: spacing[8],
                padding: '32px',
                background: '#FFFFFF',
                borderRadius: '20px',
                border: `1px solid ${colors.gray[100]}`,
                boxShadow: shadows.md
            }}>
                <Row gutter={[48, 32]} align="middle">
                    <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '56px', fontWeight: 800, color: colors.text.primary, letterSpacing: '-0.02em', lineHeight: 1 }}>
                            {summary?.averageRating ? Number(summary.averageRating).toFixed(1) : '0.0'}
                        </div>
                        <div style={{ marginTop: '12px' }}>
                            <Rate disabled allowHalf value={summary?.averageRating || 0} style={{ color: colors.warning.solid }} />
                        </div>
                        <div style={{ color: colors.text.tertiary, marginTop: '12px', fontSize: '14px', fontWeight: 600 }}>
                            {summary?.totalReviews || 0} Total Reviews
                        </div>
                    </Col>
                    <Col xs={24} sm={16}>
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = summary?.breakdown?.[star] || 0;
                            const percentage = totalPossible > 0 ? (count / totalPossible) * 100 : 0;
                            return (
                                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
                                    <span style={{ minWidth: '12px', color: colors.text.secondary, fontWeight: 700, fontSize: '13px' }}>{star}</span>
                                    <Star size={14} style={{ color: colors.warning.solid, fill: colors.warning.solid }} />
                                    <Progress
                                        percent={percentage}
                                        showInfo={false}
                                        strokeColor={colors.warning.solid}
                                        trailColor={colors.gray[100]}
                                        style={{ flex: 1 }}
                                        strokeWidth={8}
                                    />
                                    <span style={{ minWidth: '40px', color: colors.text.tertiary, fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </Col>
                </Row>
            </div>

            <Spin spinning={loading} tip="Synchronizing feedback data...">
                <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                    <List
                        dataSource={reviews}
                        renderItem={(item) => (
                            <List.Item style={{ borderBottom: `1px solid ${colors.gray[100]}`, padding: '24px 16px', borderRadius: '12px', marginBottom: '8px', transition: 'all 0.2s ease' }} className="review-item">
                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            src={getImageUrl(item.user?.avatar)}
                                            icon={<User size={24} />}
                                            size={56}
                                            style={{ border: `2px solid ${colors.gray[100]}`, background: colors.gray[50] }}
                                        />
                                    }
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: colors.text.primary, fontWeight: 700, fontSize: '16px' }}>{item.user?.name}</span>
                                            <span style={{ color: colors.text.tertiary, fontSize: '12px', fontWeight: 500 }}>
                                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    }
                                    description={
                                        <div style={{ marginTop: '8px' }}>
                                            <Rate disabled value={item.rating} style={{ fontSize: '14px', marginBottom: '12px', color: colors.warning.solid }} />
                                            <p style={{ color: colors.text.secondary, lineHeight: 1.6, fontSize: '15px', fontWeight: 500, margin: 0 }}>
                                                {item.comment || "The user provided a rating without additional commentary."}
                                            </p>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                        locale={{
                            emptyText: (
                                <div style={{ padding: '48px 0', textAlign: 'center' }}>
                                    <MessageSquare size={48} style={{ color: colors.gray[200], marginBottom: '16px' }} />
                                    <div style={{ color: colors.text.tertiary, fontWeight: 500 }}>No feedback recorded in this matrix cycle</div>
                                </div>
                            )
                        }}
                    />
                </div>
            </Spin>
            <style>{`
                .review-item:hover {
                    background: ${colors.gray[50]};
                }
                .premium-modal .ant-modal-content {
                    border-radius: 24px !important;
                    padding: 32px !important;
                    background: #FFFFFF !important;
                    border: none !important;
                    box-shadow: ${shadows.xl} !important;
                }
                .premium-modal .ant-modal-header {
                    margin-bottom: 32px !important;
                    background: transparent !important;
                }
            `}</style>
        </Modal>
    );
};

