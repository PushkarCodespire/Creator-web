// ===========================================
// USER ANALYTICS COMPONENT
// Chat history, learning progress, engagement
// ===========================================

import { useState, useEffect } from 'react';
import { Row, Col, Statistic, Select, Spin } from 'antd';
import { MessageOutlined, ClockCircleOutlined, BookOutlined, RiseOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CustomCard from '../common/Card/CustomCard';
import { colors, spacing, typography } from '../../styles/tokens';
import { analyticsApi } from '../../services/api';
import { logger } from '../../utils/logger';



interface UserAnalyticsProps {
  userId?: string;
}

export const UserAnalytics: React.FC<UserAnalyticsProps> = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [learningProgress, setLearningProgress] = useState<any[]>([]);
  const [engagementStats, setEngagementStats] = useState({
    totalMessages: 0,
    totalChats: 0,
    avgResponseTime: 0,
    activeDays: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getUserAnalytics(timeRange);
      const data = response.data.data || {};

      const history = Array.isArray(data.chatHistory)
        ? data.chatHistory
        : Array.isArray(data.chatActivity)
          ? data.chatActivity
          : data.chatsByDate
            ? Object.entries(data.chatsByDate).map(([date, messages]) => ({
              date,
              messages: Number(messages) || 0
            }))
            : [];
      setChatHistory(history);

      const progress = Array.isArray(data.learningProgress)
        ? data.learningProgress
        : Array.isArray(data.topicProgress)
          ? data.topicProgress
          : [];
      setLearningProgress(progress);

      const stats = data.engagementStats || data.overview || data.stats || {};
      setEngagementStats({
        totalMessages: stats.totalMessages ?? stats.messages ?? 0,
        totalChats: stats.totalChats ?? stats.chats ?? 0,
        avgResponseTime: stats.avgResponseTime ?? stats.responseTime ?? 0,
        activeDays: stats.activeDays ?? stats.daysActive ?? 0,
      });
    } catch (error) {
      logger.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [colors.primary.solid, colors.success.solid, colors.warning.solid, colors.error.solid];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[6] }}>
        <h2 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }}>
          Your Analytics
        </h2>
        <Select value={timeRange} onChange={setTimeRange} style={{ width: 150 }}>
          <Select.Option value="7d">Last 7 days</Select.Option>
          <Select.Option value="30d">Last 30 days</Select.Option>
          <Select.Option value="90d">Last 90 days</Select.Option>
          <Select.Option value="all">All time</Select.Option>
        </Select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: spacing[8] }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <Row gutter={[16, 16]} style={{ marginBottom: spacing[6] }}>
            <Col xs={24} sm={12} lg={6}>
              <CustomCard depth={1}>
                <Statistic
                  title="Total Messages"
                  value={engagementStats.totalMessages}
                  prefix={<MessageOutlined />}
                  valueStyle={{ color: colors.primary.solid }}
                />
              </CustomCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <CustomCard depth={1}>
                <Statistic
                  title="Active Chats"
                  value={engagementStats.totalChats}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: colors.success.solid }}
                />
              </CustomCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <CustomCard depth={1}>
                <Statistic
                  title="Avg Response Time"
                  value={engagementStats.avgResponseTime}
                  suffix="s"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: colors.warning.solid }}
                />
              </CustomCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <CustomCard depth={1}>
                <Statistic
                  title="Active Days"
                  value={engagementStats.activeDays}
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: colors.error.solid }}
                />
              </CustomCard>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <CustomCard depth={1} title="Chat Activity Over Time">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chatHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="messages" stroke={colors.primary.solid} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CustomCard>
            </Col>
            <Col xs={24} lg={8}>
              <CustomCard depth={1} title="Learning Progress by Topic">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={learningProgress}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      label={({ topic, progress }: any) => `${topic}: ${progress}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="progress"
                    >
                      {learningProgress.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CustomCard>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default UserAnalytics;



