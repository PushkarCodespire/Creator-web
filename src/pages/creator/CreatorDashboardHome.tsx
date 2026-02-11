// ===========================================
// CREATOR DASHBOARD HOME - Premium Light Theme
// ===========================================

import { useEffect, useState } from 'react';
import {
  MessageSquare,
  FileText,
  CircleDollarSign,
  User,
  Trophy,
  Flame,
  Star,
  Users,
  TrendingUp,
  ArrowRight,
  Zap,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Target
} from 'lucide-react';
import { Row, Col, Statistic, List, Tag, Spin, Button, Progress, Alert, Grid, Avatar, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { creatorApi, getImageUrl } from '../../services/api';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { colors, spacing, typography, shadows, borderRadius } from '../../styles/tokens';
import DashboardContentLoader from '../../components/common/DashboardContentLoader';
import { FollowersModal } from '../../components/Creator/FollowersModal';
import { ReviewsModal } from '../../components/Creator/ReviewsModal';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const CreatorDashboardHome = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [realtimeStats, setRealtimeStats] = useState({
    activeChats: 0,
    messagesLastHour: 0,
    earningsToday: 0,
  });
  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [reviewsModalVisible, setReviewsModalVisible] = useState(false);
  const [engagementTrend, setEngagementTrend] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
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
      const data = response.data.data;
      setDashboard(data);
      fetchRealtimeStats(data);
      fetchEngagementTrend();
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeStats = async (source?: any) => {
    try {
      const data = source || dashboard;
      if (!data) return;
      setRealtimeStats({
        activeChats: data.activeChats ?? 0,
        messagesLastHour: data.messagesLastHour ?? data.messagesToday ?? 0,
        earningsToday: data.earningsToday ?? 0,
      });
    } catch (err) {
      console.error('Failed to fetch real-time stats:', err);
    }
  };

  const fetchEngagementTrend = async () => {
    try {
      const response = await creatorApi.getEngagementTrend(7);
      setEngagementTrend(response.data.data.trend);
    } catch (err) {
      console.error('Failed to fetch engagement trend:', err);
    }
  };

  const engagementData = engagementTrend.map(item => ({
    day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    fullDate: item.date,
    count: item.count
  }));

  if (loading) {
    return <DashboardContentLoader />;
  }

  const completionRate = dashboard?.contents?.length > 0
    ? Math.round((dashboard.contents.filter((c: any) => c.status === 'COMPLETED').length / dashboard.contents.length) * 100)
    : 0;

  return (
    <div style={{ padding: isMobile ? spacing[3] : spacing[8], background: colors.background, minHeight: '100vh' }}>
      {/* Header Nexus */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: spacing[10] }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <Title level={isMobile ? 3 : 1} style={{ color: colors.text.primary, margin: 0, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Neural <span style={{ color: colors.primary.solid }}>Nexus</span>
            </Title>
            <Text style={{ color: colors.text.secondary, fontSize: isMobile ? '14px' : '16px', fontWeight: 500, marginTop: '12px', display: 'block' }}>
              Operational overview for <span style={{ color: colors.primary.solid, fontWeight: 700 }}>{dashboard?.displayName}</span>
            </Text>
          </div>
          {!isMobile && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Tag
                bordered={false}
                icon={<Sparkles size={14} style={{ marginRight: '6px' }} />}
                style={{
                  background: colors.success.subtle,
                  color: colors.success.solid,
                  fontWeight: 800,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                AI LIVE
              </Tag>
              <Tag
                bordered={false}
                icon={<ShieldCheck size={14} style={{ marginRight: '6px' }} />}
                style={{
                  background: colors.primary.subtle,
                  color: colors.primary.solid,
                  fontWeight: 800,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                SECURED
              </Tag>
            </div>
          )}
        </div>
      </motion.div>

      {/* Real-time Synapse Grid */}
      <Row gutter={[24, 24]} style={{ marginBottom: spacing[10] }}>
        {[
          { title: 'Concurrent Interaction', value: realtimeStats.activeChats, icon: <Users size={20} />, color: colors.primary.solid, bg: colors.primary.subtle, label: 'Live Engagement' },
          { title: 'Messages (H1)', value: realtimeStats.messagesLastHour, icon: <Zap size={20} />, color: colors.success.solid, bg: colors.success.subtle, label: 'Interaction Velocity' },
          { title: 'Captital Capture', value: realtimeStats.earningsToday, icon: <CircleDollarSign size={20} />, color: colors.warning.solid, bg: colors.warning.subtle, suffix: '₹', label: `Month: ₹${dashboard?.totalEarnings || 0}` },
          { title: 'Total Resonances', value: dashboard?.totalChats || 0, icon: <MessageSquare size={20} />, color: '#ec4899', bg: '#fdf2f8', label: 'Historical Reach' }
        ].map((item, index) => (
          <Col xs={12} lg={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '32px',
                border: `1px solid ${colors.gray[100]}`,
                boxShadow: shadows.md,
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: item.color,
                opacity: 0.04,
                borderRadius: '50%',
                filter: 'blur(30px)'
              }} />
              <div style={{
                color: colors.text.tertiary,
                fontWeight: 800,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ background: item.bg, padding: '8px', borderRadius: '10px', color: item.color }}>{item.icon}</div>
                {item.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <div style={{ fontSize: '36px', fontWeight: 900, color: colors.text.primary, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {item.suffix}{item.value.toLocaleString()}
                </div>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: colors.text.tertiary, marginTop: '20px' }}>
                {item.label}
              </div>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Trajectory & Readiness */}
      <Row gutter={[24, 24]} style={{ marginBottom: spacing[10] }}>
        <Col xs={24} lg={16}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: isMobile ? '32px' : '48px',
            boxShadow: shadows.md,
            border: `1px solid ${colors.gray[100]}`,
            height: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '48px', alignItems: 'center' }}>
              <div>
                <Title level={4} style={{ color: colors.text.primary, margin: 0, fontWeight: 800, letterSpacing: '-0.01em' }}>Neural Trajectory</Title>
                <Text style={{ color: colors.text.secondary, fontWeight: 500 }}>Active resonance patterns for the last 7 cycles</Text>
              </div>
              <Tag bordered={false} style={{ background: colors.primary.subtle, color: colors.primary.solid, borderRadius: '8px', fontWeight: 800, padding: '6px 16px' }}>ROLLING WINDOW</Tag>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="nexusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.primary.solid} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={colors.primary.solid} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.gray[50]} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: colors.text.tertiary, fontSize: 13, fontWeight: 700 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.text.tertiary, fontSize: 12, fontWeight: 700 }} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: `1px solid ${colors.gray[200]}`, boxShadow: shadows.lg }}
                  itemStyle={{ color: colors.text.primary, fontWeight: 800 }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={colors.primary.solid}
                  strokeWidth={5}
                  fillOpacity={1}
                  fill="url(#nexusGradient)"
                  name="Interactions"
                  dot={{ r: 6, fill: colors.primary.solid, strokeWidth: 3, stroke: '#FFFFFF' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '48px 32px',
            height: '100%',
            boxShadow: shadows.md,
            border: `1px solid ${colors.gray[100]}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '40px', fontWeight: 800, fontSize: '20px', color: colors.text.primary, letterSpacing: '-0.01em', alignSelf: 'flex-start' }}>AI Readiness Matrix</h3>
            <div style={{ position: 'relative', marginBottom: '48px' }}>
              <Progress
                type="dashboard"
                percent={completionRate}
                strokeColor={colors.primary.solid}
                strokeWidth={12}
                size={220}
                format={(percent) => (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '40px', fontWeight: 900, color: colors.text.primary, letterSpacing: '-0.02em' }}>{percent}%</span>
                    <span style={{ fontSize: '12px', color: colors.text.tertiary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Calibrated</span>
                  </div>
                )}
              />
              <div style={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)', background: '#FFFFFF', padding: '6px 16px', borderRadius: '30px', boxShadow: shadows.sm, border: `1px solid ${colors.gray[100]}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.success.solid, boxShadow: `0 0 10px ${colors.success.solid}66` }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: colors.text.secondary }}>Neural Sync</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {[
                { label: 'Ingested', count: dashboard?.contents?.filter((c: any) => c.status === 'COMPLETED').length || 0, color: colors.success.solid, bg: colors.success.subtle },
                { label: 'Processing', count: dashboard?.contents?.filter((c: any) => c.status === 'PROCESSING').length || 0, color: colors.primary.solid, bg: colors.primary.subtle },
                { label: 'Failed', count: dashboard?.contents?.filter((c: any) => c.status === 'FAILED').length || 0, color: colors.error.solid, bg: colors.error.subtle }
              ].map(status => (
                <div key={status.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: colors.gray[50], borderRadius: '16px', border: `1px solid ${colors.gray[100]}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '3px', background: status.color }} />
                    <span style={{ fontWeight: 700, color: colors.text.secondary, fontSize: '14px' }}>{status.label}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: colors.text.primary, fontSize: '16px' }}>{status.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {/* Activity Feeds */}
      <Row gutter={[24, 24]} style={{ marginBottom: spacing[10] }}>
        <Col xs={24} lg={12}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '40px',
            border: `1px solid ${colors.gray[100]}`,
            boxShadow: shadows.md,
            height: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: colors.primary.subtle, padding: '8px', borderRadius: '10px', color: colors.primary.solid }}><FileText size={20} /></div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '20px', color: colors.text.primary, letterSpacing: '-0.01em' }}>Neural Ingestions</h3>
              </div>
              <Button type="link" onClick={() => navigate('/creator-dashboard/content')} style={{ paddingRight: 0, fontWeight: 700, color: colors.primary.solid, display: 'flex', alignItems: 'center', gap: '4px' }}>Manage <ChevronRight size={14} /></Button>
            </div>
            {dashboard?.contents?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <FileText size={48} style={{ color: colors.gray[200], marginBottom: '24px' }} />
                <p style={{ color: colors.text.tertiary, fontWeight: 600, marginBottom: '24px' }}>Empty neural state. Ingest data to train your AI.</p>
                <Button type="primary" size="large" onClick={() => navigate('/creator-dashboard/content')} style={{ borderRadius: '8px', fontWeight: 600, padding: '0 24px', height: '40px', background: colors.primary.solid, border: 'none' }}>Start Ingestion</Button>
              </div>
            ) : (
              <List
                dataSource={dashboard?.contents?.slice(0, 5)}
                renderItem={(item: any) => (
                  <List.Item
                    style={{ cursor: 'pointer', borderBottom: `1px solid ${colors.gray[50]}`, padding: '20px 0' }}
                    onClick={() => navigate('/creator-dashboard/content')}
                    className="dashboard-list-item"
                  >
                    <List.Item.Meta
                      title={<span style={{ fontWeight: 700, color: colors.text.primary, fontSize: '15px' }}>{item.title}</span>}
                      description={
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
                          <Tag bordered={false} style={{
                            background: item.status === 'COMPLETED' ? colors.success.subtle : item.status === 'PROCESSING' ? colors.primary.subtle : colors.error.subtle,
                            color: item.status === 'COMPLETED' ? colors.success.solid : item.status === 'PROCESSING' ? colors.primary.solid : colors.error.solid,
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '10px'
                          }}>
                            {item.status}
                          </Tag>
                          {item._count?.chunks && (
                            <span style={{ fontSize: '12px', color: colors.text.tertiary, fontWeight: 600 }}>
                              {item._count.chunks} Neural Chunks
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
            background: '#ffffff',
            borderRadius: '24px',
            padding: '40px',
            border: `1px solid ${colors.gray[100]}`,
            boxShadow: shadows.md,
            height: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: colors.warning.subtle, padding: '8px', borderRadius: '10px', color: colors.warning.solid }}><Target size={20} /></div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '20px', color: colors.text.primary, letterSpacing: '-0.01em' }}>Strategic Flux</h3>
              </div>
              <Button type="link" onClick={() => navigate('/creator-dashboard/opportunities')} style={{ paddingRight: 0, fontWeight: 700, color: colors.primary.solid, display: 'flex', alignItems: 'center', gap: '4px' }}>Browse <ChevronRight size={14} /></Button>
            </div>
            {dashboard?.applications?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Flame size={48} style={{ color: colors.gray[200], marginBottom: '24px' }} />
                <p style={{ color: colors.text.tertiary, fontWeight: 600, marginBottom: '24px' }}>Neutral opportunity field. No active applications.</p>
                <Button type="primary" size="large" onClick={() => navigate('/creator-dashboard/opportunities')} style={{ borderRadius: '8px', fontWeight: 600, padding: '0 24px', height: '40px', background: colors.primary.solid, border: 'none' }}>Explore Deals</Button>
              </div>
            ) : (
              <List
                dataSource={dashboard?.applications?.slice(0, 5)}
                renderItem={(item: any) => (
                  <List.Item
                    style={{ cursor: 'pointer', borderBottom: `1px solid ${colors.gray[50]}`, padding: '20px 0' }}
                    onClick={() => navigate('/creator-dashboard/opportunities')}
                    className="dashboard-list-item"
                  >
                    <List.Item.Meta
                      title={<span style={{ fontWeight: 700, color: colors.text.primary, fontSize: '15px' }}>{item.opportunity?.title}</span>}
                      description={
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
                          <Tag bordered={false} style={{
                            background: item.status === 'ACCEPTED' ? colors.success.subtle : item.status === 'REJECTED' ? colors.error.subtle : colors.primary.subtle,
                            color: item.status === 'ACCEPTED' ? colors.success.solid : item.status === 'REJECTED' ? colors.error.solid : colors.primary.solid,
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '10px'
                          }}>
                            {item.status}
                          </Tag>
                          {item.opportunity?.budget && (
                            <span style={{ fontSize: '12px', color: colors.text.tertiary, fontWeight: 600 }}>
                              ₹{item.opportunity.budget.toLocaleString()} Capital
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

      {/* Social & Resonance */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '40px',
            border: `1px solid ${colors.gray[100]}`,
            boxShadow: shadows.md,
            height: '100%',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: colors.primary.subtle, padding: '8px', borderRadius: '10px', color: colors.primary.solid }}><Users size={20} /></div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '20px', color: colors.text.primary, letterSpacing: '-0.01em' }}>
                  Follower Matrix ({dashboard?.followers?.count || 0})
                </h3>
              </div>
              <Button type="link" onClick={() => setFollowersModalVisible(true)} style={{ paddingRight: 0, fontWeight: 700, color: colors.primary.solid }}>Expand All</Button>
            </div>
            <List
              dataSource={dashboard?.followers?.top || []}
              locale={{ emptyText: <span style={{ color: colors.text.tertiary, fontWeight: 600 }}>Zero followers in current matrix</span> }}
              renderItem={(follower: any) => (
                <List.Item style={{ borderBottom: `1px solid ${colors.gray[50]}`, padding: '20px 0' }}>
                  <List.Item.Meta
                    avatar={<Avatar size={48} src={getImageUrl(follower.avatar)} style={{ border: `2px solid ${colors.gray[100]}` }} />}
                    title={<span style={{ color: colors.text.primary, fontWeight: 700, fontSize: '15px' }}>{follower.name}</span>}
                    description={<span style={{ color: colors.text.tertiary, fontSize: '13px', fontWeight: 500 }}>{follower.email}</span>}
                  />
                  <div style={{ color: colors.text.tertiary, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {new Date(follower.followedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </List.Item>
              )}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '40px',
            border: `1px solid ${colors.gray[100]}`,
            boxShadow: shadows.md,
            height: '100%',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: colors.warning.subtle, padding: '8px', borderRadius: '10px', color: colors.warning.solid }}><Star size={20} /></div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '20px', color: colors.text.primary, letterSpacing: '-0.01em' }}>Resonance Feed</h3>
                {dashboard?.reviews?.summary && (
                  <Tag bordered={false} style={{ borderRadius: '6px', fontWeight: 900, background: colors.warning.subtle, color: colors.warning.solid, fontSize: '13px', padding: '2px 10px' }}>
                    {Number(dashboard.reviews.summary.averageRating).toFixed(1)}
                  </Tag>
                )}
              </div>
              <Button type="link" onClick={() => setReviewsModalVisible(true)} style={{ paddingRight: 0, fontWeight: 700, color: colors.primary.solid }}>View Feed</Button>
            </div>
            <List
              dataSource={dashboard?.reviews?.reviews?.slice(0, 3) || []}
              locale={{ emptyText: <span style={{ color: colors.text.tertiary, fontWeight: 600 }}>Null resonance detected.</span> }}
              renderItem={(review: any) => (
                <List.Item style={{ borderBottom: `1px solid ${colors.gray[50]}`, padding: '24px 0' }}>
                  <List.Item.Meta
                    avatar={<Avatar size={48} src={getImageUrl(review.user?.avatar)} style={{ border: `2px solid ${colors.gray[100]}` }} />}
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: colors.text.primary, fontWeight: 800 }}>{review.user?.name}</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < review.rating ? colors.warning.solid : "transparent"} stroke={i < review.rating ? colors.warning.solid : colors.gray[300]} style={{ opacity: i < review.rating ? 1 : 0.3 }} />
                          ))}
                        </div>
                      </div>
                    }
                    description={
                      <div>
                        <p style={{ color: colors.text.secondary, margin: '8px 0', fontSize: '14px', lineHeight: 1.6, fontWeight: 500 }}>{review.comment || 'Neutral feedback provided.'}</p>
                        <span style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ingested {new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </Col>
      </Row>

      {/* Get Started Alert */}
      {dashboard?.contents?.length === 0 && (
        <Alert
          message={<span style={{ fontWeight: 800 }}>Initialization Required</span>}
          description={<span style={{ fontWeight: 500 }}>Neural matrix is currently hollow. Synchronize your first content vectors to enable AI response cycles. Upload YouTube data, text narratives, or FAQ streams.</span>}
          type="info"
          showIcon
          icon={<Sparkles size={20} />}
          style={{ marginTop: spacing[10], borderRadius: '20px', padding: '24px', background: colors.primary.subtle, border: `1px solid ${colors.primary.solid}15` }}
          action={
            <Button type="primary" size="large" onClick={() => navigate('/creator-dashboard/content')} style={{ borderRadius: '8px', fontWeight: 700, background: colors.primary.solid, border: 'none', height: '44px', padding: '0 24px' }}>
              Begin Ingestion
            </Button>
          }
        />
      )}

      {/* Modals */}
      <FollowersModal
        visible={followersModalVisible}
        onClose={() => setFollowersModalVisible(false)}
      />
      <ReviewsModal
        creatorId={dashboard?.id}
        visible={reviewsModalVisible}
        onClose={() => setReviewsModalVisible(false)}
        initialSummary={dashboard?.reviews?.summary}
      />

      <style>{`
          .dashboard-list-item:hover {
              transform: translateX(8px);
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .ant-progress-text { margin-top: 10px !important; }
      `}</style>
    </div>
  );
};

export default CreatorDashboardHome;
