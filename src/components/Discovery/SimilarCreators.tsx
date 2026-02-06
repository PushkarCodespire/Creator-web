// ===========================================
// SIMILAR CREATORS COMPONENT
// ===========================================

import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Tag, Skeleton, Empty } from 'antd';
import { UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { recommendationApi } from '../../services/api';
import { colors, spacing } from '../../styles/tokens';

interface SimilarCreatorsProps {
  creatorId: string;
  currentCreatorName?: string;
  limit?: number;
  layout?: 'grid' | 'list';
}

export const SimilarCreators: React.FC<SimilarCreatorsProps> = ({
  creatorId,
  currentCreatorName,
  limit = 4,
  layout = 'grid',
}) => {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimilarCreators();
  }, [creatorId, limit]);

  const fetchSimilarCreators = async () => {
    try {
      setLoading(true);
      const response = await recommendationApi.getSimilarCreators(creatorId, limit);
      setCreators(response.data.data.similar || []);
    } catch (error) {
      console.error('Failed to fetch similar creators:', error);
      setCreators([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card title="Similar Creators">
        <Row gutter={[16, 16]}>
          {[...Array(limit)].map((_, index) => (
            <Col key={index} xs={24} sm={layout === 'grid' ? 12 : 24}>
              <Skeleton active avatar paragraph={{ rows: 2 }} />
            </Col>
          ))}
        </Row>
      </Card>
    );
  }

  if (creators.length === 0) {
    return (
      <Card title="Similar Creators">
        <Empty description="No similar creators found" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <UserOutlined style={{ color: colors.primary.solid, fontSize: '20px' }} />
          <span>
            Similar to {currentCreatorName || 'this creator'}
          </span>
        </div>
      }
    >
      <Row gutter={[16, 16]}>
        {creators.map((creator, index) => (
          <Col key={creator.id} xs={24} sm={layout === 'grid' ? 12 : 24}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <Card
                hoverable
                onClick={() => window.location.href = `/creator/${creator.id}`}
                style={{
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                bodyStyle={{ padding: spacing[3] }}
              >
                <div style={{ display: 'flex', gap: spacing[3], alignItems: 'center' }}>
                  {/* Avatar */}
                  <div style={{ position: 'relative' }}>
                    <img
                      src={creator.profileImage || '/default-avatar.png'}
                      alt={creator.displayName}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        objectFit: 'cover',
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
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        marginBottom: spacing[1],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {creator.displayName}
                    </h4>

                    <Tag color="blue" style={{ marginBottom: spacing[1] }}>
                      {creator.category}
                    </Tag>

                    <div
                      style={{
                        fontSize: '12px',
                        color: colors.gray[500],
                        display: 'flex',
                        gap: spacing[3],
                      }}
                    >
                      <span>👥 {creator.followersCount || 0} followers</span>
                      {creator._similarityScore && (
                        <span style={{ color: colors.success.solid }}>
                          {Math.round(creator._similarityScore)}% match
                        </span>
                      )}
                    </div>

                    {layout === 'list' && creator.bio && (
                      <p
                        style={{
                          fontSize: '13px',
                          color: colors.gray[600],
                          marginTop: spacing[2],
                          marginBottom: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {creator.bio}
                      </p>
                    )}
                  </div>

                  {/* Arrow Icon */}
                  <ArrowRightOutlined style={{ color: colors.gray[400], fontSize: '16px' }} />
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* View All Button */}
      {creators.length >= limit && (
        <div style={{ textAlign: 'center', marginTop: spacing[4] }}>
          <Button
            type="link"
            onClick={() => window.location.href = `/discover?similar=${creatorId}`}
          >
            View all similar creators <ArrowRightOutlined />
          </Button>
        </div>
      )}
    </Card>
  );
};

export default SimilarCreators;
