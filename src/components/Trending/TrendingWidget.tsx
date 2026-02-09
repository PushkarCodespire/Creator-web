// ===========================================
// TRENDING WIDGET COMPONENT
// ===========================================

import { useState, useEffect } from 'react';
import { Card, Segmented, Skeleton, Empty } from 'antd';
import { FireOutlined, TrophyOutlined, RiseOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { trendingApi } from '../../services/api';
import { colors, spacing } from '../../styles/tokens';

interface TrendingWidgetProps {
  type: 'posts' | 'creators';
  limit?: number;
  showTimeWindowSelector?: boolean;
  category?: string;
}

type TimeWindow = 1 | 24 | 168 | 720;

const timeWindowOptions = [
  { label: 'Hourly', value: 1, icon: <RiseOutlined /> },
  { label: 'Daily', value: 24, icon: <FireOutlined /> },
  { label: 'Weekly', value: 168, icon: <TrophyOutlined /> },
];

export const TrendingWidget: React.FC<TrendingWidgetProps> = ({
  type,
  limit = 10,
  showTimeWindowSelector = true,
  category,
}) => {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(24);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingData();
  }, [timeWindow, type, category]);

  const fetchTrendingData = async () => {
    try {
      setLoading(true);
      const params = { timeWindow, limit, category };

      let response;
      if (type === 'posts') {
        response = await trendingApi.getTrendingPosts(params);
      } else {
        response = await trendingApi.getTrendingCreators(params);
      }

      const items = response.data.data[type] || [];
      setData(items);
    } catch (error) {
      console.error('Failed to fetch trending data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeWindowLabel = () => {
    const option = timeWindowOptions.find(opt => opt.value === timeWindow);
    return option?.label || 'Daily';
  };

  return (
    <Card
      bordered={false}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <FireOutlined style={{ color: '#F59E0B', fontSize: '20px' }} />
          <span style={{ color: '#1E293B', fontWeight: 700 }}>Trending {type === 'posts' ? 'Posts' : 'Creators'}</span>
          {!showTimeWindowSelector && (
            <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#64748B' }}>
              ({getTimeWindowLabel()})
            </span>
          )}
        </div>
      }
      extra={
        showTimeWindowSelector && (
          <Segmented
            size="small"
            options={timeWindowOptions.map(opt => ({
              label: opt.label,
              value: opt.value,
            }))}
            value={timeWindow}
            onChange={(value) => setTimeWindow(value as TimeWindow)}
            className="trending-segmented"
          />
        )
      }
      style={{
        height: '100%',
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        borderRadius: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}
      headStyle={{ borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : data.length === 0 ? (
        <Empty description={<span style={{ color: '#64748B' }}>No trending content found</span>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {data.map((item, index) => (
            <TrendingItem
              key={item.id}
              item={item}
              type={type}
              rank={index + 1}
            />
          ))}
        </div>
      )}
      <style>{`
        .trending-segmented.ant-segmented {
          background-color: rgba(226, 232, 240, 0.5);
        }
        .trending-segmented .ant-segmented-item-selected {
          background-color: #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
      `}</style>
    </Card>
  );
};

interface TrendingItemProps {
  item: any;
  type: 'posts' | 'creators';
  rank: number;
}

const TrendingItem: React.FC<TrendingItemProps> = ({ item, type, rank }) => {
  const getRankColor = (rank: number) => {
    if (rank === 1) return '#F59E0B';
    if (rank === 2) return '#94A3B8';
    if (rank === 3) return '#D97706'; // Bronze
    return '#CBD5E1';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <TrophyOutlined style={{ color: getRankColor(rank) }} />;
    return <span style={{ color: '#64748B' }}>#{rank}</span>;
  };

  if (type === 'posts') {
    return (
      <motion.div
        whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
        style={{
          display: 'flex',
          gap: spacing[3],
          padding: spacing[3],
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '12px',
          cursor: 'pointer',
          border: '1px solid rgba(226, 232, 240, 0.6)',
          transition: 'all 0.2s'
        }}
        onClick={() => window.location.href = `/posts/${item.id}`}
      >
        <div style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '30px' }}>
          {getRankIcon(rank)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
            <img
              src={item.creator?.profileImage || '/default-avatar.png'}
              alt={item.creator?.displayName}
              style={{ width: '24px', height: '24px', borderRadius: '50%' }}
            />
            <span style={{ fontWeight: 600, fontSize: '14px', color: '#1E293B' }}>
              {item.creator?.displayName}
            </span>
            {item.creator?.isVerified && (
              <span style={{ color: '#6366F1' }}>✓</span>
            )}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#475569',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {item.content}
          </div>
          <div style={{
            display: 'flex',
            gap: spacing[4],
            marginTop: spacing[2],
            fontSize: '12px',
            color: '#64748B',
          }}>
            <span>❤️ {item.likesCount || 0}</span>
            <span>💬 {item.commentsCount || 0}</span>
            {item._trendingScore && (
              <span style={{ color: '#F59E0B' }}>
                🔥 {Number(item._trendingScore).toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Creators
  return (
    <motion.div
      whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
      style={{
        display: 'flex',
        gap: spacing[3],
        padding: spacing[3],
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '12px',
        cursor: 'pointer',
        border: '1px solid rgba(226, 232, 240, 0.6)',
        transition: 'all 0.2s'
      }}
      onClick={() => window.location.href = `/creator/${item.id}`}
    >
      <div style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '30px' }}>
        {getRankIcon(rank)}
      </div>
      <img
        src={item.profileImage || '/default-avatar.png'}
        alt={item.displayName}
        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <span style={{ fontWeight: 700, fontSize: '16px', color: '#1E293B' }}>
            {item.displayName}
          </span>
          {item.isVerified && (
            <span style={{ color: '#6366F1' }}>✓</span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: '#64748B', marginBottom: spacing[1] }}>
          {item.category}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#475569',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {item.bio}
        </div>
        <div style={{
          display: 'flex',
          gap: spacing[4],
          marginTop: spacing[2],
          fontSize: '12px',
          color: '#64748B',
        }}>
          <span>👥 {item.followersCount || 0} followers</span>
          {item._trendingScore && (
            <span style={{ color: '#F59E0B' }}>
              🔥 {Number(item._trendingScore).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TrendingWidget;
