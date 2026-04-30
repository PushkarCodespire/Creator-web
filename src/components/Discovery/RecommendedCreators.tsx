// ===========================================
// RECOMMENDED CREATORS COMPONENT
// ===========================================

import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Tag, Skeleton, Empty, message as antMessage } from 'antd';
import { UserAddOutlined, CheckOutlined, StarOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { recommendationApi, followApi } from '../../services/api';
import { colors, spacing } from '../../styles/tokens';
import { logger } from '../../utils/logger';

interface RecommendedCreatorsProps {
  title?: string;
  limit?: number;
  method?: 'hybrid' | 'content' | 'collaborative';
  showReasons?: boolean;
}

export const RecommendedCreators: React.FC<RecommendedCreatorsProps> = ({
  title = 'Creators You Might Like',
  limit = 6,
  method = 'hybrid',
  showReasons = true,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    fetchRecommendations();
  }, [method, limit]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);

      // Use "For You" endpoint if not authenticated or use creator recommendations if authenticated
      let response;
      if (!user) {
        response = await recommendationApi.getForYou(limit);
      } else {
        response = await recommendationApi.getCreatorRecommendations({ limit, method });
      }

      const recs = response.data.data.recommendations || [];
      setCreators(recs);

      // Initialize following map
      const initialMap = new Map<string, boolean>();
      recs.forEach((creator: { id: string; creatorId?: string; reason?: string }) => {
        initialMap.set(creator.id, false);
      });
      setFollowingMap(initialMap);
    } catch (error) {
      logger.error('Failed to fetch recommendations:', error);
      setCreators([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (creatorId: string) => {
    if (!user) {
      antMessage.info('Please login to follow creators');
      return;
    }

    try {
      const isFollowing = followingMap.get(creatorId);

      if (isFollowing) {
        await followApi.unfollowCreator(creatorId);
        setFollowingMap(new Map(followingMap.set(creatorId, false)));
        antMessage.success('Unfollowed creator');
      } else {
        await followApi.followCreator(creatorId);
        setFollowingMap(new Map(followingMap.set(creatorId, true)));
        antMessage.success('Following creator');
      }
    } catch (error: unknown) {
      logger.error('Failed to toggle follow:', error);
      const err = error as { response?: { data?: { error?: string } } };
      antMessage.error(err.response?.data?.error || 'Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <Card title={title}>
        <Row gutter={[16, 16]}>
          {[...Array(limit)].map((_, index) => (
            <Col key={index} xs={24} sm={12} md={8}>
              <Skeleton active avatar paragraph={{ rows: 3 }} />
            </Col>
          ))}
        </Row>
      </Card>
    );
  }

  if (creators.length === 0) {
    return (
      <Card title={title}>
        <Empty description="No recommendations available" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <StarOutlined style={{ color: colors.warning.solid, fontSize: '20px' }} />
          <span>{title}</span>
        </div>
      }
    >
      <Row gutter={[16, 16]}>
        {creators.map((creator, index) => (
          <Col key={creator.id} xs={24} sm={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
            >
              <Card
                hoverable
                style={{
                  height: '100%',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
                bodyStyle={{ textAlign: 'center', padding: spacing[4] }}
              >
                {/* Creator Avatar */}
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto',
                    marginBottom: spacing[3],
                    position: 'relative',
                  }}
                >
                  <img
                    src={creator.profileImage || '/default-avatar.png'}
                    alt={creator.displayName}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `3px solid ${colors.primary.solid}`,
                    }}
                  />
                  {creator.isVerified && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        background: colors.primary.solid,
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>

                {/* Creator Info */}
                <h4
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    marginBottom: spacing[1],
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {creator.displayName}
                </h4>

                <Tag color="blue" style={{ marginBottom: spacing[2] }}>
                  {creator.category}
                </Tag>

                <p
                  style={{
                    fontSize: '14px',
                    color: colors.gray[600],
                    marginBottom: spacing[3],
                    height: '40px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {creator.bio}
                </p>

                {/* Stats */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: spacing[4],
                    marginBottom: spacing[3],
                    fontSize: '12px',
                    color: colors.gray[500],
                  }}
                >
                  <span>👥 {creator.followersCount || 0}</span>
                  <span>📝 {creator.postsCount || 0}</span>
                </div>

                {/* Recommendation Reasons */}
                {showReasons && creator._reasons && creator._reasons.length > 0 && (
                  <div
                    style={{
                      marginBottom: spacing[3],
                      padding: spacing[2],
                      background: colors.gray[50],
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: colors.gray[600],
                    }}
                  >
                    <div style={{ fontWeight: 500, marginBottom: spacing[1] }}>
                      Why recommended:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: spacing[4], textAlign: 'left' }}>
                      {creator._reasons.slice(0, 2).map((reason: string, idx: number) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: spacing[2] }}>
                  <Button
                    type="primary"
                    icon={followingMap.get(creator.id) ? <CheckOutlined /> : <UserAddOutlined />}
                    onClick={() => handleFollow(creator.id)}
                    style={{ flex: 1 }}
                  >
                    {followingMap.get(creator.id) ? 'Following' : 'Follow'}
                  </Button>
                  <Button
                    onClick={() => window.location.href = `/creator/${creator.id}`}
                    style={{ flex: 1 }}
                  >
                    View Profile
                  </Button>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default RecommendedCreators;
