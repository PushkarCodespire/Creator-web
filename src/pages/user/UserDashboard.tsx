import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Avatar, Button, Typography, Alert } from 'antd';
import {
  MessageSquare,
  Send,
  UserPlus,
  ArrowRight,
  Star,
  Bell,
  Trophy,
  Flame
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { userDashboardApi, subscriptionApi, getImageUrl } from '../../services/api';
import DashboardContentLoader from '../../components/common/DashboardContentLoader';
import { colors, spacing, shadows, typography, borderRadius } from '../../styles/tokens';

const { Title, Text } = Typography;

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalChats: 0,
    messagesSent: 0,
    following: 0,
    unreadNotifications: 0,
    activeStreak: 0
  });
  const [subscription, setSubscription] = useState<any>(null);
  const [tokenUsage, setTokenUsage] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Use new dedicated dashboard API endpoints
      const [statsRes, conversationsRes, recommendationsRes, activityRes, subscriptionRes] = await Promise.allSettled([
        userDashboardApi.getStats(),
        userDashboardApi.getRecentConversations({ limit: 3 }),
        userDashboardApi.getRecommendedCreators({ limit: 6 }),
        userDashboardApi.getActivityFeed({ limit: 5, days: 7 }),
        subscriptionApi.getDetails()
      ]);

      // Handle stats response
      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        const data = statsRes.value.data.data;
        setStats({
          totalChats: data.stats?.totalChats || 0,
          messagesSent: data.stats?.messagesToday || 0,
          following: data.stats?.followingCount || 0,
          unreadNotifications: data.stats?.unreadAlerts || 0,
          activeStreak: data.stats?.activeStreak || 0
        });
        setSubscription(data.subscription);
      }

      if (subscriptionRes.status === 'fulfilled' && subscriptionRes.value.data.success) {
        const data = subscriptionRes.value.data.data || {};
        setTokenUsage(data.usage?.tokens || null);
        if (!subscription) {
          setSubscription(data.subscription || null);
        }
      }

      // Handle conversations response
      if (conversationsRes.status === 'fulfilled' && conversationsRes.value.data.success) {
        const data = conversationsRes.value.data.data;
        setConversations(data.conversations || []);
      }

      // Handle recommendations response
      if (recommendationsRes.status === 'fulfilled' && recommendationsRes.value.data.success) {
        const data = recommendationsRes.value.data.data;
        setRecommendations(data.recommendations || []);
      }

      // Handle activity feed response
      if (activityRes.status === 'fulfilled' && activityRes.value.data.success) {
        const data = activityRes.value.data.data;
        const activityList = data.activities || [];

        // Transform activities with appropriate icons
        const formattedActivities = activityList.map((item: any) => {
          let icon = <Bell size={18} style={{ color: colors.primary.solid }} />;
          if (item.type === 'notification' && item.message?.includes('message')) {
            icon = <MessageSquare size={18} style={{ color: colors.primary.solid }} />;
          } else if (item.type === 'follow') {
            icon = <UserPlus size={18} style={{ color: colors.primary.solid }} />;
          } else if (item.type === 'ACHIEVEMENT') {
            icon = <Trophy size={18} style={{ color: colors.warning.solid }} />;
          }

          return {
            id: item.id,
            type: item.type,
            title: item.title || item.message,
            time: new Date(item.timestamp).toLocaleDateString(),
            icon
          };
        });
        setActivities(formattedActivities);
      }

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardContentLoader />;
  }

  const isPremium = subscription?.plan === 'PREMIUM';
  const tokenBalance = tokenUsage?.balance;
  const tokenGrant = tokenUsage?.grant;
  const tokensPerMessage = tokenUsage?.perMessage;
  const tokenUsagePercentage = tokenGrant ? Math.round(((tokenGrant - (tokenBalance || 0)) / tokenGrant) * 100) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: '32px', position: 'relative' }}
    >
      {/* Suspension Restriction Overlay */}
      {user?.isSuspended && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 100,
          cursor: 'not-allowed',
          background: 'rgba(255, 255, 255, 0.1)'
        }} onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }} />
      )}

      {user?.isSuspended && (
        <div style={{ marginBottom: '24px' }}>
          <Alert
            message={<span style={{ fontWeight: 800, color: colors.error.solid }}>Account Suspended</span>}
            description={
              <div style={{ color: colors.text.secondary }}>
                <p style={{ marginBottom: '8px', fontWeight: 500 }}>
                  Your account has been suspended until <strong>{user.suspendedUntil ? new Date(user.suspendedUntil).toLocaleDateString() : 'TBD'}</strong>.
                </p>
                <p style={{ marginBottom: '8px', fontWeight: 500 }}>
                  <strong>Reason:</strong> {user.suspensionReason || 'No reason provided'}
                </p>
                <p style={{ fontSize: '13px', color: colors.text.tertiary, fontWeight: 500 }}>
                  During suspension, you can view your dashboard but interactions are restricted. If you believe this is a mistake, please contact support.
                </p>
              </div>
            }
            type="error"
            showIcon
            style={{
              borderRadius: '24px',
              background: colors.error.subtle,
              border: `1px solid ${colors.error.subtle}`,
              boxShadow: shadows.sm
            }}
          />
        </div>
      )}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ color: colors.text.primary, marginBottom: '4px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Overview
        </Title>
        <Text style={{ color: colors.text.tertiary, fontSize: '16px', fontWeight: 500 }}>
          Welcome back, {user?.name}! Here's what's happening today.
        </Text>
      </div>

      {/* Stats Row */}
      <Row gutter={[20, 20]} style={{ marginBottom: '32px' }}>
        {[
          { title: 'Total Chats', value: stats.totalChats, icon: <MessageSquare size={20} />, color: colors.primary.solid },
          { title: 'Messages Used', value: stats.messagesSent, icon: <Send size={20} />, color: colors.primary.solid },
          { title: 'Following', value: stats.following, icon: <UserPlus size={20} />, color: colors.primary.solid },
          { title: 'Unread Alerts', value: stats.unreadNotifications, icon: <Bell size={20} />, color: colors.primary.solid },
          ...(isPremium && tokenBalance !== undefined && tokenGrant !== undefined
            ? [{
              title: 'Tokens Remaining',
              value: tokenBalance,
              icon: <Flame size={20} />,
              color: colors.primary.solid,
              subtitle: tokensPerMessage ? `Burn ${tokensPerMessage}/msg` : undefined,
              footnote: `${tokenUsagePercentage}% used`
            }]
            : [])
        ].map((stat: any, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <motion.div variants={itemVariants}>
              <Card
                bordered={false}
                style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  border: `1px solid ${colors.gray[100]}`,
                  boxShadow: shadows.md,
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${stat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                    fontSize: '20px'
                  }}>
                    {stat.icon}
                  </div>
                  <div>
                    <Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {stat.title}
                    </Text>
                    <div style={{ color: colors.text.primary, fontSize: '24px', fontWeight: 900, letterSpacing: '-0.02em' }}>
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </div>
                    {stat.subtitle && (
                      <div style={{ color: colors.text.tertiary, fontSize: '11px', marginTop: '4px', fontWeight: 600 }}>
                        {stat.subtitle}
                      </div>
                    )}
                    {stat.footnote && (
                      <div style={{ color: colors.primary.solid, fontSize: '11px', marginTop: '2px', fontWeight: 700 }}>
                        {stat.footnote}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        {/* Left Column: Chats & Recommendations */}
        <Col xs={24} lg={15}>
          {/* Recent Conversations */}
          <motion.div variants={itemVariants} style={{ marginBottom: '24px' }}>
            <Card
              title={<span style={{ color: colors.text.primary, fontWeight: 800, fontSize: '18px' }}>💬 Recent Conversations</span>}
              extra={<Button type="link" onClick={() => navigate('/dashboard/chats')} style={{ color: colors.primary.solid, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>View All Chats <ArrowRight size={16} /></Button>}
              bordered={false}
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: `1px solid ${colors.gray[100]}`,
                boxShadow: shadows.md,
              }}
              bodyStyle={{ padding: '0' }}
            >
              {conversations.length > 0 ? (
                <div>
                  {conversations.map((conv, index) => (
                    <div
                      key={conv.id}
                      style={{
                        padding: '20px 24px',
                        borderBottom: index === conversations.length - 1 ? 'none' : `1px solid ${colors.gray[50]}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      className="chat-item-hover"
                      onClick={() => navigate(`/chat/${conv.creator?.id || conv.creatorId}`)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Avatar
                          size={54}
                          src={conv.creator?.profileImage ? getImageUrl(conv.creator.profileImage) : undefined}
                          style={{
                            border: `2px solid ${colors.primary.subtle}`,
                            background: !conv.creator?.profileImage ? colors.primary.solid : undefined,
                            color: '#fff',
                            fontWeight: 800
                          }}
                        >
                          {conv.creator?.displayName?.[0]?.toUpperCase()}
                        </Avatar>
                        <div>
                          <div style={{ color: colors.text.primary, fontWeight: 800, fontSize: '16px' }}>{conv.creator?.displayName}</div>
                          <div style={{ color: colors.text.secondary, fontSize: '14px', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                            "{conv.messages?.[0]?.content || 'Start a conversation...'}"
                          </div>
                          <div style={{ marginTop: '4px', fontSize: '11px', color: colors.text.tertiary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {conv._count?.messages || 0} messages
                          </div>
                        </div>
                      </div>
                      <Button
                        type="text"
                        style={{ color: colors.primary.solid, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        Continue Chat <ArrowRight size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <Text style={{ color: colors.text.tertiary, fontSize: '15px', fontWeight: 500 }}>No recent conversations. Start chatting with creators!</Text>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Recommended Creators */}
          <motion.div variants={itemVariants}>
            <Card
              title={<div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: colors.text.primary, fontWeight: 800, fontSize: '18px' }}>✨ Recommended For You</span>
                <span style={{ color: colors.text.tertiary, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Based on your usage</span>
              </div>}
              extra={<Button type="link" onClick={() => navigate('/creators')} style={{ color: colors.primary.solid, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>See All <ArrowRight size={16} /></Button>}
              bordered={false}
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: `1px solid ${colors.gray[100]}`,
                boxShadow: shadows.md,
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                  scrollSnapType: 'x mandatory'
                }}
                className="hide-scrollbar"
              >
                {recommendations.length > 0 ? recommendations.map((creator) => (
                  <div
                    key={creator.id}
                    style={{
                      minWidth: '220px',
                      background: colors.gray[50],
                      borderRadius: '20px',
                      padding: '24px 16px',
                      textAlign: 'center',
                      border: `1px solid ${colors.gray[100]}`,
                      scrollSnapAlign: 'start',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Avatar
                      size={70}
                      src={creator.profileImage ? getImageUrl(creator.profileImage) : undefined}
                      style={{
                        marginBottom: '12px',
                        border: `2px solid ${colors.primary.subtle}`,
                        background: !creator.profileImage ? colors.primary.solid : undefined,
                        color: '#fff',
                        fontWeight: 800
                      }}
                    >
                      {creator.displayName?.[0]?.toUpperCase()}
                    </Avatar>
                    <div style={{ color: colors.text.primary, fontWeight: 800, marginBottom: '4px', fontSize: '16px' }}>{creator.displayName}</div>
                    <div style={{ color: colors.text.tertiary, fontSize: '12px', marginBottom: '16px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{creator.category}</div>
                    <Button
                      type="primary"
                      size="small"
                      block
                      style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', border: 'none' }}
                      onClick={() => navigate(`/creator/${creator.id}`)}
                    >
                      View Profile
                    </Button>
                  </div>
                )) : (
                  <div style={{ width: '100%', textAlign: 'center', color: colors.text.tertiary, padding: '40px 0' }}>
                    No recommendations available at the moment.
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Right Column: Activity Feed */}
        <Col xs={24} lg={9}>
          <motion.div variants={itemVariants}>
            <Card
              title={<span style={{ color: colors.text.primary, fontWeight: 800, fontSize: '18px' }}>📰 Activity Feed</span>}
              bordered={false}
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: `1px solid ${colors.gray[100]}`,
                boxShadow: shadows.md,
                height: '100%'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {activities.length > 0 ? activities.map((activity) => (
                  <div key={activity.id} style={{ display: 'flex', gap: '16px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: colors.gray[50],
                      border: `1px solid ${colors.gray[100]}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0,
                      color: colors.primary.solid
                    }}>
                      {activity.icon}
                    </div>
                    <div>
                      <div style={{ color: colors.text.primary, fontWeight: 700, fontSize: '14px', lineHeight: '1.4' }}>
                        {activity.title}
                      </div>
                      <div style={{ color: colors.text.tertiary, fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        {activity.time}
                      </div>
                    </div>
                  </div>
                )) : (
                  <Text style={{ color: colors.text.tertiary, fontSize: '14px', fontWeight: 500 }}>No recent activity to show.</Text>
                )}
              </div>

            </Card>
          </motion.div>

          {/* Quick Actions / Tips */}
          <motion.div variants={itemVariants} style={{ marginTop: '24px' }}>
            <Card
              bordered={false}
              style={{
                background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
                border: `1px solid ${colors.primary.subtle}`,
                borderRadius: '24px',
                boxShadow: shadows.sm
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ color: colors.warning.solid, fontSize: '20px' }}><Star size={20} fill={colors.warning.solid} /></div>
                <Text style={{ color: colors.text.primary, fontWeight: 800, fontSize: '16px' }}>Premium Tip</Text>
              </div>
              <Text style={{ color: colors.text.secondary, fontSize: '14px', lineHeight: '1.6', display: 'block', fontWeight: 500 }}>
                Did you know? Premium members get 80% direct support to creators and early access to new AI models.
              </Text>
              <Button
                type="link"
                style={{ padding: 0, marginTop: '12px', color: colors.primary.solid, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => navigate('/dashboard/subscription')}
              >
                Learn More <ArrowRight size={16} />
              </Button>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .chat-item-hover:hover {
          background: ${colors.gray[50]};
        }
      `}</style>
    </motion.div>
  );
};

export default UserDashboard;
