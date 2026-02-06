// ===========================================
// CREATOR ANALYTICS PAGE
// Enhanced with advanced analytics
// ===========================================

import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, Tabs, DatePicker, Space, Tag, Grid } from 'antd';
import { MessageOutlined, RiseOutlined } from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { creatorApi } from '../../services/api';
import { RetentionChart } from '../../components/analytics/RetentionChart';
import { RevenueChart } from '../../components/analytics/RevenueChart';
import { ActivityHeatmapComponent } from '../../components/analytics/ActivityHeatmap';
import { ComparisonChart } from '../../components/analytics/ComparisonChart';
import { ExportButton } from '../../components/analytics/ExportButton';
import CompetitiveAnalysis from '../../components/analytics/CompetitiveAnalysis';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

const CreatorAnalytics = () => {
  // Basic analytics
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Advanced analytics
  const [retentionData, setRetentionData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [activityData, setActivityData] = useState<any>(null);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);

  // Loading states
  const [retentionLoading, setRetentionLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [funnelLoading, setFunnelLoading] = useState(false);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // Comparison period
  const [comparisonDays, setComparisonDays] = useState(30);

  // Get user for export
  const { user } = useSelector((state: RootState) => state.auth);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  useEffect(() => {
    fetchAnalytics();
    fetchAdvancedAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await creatorApi.getAnalytics();
      setAnalytics(response.data.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvancedAnalytics = async () => {
    // Fetch all advanced analytics in parallel
    fetchRetentionAnalytics();
    fetchForecastAnalytics();
    fetchActivityAnalytics();
    fetchFunnelAnalytics();
    fetchComparisonAnalytics(comparisonDays);
  };

  const fetchRetentionAnalytics = async () => {
    try {
      setRetentionLoading(true);
      const response = await creatorApi.getRetentionAnalytics();
      setRetentionData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch retention analytics:', err);
    } finally {
      setRetentionLoading(false);
    }
  };

  const fetchForecastAnalytics = async () => {
    try {
      setForecastLoading(true);
      const response = await creatorApi.getRevenueForecast();
      setForecastData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch forecast analytics:', err);
    } finally {
      setForecastLoading(false);
    }
  };

  const fetchActivityAnalytics = async () => {
    try {
      setActivityLoading(true);
      const response = await creatorApi.getActivityHeatmap();
      setActivityData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch activity analytics:', err);
    } finally {
      setActivityLoading(false);
    }
  };

  const fetchFunnelAnalytics = async () => {
    try {
      setFunnelLoading(true);
      const response = await creatorApi.getConversionFunnel();
      setFunnelData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch funnel analytics:', err);
    } finally {
      setFunnelLoading(false);
    }
  };

  const fetchComparisonAnalytics = async (days: number) => {
    try {
      setComparisonLoading(true);
      const response = await creatorApi.getComparativeAnalytics(days);
      setComparisonData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch comparison analytics:', err);
    } finally {
      setComparisonLoading(false);
    }
  };

  const handleComparisonDaysChange = (days: number) => {
    setComparisonDays(days);
    fetchComparisonAnalytics(days);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  // Transform chatsByDate to chart data
  const chartData = analytics?.chatsByDate
    ? Object.entries(analytics.chatsByDate)
      .map(([date, chats]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date,
        chats: chats as number
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
      .slice(-30)  // Last 30 days
    : [];

  return (
    <div style={{ padding: isMobile ? '8px' : '24px' }}>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        marginBottom: isMobile ? '24px' : '32px',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: 900, margin: 0, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1.2 }}>
            Analytics Dashboard
          </h1>
          <p style={{ color: '#94A3B8', fontSize: isMobile ? '14px' : '18px', fontWeight: 500, marginTop: '4px' }}>
            Deep insights into your AI performance
          </p>
        </div>
        <ExportButton creatorName={user?.name || 'Creator'} />
      </div>

      {/* Overview Statistics */}
      <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
        {[
          { title: 'Total Chats', value: analytics?.overview?.totalChats || 0, icon: <MessageOutlined />, color: '#6366F1' },
          { title: 'Total Messages', value: analytics?.overview?.totalMessages || 0, icon: <MessageOutlined />, color: '#10B981' },
          { title: 'Total Earnings', value: analytics?.overview?.totalEarnings || 0, icon: '₹', color: '#F59E0B', precision: 2 },
          { title: 'Avg Messages/Chat', value: analytics?.avgMessagesPerConversation?.toFixed(1) || 0, icon: <RiseOutlined />, color: '#8B5CF6' }
        ].map((stat, i) => (
          <Col xs={12} sm={12} lg={6} key={i}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(20px) saturate(180%)',
              padding: isMobile ? '20px 16px' : '28px 24px',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
              height: '100%'
            }}>
              <div style={{
                position: 'absolute',
                top: '-15%',
                right: '-10%',
                width: '100px',
                height: '100px',
                background: stat.color,
                opacity: 0.04,
                borderRadius: '50%',
                filter: 'blur(30px)'
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  color: stat.color,
                  background: `${stat.color}15`,
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  {stat.icon}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.title}</span>
              </div>
              <div style={{ fontSize: isMobile ? '22px' : '32px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.025em' }}>
                {typeof stat.icon === 'string' ? stat.icon : ''}
                {typeof stat.value === 'number' ? stat.value.toLocaleString(undefined, { minimumFractionDigits: stat.precision || 0 }) : stat.value}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Tabbed Advanced Analytics */}
      <Tabs defaultActiveKey="overview" size="large" className="vibrant-tabs">
        <TabPane tab="Overview" key="overview">
          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            <Col xs={24} lg={12}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(20px) saturate(180%)',
                borderRadius: '28px',
                padding: isMobile ? '20px' : '32px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: isMobile ? '16px' : '20px', color: '#FFFFFF' }}>Conversations Trend</h3>
                  <Tag color="blue" bordered={false} style={{ borderRadius: '6px' }}>Last 30 Days</Tag>
                </div>
                <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorChatsAnalytics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                    <Area
                      type="monotone"
                      dataKey="chats"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorChatsAnalytics)"
                      name="Conversations"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Col>

            {/* Engagement Metrics */}
            <Col xs={24} lg={12}>
              <div style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '24px',
                border: '1px solid #F1F5F9',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: isMobile ? '16px' : '20px', color: '#FFFFFF' }}>Engagement Metrics</h3>
                  <Tag color="indigo" bordered={false} style={{ borderRadius: '6px' }}>Velocity</Tag>
                </div>
                <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" />
                    <Line
                      type="monotone"
                      dataKey="chats"
                      stroke="#6366F1"
                      strokeWidth={3}
                      dot={{ fill: '#6366F1', r: 4, strokeWidth: 2, stroke: '#FFF' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      name="Chats"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>

          {/* Period Comparison */}
          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <ComparisonChart
                data={comparisonData}
                periodDays={comparisonDays}
                loading={comparisonLoading}
              />
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="User Retention" key="retention">
          <RetentionChart data={retentionData} loading={retentionLoading} />
        </TabPane>

        <TabPane tab="Revenue Forecast" key="forecast">
          <RevenueChart data={forecastData} loading={forecastLoading} />
        </TabPane>

        <TabPane tab="Activity Heatmap" key="activity">
          <ActivityHeatmapComponent data={activityData} loading={activityLoading} />
        </TabPane>

        <TabPane tab="Competitive Analysis" key="competitive">
          <CompetitiveAnalysis creatorId={user?.id || ''} />
        </TabPane>

        <TabPane tab="Conversion Funnel" key="funnel">
          {funnelData && (
            <Card title="Conversion Funnel">
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={6}>
                  <Card style={{ background: '#f0f5ff', textAlign: 'center' }}>
                    <Statistic
                      title="Profile Views"
                      value={funnelData.profileViews}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card style={{ background: '#f6ffed', textAlign: 'center' }}>
                    <Statistic
                      title="Chat Starts"
                      value={funnelData.chatStarts}
                      suffix={`(${funnelData.conversionRate.viewToChat}%)`}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card style={{ background: '#fff7e6', textAlign: 'center' }}>
                    <Statistic
                      title="Returning Users"
                      value={funnelData.returning}
                      suffix={`(${funnelData.conversionRate.chatToReturn}%)`}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card style={{ background: '#f9f0ff', textAlign: 'center' }}>
                    <Statistic
                      title="Subscribed"
                      value={funnelData.subscribed}
                      suffix={`(${funnelData.conversionRate.returnToSubscribe}%)`}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
              </Row>

              <div style={{ marginTop: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#595959' }}>
                  <strong>How to read:</strong> Shows the user journey from profile view to subscription.
                  Percentages indicate conversion rate at each stage.
                  Focus on improving the lowest conversion rate to maximize subscriptions.
                </p>
              </div>
            </Card>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default CreatorAnalytics;
