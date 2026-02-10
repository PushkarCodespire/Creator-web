import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Avatar, Button, Typography, Alert } from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  UserAddOutlined,
  ArrowRightOutlined,
  StarFilled,
  BellOutlined,
  TrophyOutlined,
  FireOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { userDashboardApi, subscriptionApi, getImageUrl } from '../../services/api';
import DashboardContentLoader from '../../components/common/DashboardContentLoader';

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
          let icon = <BellOutlined style={{ color: '#60A5FA' }} />;
          if (item.type === 'notification' && item.message?.includes('message')) {
            icon = <MessageOutlined style={{ color: '#10B981' }} />;
          } else if (item.type === 'follow') {
            icon = <UserAddOutlined style={{ color: '#F59E0B' }} />;
          } else if (item.type === 'ACHIEVEMENT') {
            icon = <TrophyOutlined style={{ color: '#FCD34D' }} />;
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
        }} onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }} />
      )}

      {user?.isSuspended && (
        <div style={{ marginBottom: '24px' }}>
          <Alert
            message={<span style={{ fontWeight: 700, color: '#EF4444' }}>Account Suspended</span>}
            description={
              <div style={{ color: '#F8FAFC' }}>
                <p style={{ marginBottom: '8px' }}>
                  Your account has been suspended until <strong>{user.suspendedUntil ? new Date(user.suspendedUntil).toLocaleDateString() : 'TBD'}</strong>.
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong>Reason:</strong> {user.suspensionReason || 'No reason provided'}
                </p>
                <p style={{ fontSize: '13px', opacity: 0.8 }}>
                  During suspension, you can view your dashboard but interactions are restricted. If you believe this is a mistake, please contact support.
                </p>
              </div>
            }
            type="error"
            showIcon
            style={{
              borderRadius: '20px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          />
        </div>
      )}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ color: '#fff', marginBottom: '4px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Overview
        </Title>
        <Text style={{ color: '#94A3B8', fontSize: '16px' }}>
          Welcome back, {user?.name}! Here's what's happening today.
        </Text>
      </div>

      {/* Stats Row */}
      <Row gutter={[20, 20]} style={{ marginBottom: '32px' }}>
        {[
          { title: 'Total Chats', value: stats.totalChats, icon: <MessageOutlined />, color: '#6366F1' },
          { title: 'Messages Used (Today)', value: stats.messagesSent, icon: <SendOutlined />, color: '#10B981' },
          { title: 'Following', value: stats.following, icon: <UserAddOutlined />, color: '#F59E0B' },
          { title: 'Unread Alerts', value: stats.unreadNotifications, icon: <BellOutlined />, color: '#EC4899' },
          ...(isPremium && tokenBalance !== undefined && tokenGrant !== undefined
            ? [{
              title: 'Tokens Remaining',
              value: tokenBalance,
              icon: <FireOutlined />,
              color: '#22C55E',
              subtitle: tokensPerMessage ? `Burn ${tokensPerMessage}/msg` : undefined,
              footnote: `${tokenUsagePercentage}% used`
            }]
            : [])
        ].map((stat: any, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <motion.div variants={itemVariants}>
              <Card
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px',
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
                    <Text style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {stat.title}
                    </Text>
                    <div style={{ color: '#fff', fontSize: '24px', fontWeight: 800 }}>
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </div>
                    {stat.subtitle && (
                      <div style={{ color: '#94A3B8', fontSize: '11px', marginTop: '4px' }}>
                        {stat.subtitle}
                      </div>
                    )}
                    {stat.footnote && (
                      <div style={{ color: '#64748B', fontSize: '11px', marginTop: '2px' }}>
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
              title={<span style={{ color: '#fff', fontWeight: 700 }}>💬 Recent Conversations</span>}
              extra={<Button type="link" onClick={() => navigate('/dashboard/chats')} style={{ color: '#818CF8' }}>View All Chats <ArrowRightOutlined /></Button>}
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '24px',
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
                        borderBottom: index === conversations.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      className="chat-item-hover"
                      onClick={() => navigate(`/chat/${conv.creatorId}`)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Avatar
                          size={54}
                          src={conv.creator?.profileImage ? getImageUrl(conv.creator.profileImage) : undefined}
                          style={{
                            border: '2px solid rgba(102, 126, 234, 0.3)',
                            background: !conv.creator?.profileImage ? '#6366F1' : undefined,
                            color: '#fff',
                            fontWeight: 600
                          }}
                        >
                          {conv.creator?.displayName?.[0]?.toUpperCase()}
                        </Avatar>
                        <div>
                          <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>{conv.creator?.displayName}</div>
                          <div style={{ color: '#94A3B8', fontSize: '14px', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            "{conv.messages?.[0]?.content || 'Start a conversation...'}"
                          </div>
                          <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748B' }}>
                            {conv._count?.messages || 0} messages
                          </div>
                        </div>
                      </div>
                      <Button
                        type="text"
                        style={{ color: '#818CF8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        Continue Chat <ArrowRightOutlined />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <Text style={{ color: '#94A3B8' }}>No recent conversations. Start chatting with creators!</Text>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Recommended Creators */}
          <motion.div variants={itemVariants}>
            <Card
              title={<div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#fff', fontWeight: 700 }}>✨ Recommended For You</span>
                <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 400 }}>Based on your usage</span>
              </div>}
              extra={<Button type="link" onClick={() => navigate('/creators')} style={{ color: '#818CF8' }}>See All <ArrowRightOutlined /></Button>}
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '24px',
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
                      minWidth: '200px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '20px',
                      padding: '16px',
                      textAlign: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      scrollSnapAlign: 'start'
                    }}
                  >
                    <Avatar
                      size={70}
                      src={creator.profileImage ? getImageUrl(creator.profileImage) : undefined}
                      style={{
                        marginBottom: '12px',
                        border: '2px solid rgba(102, 126, 234, 0.3)',
                        background: !creator.profileImage ? '#6366F1' : undefined,
                        color: '#fff',
                        fontWeight: 600
                      }}
                    >
                      {creator.displayName?.[0]?.toUpperCase()}
                    </Avatar>
                    <div style={{ color: '#fff', fontWeight: 700, marginBottom: '4px' }}>{creator.displayName}</div>
                    <div style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '12px' }}>{creator.category}</div>
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
                  <div style={{ width: '100%', textAlign: 'center', color: '#94A3B8' }}>
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
              title={<span style={{ color: '#fff', fontWeight: 700 }}>📰 Activity Feed</span>}
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '24px',
                height: '100%'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {activities.length > 0 ? activities.map((activity) => (
                  <div key={activity.id} style={{ display: 'flex', gap: '16px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0
                    }}>
                      {activity.icon}
                    </div>
                    <div>
                      <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '14px', lineHeight: '1.4' }}>
                        {activity.title}
                      </div>
                      <div style={{ color: '#64748B', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {activity.time}
                      </div>
                    </div>
                  </div>
                )) : (
                  <Text style={{ color: '#94A3B8' }}>No recent activity to show.</Text>
                )}
              </div>

            </Card>
          </motion.div>

          {/* Quick Actions / Tips */}
          <motion.div variants={itemVariants} style={{ marginTop: '24px' }}>
            <Card
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ color: '#FCD34D', fontSize: '20px' }}><StarFilled /></div>
                <Text style={{ color: '#fff', fontWeight: 700 }}>Premium Tip</Text>
              </div>
              <Text style={{ color: '#CBD5E1', fontSize: '14px', lineHeight: '1.6', display: 'block' }}>
                Did you know? Premium members get 80% direct support to creators and early access to new AI models.
              </Text>
              <Button
                type="link"
                style={{ padding: 0, marginTop: '12px', color: '#818CF8', fontWeight: 600 }}
                onClick={() => navigate('/dashboard/subscription')}
              >
                Learn More <ArrowRightOutlined />
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
          background: rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </motion.div>
  );
};

export default UserDashboard;
