// ===========================================
// CREATOR REVIEWS COMPONENT
// Reviews list, stats, and user review form
// ===========================================

import { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Col, Form, Input, Pagination, Popconfirm, Progress, Rate, Row, Select, Spin, message as antMessage } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { reviewApi, getImageUrl } from '../../services/api';
import { Review, ReviewStats } from '../../types';
import { connectSocket, getSocket } from '../../utils/socket';
import CustomCard from '../common/Card/CustomCard';
import { EmptyState } from '../common/EmptyState/EmptyState';
import { colors, spacing, typography } from '../../styles/tokens';

interface CreatorReviewsProps {
  creatorId: string;
  creatorName?: string;
}

type ReviewSort = 'newest' | 'oldest' | 'highest' | 'lowest';

const CreatorReviews = ({ creatorId, creatorName }: CreatorReviewsProps) => {
  const { user, isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 6, total: 0, totalPages: 1 });
  const [sort, setSort] = useState<ReviewSort>('newest');
  const [loading, setLoading] = useState(false);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const computedStats = useMemo(() => {
    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let sum = 0;

    reviews.forEach((review) => {
      const rating = Math.round(Number(review.rating) || 0) as 1 | 2 | 3 | 4 | 5;
      if (breakdown[rating] !== undefined) {
        breakdown[rating] += 1;
      }
      sum += Number(review.rating) || 0;
      total += 1;
    });

    return {
      averageRating: total > 0 ? sum / total : 0,
      totalReviews: total,
      breakdown
    };
  }, [reviews]);

  const displayStats: ReviewStats = {
    averageRating: stats?.averageRating ?? computedStats.averageRating,
    totalReviews: stats?.totalReviews ?? computedStats.totalReviews,
    breakdown: stats?.breakdown ?? computedStats.breakdown
  };

  useEffect(() => {
    if (!creatorId) return;
    fetchReviews();
  }, [creatorId, pagination.page, pagination.limit, sort]);

  useEffect(() => {
    if (!creatorId) return;
    if (isAuthenticated) {
      fetchMyReview();
    } else {
      setMyReview(null);
      form.setFieldsValue({ rating: 5, review: '' });
    }
  }, [creatorId, isAuthenticated]);

  useEffect(() => {
    if (!creatorId) return;
    const authToken = token || localStorage.getItem('token') || undefined;
    if (!authToken) return;
    const socket = connectSocket(authToken, user?.id);

    const handleReviewEvent = (payload: any) => {
      const eventCreatorId =
        payload?.creatorId ||
        payload?.review?.creatorId ||
        payload?.data?.creatorId ||
        payload?.creator?.id;
      if (eventCreatorId && eventCreatorId !== creatorId) return;
      fetchReviews();
    };

    const handleRatingUpdate = (payload: any) => {
      if (payload?.creatorId !== creatorId) return;
      setStats((prev) => ({
        averageRating: payload?.averageRating ?? prev?.averageRating ?? 0,
        totalReviews: payload?.totalReviews ?? prev?.totalReviews ?? 0,
        breakdown: prev?.breakdown
      }));
    };

    socket.on('review:new', handleReviewEvent);
    socket.on('review:updated', handleReviewEvent);
    socket.on('review:deleted', handleReviewEvent);
    socket.on('creator:rating_updated', handleRatingUpdate);

    return () => {
      const current = getSocket();
      current?.off('review:new', handleReviewEvent);
      current?.off('review:updated', handleReviewEvent);
      current?.off('review:deleted', handleReviewEvent);
      current?.off('creator:rating_updated', handleRatingUpdate);
    };
  }, [creatorId, token, user?.id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewApi.getReviews(creatorId, {
        page: pagination.page,
        limit: pagination.limit,
        sort
      });

      const payload = response?.data?.data || response?.data || {};
      const reviewsData =
        payload.reviews ||
        payload.data?.reviews ||
        payload.items ||
        payload.data ||
        [];
      const statsData = payload.stats || payload.data?.stats || null;
      const paginationData = payload.pagination || payload.data?.pagination || null;

      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setStats(statsData);
      setPagination((prev) => ({
        ...prev,
        total: paginationData?.total ?? (Array.isArray(reviewsData) ? reviewsData.length : 0),
        totalPages:
          paginationData?.totalPages ??
          Math.max(1, Math.ceil((paginationData?.total ?? (Array.isArray(reviewsData) ? reviewsData.length : 0)) / prev.limit))
      }));
    } catch (error: any) {
      console.error('Failed to fetch reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReview = async () => {
    try {
      const response = await reviewApi.getMyReview(creatorId);
      const payload = response?.data?.data || response?.data || {};
      const review = payload.review || payload.data || payload;
      setMyReview(review || null);
      form.setFieldsValue({
        rating: review?.rating ?? 5,
        review: review?.review ?? ''
      });
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error('Failed to fetch your review:', error);
      }
      setMyReview(null);
      form.setFieldsValue({ rating: 5, review: '' });
    }
  };

  const handleSubmitReview = async (values: { rating: number; review?: string }) => {
    try {
      setSubmitting(true);
      if (myReview) {
        await reviewApi.updateMyReview(creatorId, values);
        antMessage.success('Review updated');
      } else {
        await reviewApi.create(creatorId, values);
        antMessage.success('Review submitted');
      }
      await fetchReviews();
      await fetchMyReview();
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      antMessage.error(error?.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    try {
      await reviewApi.deleteMyReview(creatorId);
      antMessage.success('Review deleted');
      setMyReview(null);
      form.setFieldsValue({ rating: 5, review: '' });
      await fetchReviews();
    } catch (error: any) {
      console.error('Failed to delete review:', error);
      antMessage.error(error?.response?.data?.error || 'Failed to delete review');
    }
  };

  const breakdown = displayStats.breakdown || {};

  return (
    <div>
      <CustomCard depth={1} style={{ marginBottom: spacing[6] }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
          <h3 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, margin: 0 }}>
            Reviews Summary
          </h3>
          <Select
            value={sort}
            onChange={(value: ReviewSort) => {
              setSort(value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            options={[
              { label: 'Newest', value: 'newest' },
              { label: 'Oldest', value: 'oldest' },
              { label: 'Highest Rated', value: 'highest' },
              { label: 'Lowest Rated', value: 'lowest' }
            ]}
            style={{ minWidth: 140 }}
          />
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: typography.fontSize['4xl'], fontWeight: typography.fontWeight.bold, color: colors.warning.solid }}>
                {displayStats.averageRating ? Number(displayStats.averageRating).toFixed(1) : '0.0'}
              </div>
              <Rate allowHalf disabled value={displayStats.averageRating || 0} />
              <div style={{ marginTop: spacing[2], color: colors.gray[600] }}>
                {displayStats.totalReviews || 0} review{(displayStats.totalReviews || 0) === 1 ? '' : 's'}
              </div>
            </div>
          </Col>
          <Col xs={24} md={16}>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = Number((breakdown as any)[stars] ?? (breakdown as any)[String(stars)] ?? 0);
              const percent = displayStats.totalReviews
                ? Math.round((count / displayStats.totalReviews) * 100)
                : 0;
              return (
                <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[2] }}>
                  <span style={{ width: 34, fontWeight: 600, color: colors.gray[700] }}>{stars}★</span>
                  <Progress percent={percent} showInfo={false} strokeColor={colors.warning.solid} />
                  <span style={{ width: 32, textAlign: 'right', color: colors.gray[600] }}>{count}</span>
                </div>
              );
            })}
          </Col>
        </Row>
      </CustomCard>

      <CustomCard depth={1} style={{ marginBottom: spacing[6] }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
          <h3 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, margin: 0 }}>
            {myReview ? 'Your Review' : 'Leave a Review'}
          </h3>
          {myReview && (
            <Popconfirm
              title="Delete your review?"
              description="This will remove your rating and feedback."
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={handleDeleteReview}
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          )}
        </div>

        {isAuthenticated ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitReview}
            initialValues={{ rating: 5, review: '' }}
          >
            <Form.Item
              name="rating"
              label="Rating"
              rules={[{ required: true, message: 'Please select a rating' }]}
            >
              <Rate allowClear={false} />
            </Form.Item>
            <Form.Item name="review" label="Feedback (optional)">
              <Input.TextArea
                rows={4}
                placeholder={`Share your experience with ${creatorName || 'this creator'}...`}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {myReview ? 'Update Review' : 'Submit Review'}
            </Button>
          </Form>
        ) : (
          <EmptyState
            type="no-data"
            title="Log in to leave a review"
            description="Your feedback helps creators improve and helps others find the right match."
          />
        )}
      </CustomCard>

      <CustomCard depth={1}>
        <h3 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[4] }}>
          All Reviews
        </h3>
        {loading ? (
          <div style={{ padding: spacing[8], textAlign: 'center' }}>
            <Spin />
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState type="no-data" title="No reviews yet" description="Be the first to leave a review!" />
        ) : (
          <div>
            {reviews.map((review) => {
              const isMine = review.userId === user?.id;
              return (
                <div
                  key={review.id}
                  style={{
                    padding: `${spacing[4]}px 0`,
                    borderBottom: `1px solid ${colors.gray[200]}`
                  }}
                >
                  <div style={{ display: 'flex', gap: spacing[3] }}>
                    <Avatar
                      src={review.user?.avatar ? getImageUrl(review.user.avatar) : undefined}
                      style={{ backgroundColor: colors.primary.solid }}
                    >
                      {review.user?.name?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600 }}>
                          {isMine ? 'You' : review.user?.name || 'Anonymous'}
                        </div>
                        <div style={{ fontSize: typography.fontSize.xs, color: colors.gray[500] }}>
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                        </div>
                      </div>
                      <Rate allowHalf disabled value={review.rating || 0} style={{ fontSize: 16 }} />
                      <div style={{ marginTop: spacing[2], color: colors.gray[700] }}>
                        {review.review && review.review.trim().length > 0 ? review.review : 'No written feedback.'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination.total > pagination.limit && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: spacing[4] }}>
            <Pagination
              current={pagination.page}
              pageSize={pagination.limit}
              total={pagination.total}
              onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              showSizeChanger={false}
            />
          </div>
        )}
      </CustomCard>
    </div>
  );
};

export default CreatorReviews;
