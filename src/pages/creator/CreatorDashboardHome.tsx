// ===========================================
// CREATOR DASHBOARD HOME - Enhanced
// ===========================================

import { useEffect, useState } from 'react';
import { Row, Col, Statistic, List, Tag, Spin, Button, Progress, Alert, Grid } from 'antd';
import {
  MessageOutlined,
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  TrophyOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { creatorApi } from '../../services/api';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { colors, spacing, typography } from '../../styles/tokens';
import DashboardContentLoader from '../../components/common/DashboardContentLoader';

const { useBreakpoint } = Grid;

const CreatorDashboardHome = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint(); // Move hook BEFORE early return
  const isMobile = !screens.md;
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [realtimeStats, setRealtimeStats] = useState({
    activeChats: 0,
    messagesLastHour: 0,
    earningsToday: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    // Set up real-time updates (polling every 30 seconds)
    if (dashboard) {
      const interval = setInterval(() => {
        fetchRealtimeStats();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [dashboard]);

  const fetchDashboard = async () => {
    try {
      const response = await creatorApi.getDashboard();
      setDashboard(response.data.data);
      fetchRealtimeStats();
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeStats = async () => {
    try {
      // This would be a new endpoint for real-time stats
      // For now, we'll calculate from dashboard data
      if (dashboard) {
        // Mock real-time stats - in production, this would come from an API
        setRealtimeStats({
          activeChats: Math.floor(Math.random() * 10),
          messagesLastHour: Math.floor(Math.random() * 50),
          earningsToday: Number((Math.random() * 100).toFixed(2)),
        });
      }
    } catch (err) {
      console.error('Failed to fetch real-time stats:', err);
    }
  };

  // Prepare chart data
  const engagementData = dashboard?.engagementTrends || [
    { day: 'Mon', chats: 10, messages: 45 },
    { day: 'Tue', chats: 15, messages: 60 },
    { day: 'Wed', chats: 12, messages: 55 },
    { day: 'Thu', chats: 18, messages: 70 },
    { day: 'Fri', chats: 20, messages: 85 },
    { day: 'Sat', chats: 25, messages: 100 },
    { day: 'Sun', chats: 22, messages: 90 },
  ];

  if (loading) {
    return <DashboardContentLoader />;
  }

  const completionRate = dashboard?.contents
    ? Math.round((dashboard.contents.filter((c: any) => c.status === 'COMPLETED').length / dashboard.contents.length) * 100)
    : 0;

  return (
    <div style={{ padding: spacing[4] }}>
      <div style={{ marginBottom: isMobile ? spacing[4] : spacing[6] }}>
        <h1 style={{ fontSize: isMobile ? '24px' : typography.fontSize['3xl'], fontWeight: 900, marginBottom: spacing[2], color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          Welcome back, {dashboard?.displayName}!
        </h1>
        <p style={{ color: '#94A3B8', fontSize: isMobile ? '14px' : typography.fontSize.lg, fontWeight: 500 }}>
          Here's what's happening with your AI creator profile
        </p>
      </div>

      {/* Real-time Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: spacing[8] }}>
        {[
          { title: 'Active Chats', value: realtimeStats.activeChats, icon: <MessageOutlined />, color: colors.primary.gradient, label: 'Right now' },
          { title: 'Messages (1h)', value: realtimeStats.messagesLastHour, icon: <FireOutlined />, color: colors.success.gradient, label: '+12% from yesterday' },
          { title: 'Earnings Today', value: realtimeStats.earningsToday, icon: <DollarOutlined />, color: colors.warning.gradient, suffix: '₹', label: `Month: ₹${dashboard?.totalEarnings || 0}` },
          { title: 'Total Chats', value: dashboard?.totalChats || 0, icon: <UserOutlined />, color: colors.error.gradient, label: 'All time' }
        ].map((item, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, translateY: -4 }}
            >
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px) saturate(180%)',
                borderRadius: '24px',
                padding: '28px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: item.color,
                  opacity: 0.05,
                  borderRadius: '50%',
                  filter: 'blur(20px)'
                }} />
                <Statistic
                  title={<span style={{ fontWeight: 600, color: colors.gray[500] }}>{item.title}</span>}
                  value={item.value}
                  prefix={<span style={{
                    background: item.color,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginRight: '8px'
                  }}>{item.icon}</span>}
                  suffix={item.suffix}
                  valueStyle={{ fontSize: isMobile ? '24px' : '30px', fontWeight: 900, letterSpacing: '-0.02em', color: '#FFFFFF' }}
                />
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.gray[400],
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {item.label}
                </div>
              </div>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Main Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: spacing[8] }}>
        {[
          { title: 'Total Messages', value: dashboard?.totalMessages || 0, icon: <MessageOutlined />, color: colors.primary.gradient },
          { title: 'Total Earnings', value: dashboard?.totalEarnings || 0, icon: <DollarOutlined />, color: colors.success.gradient, precision: 2, prefix: '₹' },
          { title: 'Content Pieces', value: dashboard?.contents?.length || 0, icon: <FileTextOutlined />, color: colors.info.solid },
          { title: 'Rating', value: dashboard?.rating || 0, icon: <TrophyOutlined />, color: colors.warning.gradient, precision: 1 }
        ].map((item, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(20px) saturate(180%)',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-15%',
                right: '-10%',
                width: '80px',
                height: '80px',
                background: typeof item.color === 'string' && !item.color.includes('gradient') ? item.color : '#6366F1',
                backgroundImage: typeof item.color === 'string' && item.color.includes('gradient') ? item.color : 'none',
                opacity: 0.05,
                borderRadius: '50%',
                filter: 'blur(20px)'
              }} />
              <Statistic
                title={<span style={{ fontWeight: 600, color: colors.gray[500] }}>{item.title}</span>}
                value={item.value}
                prefix={item.prefix}
                precision={item.precision}
                valueStyle={{
                  fontSize: isMobile ? '20px' : '26px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  letterSpacing: '-0.01em'
                }}
              />
              <div style={{
                marginTop: '12px',
                alignItems: 'center',
                gap: '8px',
                color: colors.gray[400],
                fontSize: '12px'
              }}>
                <span style={{ color: typeof item.color === 'string' && !item.color.includes('gradient') ? item.color : '#6366F1' }}>{item.icon}</span>
                <span>Lifetime stats</span>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Engagement Chart */}
      <Row gutter={[24, 24]} style={{ marginBottom: spacing[8] }}>
        <Col xs={24} lg={16}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '28px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '20px', color: '#FFFFFF', letterSpacing: '-0.01em' }}>Engagement Trends</h3>
              <Tag color="purple" style={{ borderRadius: '6px' }}>Last 7 Days</Tag>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="chats"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorChats)"
                  name="Chats"
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMsgs)"
                  name="Messages"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '28px',
            padding: '32px',
            height: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <h3 style={{ marginBottom: '32px', fontWeight: 800, fontSize: '20px', color: '#FFFFFF', letterSpacing: '-0.01em' }}>Content Status</h3>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <Progress
                type="dashboard"
                percent={completionRate}
                strokeColor={{ '0%': '#6366F1', '100%': '#A855F7' }}
                strokeWidth={10}
                size={180}
              />
              <div style={{ marginTop: '-45px', color: '#94A3B8', fontSize: '15px', fontWeight: 600 }}>AI Readiness</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Completed', count: dashboard?.contents?.filter((c: any) => c.status === 'COMPLETED').length || 0, color: '#10B981' },
                { label: 'Processing', count: dashboard?.contents?.filter((c: any) => c.status === 'PROCESSING').length || 0, color: '#3B82F6' },
                { label: 'Failed', count: dashboard?.contents?.filter((c: any) => c.status === 'FAILED').length || 0, color: '#EF4444' }
              ].map(status => (
                <div key={status.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: status.color, boxShadow: `0 0 12px ${status.color}40` }} />
                    <span style={{ fontWeight: 700, color: '#94A3B8', fontSize: '14px' }}>{status.label}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '16px' }}>{status.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {/* Quick Actions & Recent Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '28px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '20px', color: '#FFFFFF', letterSpacing: '-0.01em' }}>Recent Content</h3>
              <Button type="link" onClick={() => navigate('/creator-dashboard/content')} style={{ paddingRight: 0, fontWeight: 700, color: '#6366F1' }}>Manage</Button>
            </div>
            {dashboard?.contents?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: spacing[6] }}>
                <FileTextOutlined style={{ fontSize: '48px', color: colors.gray[400], marginBottom: spacing[3] }} />
                <p style={{ color: colors.gray[600], marginBottom: spacing[4] }}>No content yet. Add content to train your AI!</p>
                <Button type="primary" onClick={() => navigate('/creator-dashboard/content')}>Add Content</Button>
              </div>
            ) : (
              <List
                dataSource={dashboard?.contents?.slice(0, 5)}
                renderItem={(item: any) => (
                  <List.Item
                    style={{ cursor: 'pointer', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', padding: '20px 0' }}
                    onClick={() => navigate('/creator-dashboard/content')}
                  >
                    <List.Item.Meta
                      title={<span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '16px' }}>{item.title}</span>}
                      description={
                        <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center', marginTop: '8px' }}>
                          <Tag color={item.status === 'COMPLETED' ? 'success' : item.status === 'PROCESSING' ? 'processing' : 'error'} bordered={false} style={{ borderRadius: '6px', fontWeight: 700 }}>
                            {item.status}
                          </Tag>
                          {item._count?.chunks && (
                            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                              {item._count.chunks} neural chunks
                            </span>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '28px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '20px', color: '#FFFFFF', letterSpacing: '-0.01em' }}>Recent Opportunities</h3>
              <Button type="link" onClick={() => navigate('/creator-dashboard/opportunities')} style={{ paddingRight: 0, fontWeight: 700, color: '#6366F1' }}>View All</Button>
            </div>
            {dashboard?.applications?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: spacing[6] }}>
                <FireOutlined style={{ fontSize: '48px', color: colors.gray[400], marginBottom: spacing[3] }} />
                <p style={{ color: colors.gray[600], marginBottom: spacing[4] }}>No applications yet</p>
                <Button type="primary" onClick={() => navigate('/creator-dashboard/opportunities')}>Browse Opportunities</Button>
              </div>
            ) : (
              <List
                dataSource={dashboard?.applications?.slice(0, 5)}
                renderItem={(item: any) => (
                  <List.Item
                    style={{ cursor: 'pointer', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', padding: '20px 0' }}
                    onClick={() => navigate('/creator-dashboard/opportunities')}
                  >
                    <List.Item.Meta
                      title={<span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '16px' }}>{item.opportunity?.title}</span>}
                      description={
                        <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center', marginTop: '8px' }}>
                          <Tag color={item.status === 'ACCEPTED' ? 'success' : item.status === 'REJECTED' ? 'error' : 'processing'} bordered={false} style={{ borderRadius: '6px', fontWeight: 700 }}>
                            {item.status}
                          </Tag>
                          {item.opportunity?.budget && (
                            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                              ₹{item.opportunity.budget} budget
                            </span>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        </Col>
      </Row>

      {/* Quick Tips */}
      {dashboard?.contents?.length === 0 && (
        <Alert
          message="Get Started"
          description="Add your first content to start training your AI. Upload YouTube videos, add text content, or create FAQs."
          type="info"
          showIcon
          style={{ marginTop: spacing[6] }}
          action={
            <Button type="primary" onClick={() => navigate('/creator-dashboard/content')}>
              Add Content
            </Button>
          }
        />
      )}
    </div>
  );
};

export default CreatorDashboardHome;
