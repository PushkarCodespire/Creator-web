// ===========================================
// CREATOR ANALYTICS PAGE - Flagship Redesign
// ===========================================

import { useEffect, useState, useMemo } from 'react';
import { Row, Col, Spin, Tag, Grid, Typography, ConfigProvider, theme } from 'antd';
import {
  MessageSquare,
  TrendingUp,
  CircleDollarSign,
  User,
  BarChart,
  Activity,
  LayoutDashboard,
  Grid3X3,
  Filter,
  Users,
  Star,
  Calendar,
  History
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { creatorApi } from '../../services/api';
import { RetentionChart } from '../../components/analytics/RetentionChart';
import { RevenueChart } from '../../components/analytics/RevenueChart';
import { ActivityHeatmapComponent } from '../../components/analytics/ActivityHeatmap';
import { ComparisonChart } from '../../components/analytics/ComparisonChart';
import { ExportButton } from '../../components/analytics/ExportButton';
import CompetitiveAnalysis from '../../components/analytics/CompetitiveAnalysis';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { colors, spacing, typography, shadows } from '../../styles/tokens';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const CreatorAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [engagementTrend, setEngagementTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Advanced analytics states
  const [retentionData, setRetentionData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [activityData, setActivityData] = useState<any>(null);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        overviewRes,
        engagementRes,
        forecastRes,
        activityRes,
        funnelRes,
        comparisonRes,
        retentionRes
      ] = await Promise.all([
        creatorApi.getAnalytics(),
        creatorApi.getEngagementTrend(7),
        creatorApi.getRevenueForecast(),
        creatorApi.getActivityHeatmap(),
        creatorApi.getConversionFunnel(),
        creatorApi.getComparativeAnalytics(30),
        creatorApi.getRetentionAnalytics()
      ]);

      setAnalytics(overviewRes.data.data);
      setEngagementTrend(engagementRes.data.data.trend);
      setForecastData(forecastRes.data.data);
      setActivityData(activityRes.data.data);
      setFunnelData(funnelRes.data.data);
      setComparisonData(comparisonRes.data.data);
      setRetentionData(retentionRes.data.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'engagement', label: 'Engagement', icon: <TrendingUp size={18} /> },
    { id: 'revenue', label: 'Revenue', icon: <CircleDollarSign size={18} /> },
    { id: 'activity', label: 'Heatmap', icon: <Activity size={18} /> },
    { id: 'funnel', label: 'Funnel', icon: <Filter size={18} /> },
    { id: 'comparison', label: 'Comparison', icon: <Grid3X3 size={18} /> },
    { id: 'competitive', label: 'Competitive', icon: <BarChart size={18} /> },
  ];

  const chartData = useMemo(() => {
    return (analytics?.chatsByDate ? Object.entries(analytics.chatsByDate) : [])
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: count as number
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
  }, [analytics]);

  const velocityData = useMemo(() => {
    return engagementTrend.map(item => ({
      day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
      count: item.count
    }));
  }, [engagementTrend]);

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? spacing[3] : spacing[8], minHeight: '100vh', background: '#020617' }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: spacing[8] }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <Title level={isMobile ? 3 : 1} style={{ color: '#FFFFFF', margin: 0, fontWeight: 900, letterSpacing: '-0.04em' }}>
              Creator <span style={{ background: colors.primary.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Analytics</span>
            </Title>
            <Text style={{ color: '#94A3B8', fontSize: '18px', fontWeight: 500 }}>
              Flagship performance tracking for {user?.name}
            </Text>
          </div>
          <ExportButton creatorName={user?.name || 'Creator'} />
        </div>
      </motion.div>

      {/* Flagship Custom Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: spacing[8],
        padding: '6px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '16px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {menuItems.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(item.id)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: activeTab === item.id ? colors.primary.gradient : 'transparent',
              color: activeTab === item.id ? '#FFFFFF' : '#64748B',
              whiteSpace: 'nowrap',
              fontWeight: 700,
              fontSize: '14px',
              boxShadow: activeTab === item.id ? '0 10px 20px rgba(99, 102, 241, 0.3)' : 'none'
            }}
          >
            {item.icon}
            {item.label}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <Row gutter={[24, 24]} style={{ marginBottom: spacing[8] }}>
                {[
                  { title: 'Total Revenue', value: analytics?.overview?.totalEarnings || 0, prefix: '₹', color: '#F59E0B', icon: <CircleDollarSign size={20} /> },
                  { title: 'Active Chats', value: analytics?.overview?.totalChats || 0, color: '#6366F1', icon: <MessageSquare size={20} /> },
                  { title: 'Avg Messages', value: analytics?.avgMessagesPerConversation || 0, color: '#10B981', icon: <Users size={20} /> },
                  { title: '30D Conv.', value: analytics?.totalConversationsLast30Days || 0, color: '#EC4899', icon: <Calendar size={20} /> }
                ].map((stat, i) => (
                  <Col xs={12} lg={6} key={i}>
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.4)',
                      backdropFilter: 'blur(30px) saturate(200%)',
                      padding: '32px',
                      borderRadius: '32px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{ position: 'absolute', top: -10, right: -10, width: 80, height: 80, background: stat.color, filter: 'blur(50px)', opacity: 0.15 }} />
                      <div style={{ color: '#94A3B8', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: stat.color }}>{stat.icon}</span> {stat.title}
                      </div>
                      <div style={{ fontSize: '36px', fontWeight: 900, color: '#F8FAFC', letterSpacing: '-0.03em' }}>
                        {stat.prefix}{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>

              {/* Main Chart Card */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(30px)',
                padding: isMobile ? '24px' : '48px',
                borderRadius: '40px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}>
                <div style={{ marginBottom: '40px' }}>
                  <Title level={4} style={{ color: '#FFFFFF', margin: 0 }}>Conversations Over Time</Title>
                  <Text style={{ color: '#64748B' }}>Growth trajectory for the last 30 days</Text>
                </div>
                <ResponsiveContainer width="100%" height={380}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="flagshipGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} />
                    <Tooltip
                      contentStyle={{ background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', boxShadow: shadows.xl }}
                      itemStyle={{ color: '#F8FAFC', fontWeight: 700 }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={4} fill="url(#flagshipGradient)" dot={{ r: 4, fill: '#6366F1', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeTab === 'engagement' && (
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <div style={{
                  background: 'rgba(15, 23, 42, 0.4)',
                  backdropFilter: 'blur(30px)',
                  padding: '40px',
                  borderRadius: '32px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  height: '100%'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'center' }}>
                    <Title level={4} style={{ color: '#FFFFFF', margin: 0 }}>Engagement Velocity</Title>
                    <Tag color="purple" style={{ borderRadius: '8px', padding: '4px 12px', fontWeight: 800 }}>7 DAY TREND</Tag>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={velocityData}>
                      <defs>
                        <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} />
                      <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '12px' }} />
                      <Area type="stepAfter" dataKey="count" stroke="#8B5CF6" strokeWidth={3} fill="url(#velocityGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Col>
              <Col xs={24} lg={8}>
                <div style={{
                  background: colors.primary.gradient,
                  padding: '40px',
                  borderRadius: '32px',
                  height: '100%',
                  color: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)'
                }}>
                  <BarChart size={48} style={{ marginBottom: '24px' }} />
                  <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>Peak Momentum</div>
                  <div style={{ fontSize: '18px', opacity: 0.9 }}>
                    Your creator velocity is up by 12% compared to last week. Most interactions happen between 4 PM and 8 PM.
                  </div>
                </div>
              </Col>
            </Row>
          )}

          {activeTab === 'revenue' && (
            <RevenueChart data={forecastData} />
          )}

          {activeTab === 'activity' && (
            <ActivityHeatmapComponent data={activityData} />
          )}

          {activeTab === 'comparison' && (
            <ComparisonChart data={comparisonData} />
          )}

          {activeTab === 'competitive' && (
            <CompetitiveAnalysis creatorId={user?.id || ''} />
          )}

          {activeTab === 'funnel' && funnelData && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(30px)',
              padding: '48px',
              borderRadius: '40px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}>
              <Title level={3} style={{ color: '#FFFFFF', marginBottom: '40px', textAlign: 'center' }}>Conversion Life Cycle</Title>
              <Row gutter={[40, 40]} justify="center">
                {[
                  { label: 'Views', value: funnelData.profileViews, rate: '100%', color: '#6366F1' },
                  { label: 'Chats', value: funnelData.chatStarts, rate: `${funnelData.conversionRate.viewToChat}%`, color: '#10B981' },
                  { label: 'Retention', value: funnelData.returning, rate: `${funnelData.conversionRate.chatToReturn}%`, color: '#F59E0B' },
                  { label: 'Total Value', value: funnelData.subscribed, rate: `${funnelData.conversionRate.returnToSubscribe}%`, color: '#EC4899' }
                ].map((step, i) => (
                  <Col xs={24} sm={12} lg={6} key={i}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      style={{ textAlign: 'center', position: 'relative' }}
                    >
                      <div style={{
                        width: '120px',
                        height: '120px',
                        margin: '0 auto 24px',
                        borderRadius: '50%',
                        background: `${step.color}20`,
                        border: `2px solid ${step.color}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 30px ${step.color}30`
                      }}>
                        <div style={{ color: step.color, fontWeight: 900, fontSize: '24px' }}>{step.value}</div>
                        <div style={{ color: '#94A3B8', fontSize: '10px', fontWeight: 800 }}>{step.label.toUpperCase()}</div>
                      </div>
                      <div style={{ color: '#F8FAFC', fontWeight: 900, fontSize: '20px' }}>{step.rate}</div>
                      <Text style={{ color: '#64748B', fontWeight: 600 }}>Conv. Rate</Text>
                      {i < 3 && !isMobile && (
                        <div style={{ position: 'absolute', top: '60px', right: '-40px', fontSize: '24px', color: 'rgba(255, 255, 255, 0.1)' }}>→</div>
                      )}
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CreatorAnalytics;
