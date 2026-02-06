// ===========================================
// TRENDING PAGE
// ===========================================

import { useState, useEffect } from 'react';
import { Tabs, Row, Col, Card, Statistic, Spin } from 'antd';
import { FireOutlined, RiseOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import TrendingWidget from '../components/Trending/TrendingWidget';
import { trendingApi } from '../services/api';
import { colors, spacing } from '../styles/tokens';

const { TabPane } = Tabs;

export const TrendingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchTrendingStats();
  }, []);

  const fetchTrendingStats = async () => {
    try {
      setLoadingStats(true);
      const response = await trendingApi.getTrendingStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch trending stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div style={{ padding: spacing[6], maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: spacing[6] }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
          <FireOutlined style={{ fontSize: '32px', color: '#EA580C' }} />
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em' }}>
            Trending Now
          </h1>
        </div>
        <p style={{ fontSize: '16px', color: '#64748B', marginBottom: spacing[6] }}>
          Discover what's hot on the platform right now
        </p>

        {/* Stats Cards */}
        {loadingStats ? (
          <div style={{ textAlign: 'center', padding: spacing[8] }}>
            <Spin size="large" />
          </div>
        ) : stats && (
          <Row gutter={16} style={{ marginBottom: spacing[6] }}>
            <Col xs={24} sm={12} md={6}>
              <motion.div whileHover={{ y: -4 }}>
                <Card bordered={false} style={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(226, 232, 240, 0.8)'
                }}>
                  <Statistic
                    title={<span style={{ color: '#64748B', fontWeight: 600 }}>Posts Today</span>}
                    value={stats.daily?.posts || 0}
                    prefix={<FileTextOutlined style={{ color: '#6366F1' }} />}
                    valueStyle={{ color: '#1E293B', fontWeight: 800 }}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <motion.div whileHover={{ y: -4 }}>
                <Card bordered={false} style={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(226, 232, 240, 0.8)'
                }}>
                  <Statistic
                    title={<span style={{ color: '#64748B', fontWeight: 600 }}>Posts This Week</span>}
                    value={stats.weekly?.posts || 0}
                    prefix={<FileTextOutlined style={{ color: '#10B981' }} />}
                    valueStyle={{ color: '#1E293B', fontWeight: 800 }}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <motion.div whileHover={{ y: -4 }}>
                <Card bordered={false} style={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(226, 232, 240, 0.8)'
                }}>
                  <Statistic
                    title={<span style={{ color: '#64748B', fontWeight: 600 }}>New Creators Today</span>}
                    value={stats.daily?.newCreators || 0}
                    prefix={<UserOutlined style={{ color: '#F59E0B' }} />}
                    valueStyle={{ color: '#1E293B', fontWeight: 800 }}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <motion.div whileHover={{ y: -4 }}>
                <Card bordered={false} style={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(226, 232, 240, 0.8)'
                }}>
                  <Statistic
                    title={<span style={{ color: '#64748B', fontWeight: 600 }}>New Creators Week</span>}
                    value={stats.weekly?.newCreators || 0}
                    prefix={<UserOutlined style={{ color: '#EF4444' }} />}
                    valueStyle={{ color: '#1E293B', fontWeight: 800 }}
                  />
                </Card>
              </motion.div>
            </Col>
          </Row>
        )}
      </motion.div>

      {/* Trending Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card bordered={false} style={{
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            items={[
              {
                key: 'posts',
                label: (
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>
                    <FileTextOutlined /> Trending Posts
                  </span>
                ),
                children: (
                  <TrendingWidget
                    type="posts"
                    limit={20}
                    showTimeWindowSelector={true}
                  />
                ),
              },
              {
                key: 'creators',
                label: (
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>
                    <UserOutlined /> Trending Creators
                  </span>
                ),
                children: (
                  <TrendingWidget
                    type="creators"
                    limit={20}
                    showTimeWindowSelector={true}
                  />
                ),
              },
            ]}
          />
        </Card>
      </motion.div>

      {/* Category Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ marginTop: spacing[6] }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: spacing[4], color: '#1E293B' }}>
          Trending by Category
        </h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <TrendingWidget
              type="posts"
              category="Fitness"
              limit={5}
              showTimeWindowSelector={false}
            />
          </Col>
          <Col xs={24} md={12}>
            <TrendingWidget
              type="posts"
              category="Tech"
              limit={5}
              showTimeWindowSelector={false}
            />
          </Col>
          <Col xs={24} md={12}>
            <TrendingWidget
              type="posts"
              category="Business"
              limit={5}
              showTimeWindowSelector={false}
            />
          </Col>
          <Col xs={24} md={12}>
            <TrendingWidget
              type="posts"
              category="Lifestyle"
              limit={5}
              showTimeWindowSelector={false}
            />
          </Col>
        </Row>
      </motion.div>
    </div>
  );
};

export default TrendingPage;
