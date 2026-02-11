// ===========================================
// CREATOR ANALYTICS PAGE - Premium Light Theme
// ===========================================

import { useEffect, useState, useMemo } from 'react';
import { Row, Col, Spin, Tag, Grid, Typography } from 'antd';
import {
  MessageSquare,
  TrendingUp,
  DollarSign,
  Activity,
  LayoutDashboard,
  BarChart3,
  Filter,
  Users,
  Grid3X3,
  Calendar,
  Zap,
  ArrowRight
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
import { colors, spacing, shadows, borderRadius } from '../../styles/tokens';

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
    { id: 'revenue', label: 'Revenue', icon: <DollarSign size={18} /> },
    { id: 'activity', label: 'Heatmap', icon: <Activity size={18} /> },
    { id: 'funnel', label: 'Funnel', icon: <Filter size={18} /> },
    { id: 'comparison', label: 'Comparison', icon: <Grid3X3 size={18} /> },
    { id: 'competitive', label: 'Competitive', icon: <BarChart3 size={18} /> },
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
        <Spin size="large" tip={<span style={{ color: colors.text.tertiary, marginTop: '20px', display: 'block', fontWeight: 600 }}>Analyzing neural patterns...</span>} />
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? spacing[3] : spacing[8], minHeight: '100vh', background: colors.background }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: spacing[10] }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <Title level={isMobile ? 3 : 1} style={{ color: colors.text.primary, margin: 0, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Intelligence <span style={{ color: colors.primary.solid }}>Studio</span>
            </Title>
            <Text style={{ color: colors.text.secondary, fontSize: isMobile ? '14px' : '16px', fontWeight: 500, marginTop: '12px', display: 'block' }}>
              Strategic performance tracking for {user?.name}
            </Text>
          </div>
          <ExportButton creatorName={user?.name || 'Creator'} />
        </div>
      </motion.div>

      {/* Premium Tab Selection */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: spacing[10],
        padding: '8px',
        background: '#FFFFFF',
        borderRadius: '20px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        border: `1px solid ${colors.gray[100]}`,
        boxShadow: shadows.md
      }}>
        {menuItems.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab(item.id)}
            style={{
              padding: '12px 24px',
              borderRadius: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: activeTab === item.id ? colors.primary.solid : 'transparent',
              color: activeTab === item.id ? '#FFFFFF' : colors.text.secondary,
              whiteSpace: 'nowrap',
              fontWeight: 600,
              fontSize: '14px',
              boxShadow: activeTab === item.id ? shadows.md : 'none'
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          {activeTab === 'overview' && (
            <>
              {/* Perspective Stats Grid */}
              <Row gutter={[24, 24]} style={{ marginBottom: spacing[10] }}>
                {[
                  { title: 'Total Revenue', value: analytics?.overview?.totalEarnings || 0, prefix: '₹', color: colors.warning.solid, bg: colors.warning.subtle, icon: <DollarSign size={20} /> },
                  { title: 'Active Chats', value: analytics?.overview?.totalChats || 0, color: colors.primary.solid, bg: colors.primary.subtle, icon: <MessageSquare size={20} /> },
                  { title: 'Avg Interaction', value: analytics?.avgMessagesPerConversation || 0, units: 'msgs', color: colors.success.solid, bg: colors.success.subtle, icon: <Activity size={20} /> },
                  { title: '30D Velocity', value: analytics?.totalConversationsLast30Days || 0, color: '#ec4899', bg: '#fdf2f8', icon: <Calendar size={20} /> }
                ].map((stat, i) => (
                  <Col xs={12} lg={6} key={i}>
                    <div style={{
                      background: '#FFFFFF',
                      padding: '32px',
                      borderRadius: '24px',
                      border: `1px solid ${colors.gray[100]}`,
                      boxShadow: shadows.md,
                      height: '100%',
                      position: 'relative',
                    }}>
                      <div style={{
                        color: colors.text.tertiary,
                        fontWeight: 800,
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          background: stat.bg,
                          padding: '8px',
                          borderRadius: '10px',
                          color: stat.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>{stat.icon}</div>
                        {stat.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: colors.text.primary, letterSpacing: '-0.02em' }}>
                          {stat.prefix}{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                        </div>
                        {stat.units && <span style={{ color: colors.text.tertiary, fontWeight: 700, fontSize: '14px' }}>{stat.units}</span>}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>

              {/* Trajectory Analytics */}
              <div style={{
                background: '#FFFFFF',
                padding: isMobile ? '32px' : '48px',
                borderRadius: '24px',
                border: `1px solid ${colors.gray[100]}`,
                boxShadow: shadows.md,
              }}>
                <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Title level={4} style={{ color: colors.text.primary, margin: 0, fontWeight: 700, letterSpacing: '-0.01em' }}>Conversion Trajectory</Title>
                    <Text style={{ color: colors.text.secondary, fontWeight: 500 }}>Active interaction growth for the last 30 days</Text>
                  </div>
                  {!isMobile && (
                    <Tag bordered={false} style={{ background: colors.success.subtle, color: colors.success.solid, fontWeight: 800, borderRadius: '8px', padding: '6px 16px' }}>
                      +14.2% Growth
                    </Tag>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="studioGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors.primary.solid} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={colors.primary.solid} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.gray[100]} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: colors.text.tertiary, fontSize: 12, fontWeight: 700 }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.text.tertiary, fontSize: 12, fontWeight: 700 }} dx={-10} />
                    <Tooltip
                      contentStyle={{ background: '#FFFFFF', border: `1px solid ${colors.gray[200]}`, borderRadius: '16px', boxShadow: shadows.lg }}
                      itemStyle={{ color: colors.text.primary, fontWeight: 800 }}
                    />
                    <Area type="monotone" dataKey="count" stroke={colors.primary.solid} strokeWidth={4} fill="url(#studioGradient)" dot={{ r: 6, fill: colors.primary.solid, strokeWidth: 3, stroke: '#FFFFFF' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeTab === 'engagement' && (
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <div style={{
                  background: '#FFFFFF',
                  padding: '48px',
                  borderRadius: '24px',
                  border: `1px solid ${colors.gray[100]}`,
                  boxShadow: shadows.md,
                  height: '100%'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '48px', alignItems: 'center' }}>
                    <Title level={4} style={{ color: colors.text.primary, margin: 0, fontWeight: 700 }}>Engagement Velocity</Title>
                    <Tag bordered={false} style={{ background: colors.primary.subtle, color: colors.primary.solid, borderRadius: '8px', fontWeight: 800, padding: '4px 16px' }}>ROLLING 7-DAY TREND</Tag>
                  </div>
                  <ResponsiveContainer width="100%" height={340}>
                    <AreaChart data={velocityData}>
                      <defs>
                        <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colors.primary.solid} stopOpacity={0.1} />
                          <stop offset="100%" stopColor={colors.primary.solid} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.gray[100]} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: colors.text.tertiary, fontSize: 12, fontWeight: 700 }} />
                      <Tooltip contentStyle={{ background: '#FFFFFF', border: `1px solid ${colors.gray[200]}`, borderRadius: '16px', boxShadow: shadows.lg }} />
                      <Area type="stepAfter" dataKey="count" stroke={colors.primary.solid} strokeWidth={4} fill="url(#velocityGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Col>
              <Col xs={24} lg={8}>
                <div style={{
                  background: colors.primary.gradient,
                  padding: '48px',
                  borderRadius: '24px',
                  height: '100%',
                  color: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxShadow: shadows.lg,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: 150, height: 150, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '32px'
                  }}>
                    <Zap size={32} />
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Peak Momentum</div>
                  <div style={{ fontSize: '16px', opacity: 0.9, lineHeight: 1.7, fontWeight: 500 }}>
                    Your creator velocity is up by 12% compared to last week. Your resonance peak occurs during afternoon windows.
                  </div>
                  <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, cursor: 'pointer' }}>
                    Analyze Deep Patterns <ArrowRight size={18} />
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
              background: '#FFFFFF',
              padding: isMobile ? '40px' : '64px',
              borderRadius: '24px',
              border: `1px solid ${colors.gray[100]}`,
              boxShadow: shadows.md,
            }}>
              <Title level={3} style={{ color: colors.text.primary, marginBottom: '56px', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.02em' }}>Life Cycle Synchrony</Title>
              <Row gutter={[48, 48]} justify="center">
                {[
                  { label: 'Views', value: funnelData.profileViews, rate: 'INIT', color: colors.primary.solid, bg: colors.primary.subtle },
                  { label: 'Chats', value: funnelData.chatStarts, rate: `${funnelData.conversionRate.viewToChat}%`, color: colors.success.solid, bg: colors.success.subtle },
                  { label: 'Retention', value: funnelData.returning, rate: `${funnelData.conversionRate.chatToReturn}%`, color: colors.warning.solid, bg: colors.warning.subtle },
                  { label: 'Subs', value: funnelData.subscribed, rate: `${funnelData.conversionRate.returnToSubscribe}%`, color: '#ec4899', bg: '#fdf2f8' }
                ].map((step, i) => (
                  <Col xs={24} sm={12} lg={6} key={i}>
                    <motion.div
                      whileHover={{ y: -8 }}
                      style={{ textAlign: 'center', position: 'relative' }}
                    >
                      <div style={{
                        width: '120px',
                        height: '120px',
                        margin: '0 auto 24px',
                        borderRadius: '30%',
                        background: step.bg,
                        border: `1px solid ${step.color}15`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 16px ${step.color}08`,
                        transform: 'rotate(-5deg)'
                      }}>
                        <div style={{ transform: 'rotate(5deg)' }}>
                          <div style={{ color: step.color, fontWeight: 900, fontSize: '24px', letterSpacing: '-0.02em' }}>{step.value.toLocaleString()}</div>
                          <div style={{ color: colors.text.tertiary, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{step.label}</div>
                        </div>
                      </div>
                      <div style={{ color: colors.text.primary, fontWeight: 800, fontSize: '22px', letterSpacing: '-0.01em' }}>{step.rate}</div>
                      <Text style={{ color: colors.text.tertiary, fontWeight: 600, fontSize: '12px' }}>CONV. RATE</Text>
                      {i < 3 && !isMobile && (
                        <div style={{ position: 'absolute', top: '50px', right: '-40px', fontSize: '24px', color: colors.gray[200] }}>
                          <ArrowRight size={24} />
                        </div>
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
