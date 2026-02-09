// ===========================================
// DASHBOARD LAYOUT
// ===========================================

import { useLocation, useNavigate, Outlet, Link } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, Drawer, Grid, Button as AntButton } from 'antd';
import {
  DashboardOutlined, MessageOutlined, FileTextOutlined, BarChartOutlined,
  SettingOutlined, ShopOutlined, TeamOutlined, UserOutlined, LogoutOutlined,
  SearchOutlined, BulbOutlined, HomeOutlined, DollarOutlined, ContainerOutlined,
  WalletOutlined, MailOutlined, MenuOutlined, StarOutlined, TrophyOutlined,
  ReadOutlined, GlobalOutlined, WarningOutlined, RobotOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { getImageUrl, subscriptionApi } from '../../services/api';
import DemoModeBanner from '../DemoModeBanner';
import { NotificationCenter } from '../notifications';
import '../../styles/AdminPanel.css';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

interface DashboardLayoutProps {
  type: 'user' | 'creator' | 'company' | 'admin';
}

const DashboardLayout = ({ type }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const screens = useBreakpoint();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [subscription, setSubscription] = useState<any>(user?.subscription || null);

  const isMobile = !screens.md;
  const isAdmin = type === 'admin';

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  useEffect(() => {
    if (type !== 'user') return;
    let isMounted = true;
    const fetchSubscription = async () => {
      try {
        const response = await subscriptionApi.getCurrent();
        if (isMounted) {
          setSubscription(response.data.data || null);
        }
      } catch (error) {
        // Fall back to user subscription data if API fails
        if (isMounted) {
          setSubscription(user?.subscription || null);
        }
      }
    };
    fetchSubscription();
    return () => {
      isMounted = false;
    };
  }, [type, user?.subscription]);

  // Ensure mobile menu is closed when switching to desktop view
  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getMenuItems = () => {
    const basePath = type === 'user' ? '/dashboard' : type === 'creator' ? '/creator-dashboard' : type === 'company' ? '/company-dashboard' : '/admin';

    switch (type) {
      case 'user':
        return [
          { key: basePath, icon: <DashboardOutlined />, label: <Link to={basePath}>Overview</Link> },
          { key: `${basePath}/chats`, icon: <MessageOutlined />, label: <Link to={`${basePath}/chats`}>Chats</Link> },
          { key: `${basePath}/bookmarks`, icon: <StarOutlined />, label: <Link to={`${basePath}/bookmarks`}>Bookmarks</Link> },
          { key: `${basePath}/following`, icon: <TeamOutlined />, label: <Link to={`${basePath}/following`}>Following</Link> },
          { key: `${basePath}/subscription`, icon: <DollarOutlined />, label: <Link to={`${basePath}/subscription`}>Subscription</Link> },
          { key: `${basePath}/settings`, icon: <SettingOutlined />, label: <Link to={`${basePath}/settings`}>Settings</Link> },
          { type: 'divider' as const },
          { key: '/creators', icon: <SearchOutlined />, label: <Link to="/creators">Browse Creators</Link> },
          { key: '/trending', icon: <TrophyOutlined />, label: <Link to="/trending">Leaderboard</Link> },
          { key: '/feed', icon: <ReadOutlined />, label: <Link to="/feed">Feed</Link> },
          { key: '/community', icon: <GlobalOutlined />, label: <Link to="/community">Community</Link> }
        ];
      case 'creator':
        return [
          { key: basePath, icon: <DashboardOutlined />, label: <Link to={basePath}>Dashboard</Link> },
          { key: `${basePath}/content`, icon: <FileTextOutlined />, label: <Link to={`${basePath}/content`}>Content</Link> },
          { key: `${basePath}/analytics`, icon: <BarChartOutlined />, label: <Link to={`${basePath}/analytics`}>Analytics</Link> },
          { key: `${basePath}/opportunities`, icon: <BulbOutlined />, label: <Link to={`${basePath}/opportunities`}>Opportunities</Link> },
          { key: `${basePath}/payouts`, icon: <WalletOutlined />, label: <Link to={`${basePath}/payouts`}>Payouts</Link> },
          { key: `${basePath}/settings`, icon: <SettingOutlined />, label: <Link to={`${basePath}/settings`}>Settings</Link> }
        ];
      case 'company':
        return [
          { key: basePath, icon: <DashboardOutlined />, label: <Link to={basePath}>Dashboard</Link> },
          { key: `${basePath}/opportunities`, icon: <BulbOutlined />, label: <Link to={`${basePath}/opportunities`}>My Opportunities</Link> },
          { key: `${basePath}/deals`, icon: <ContainerOutlined />, label: <Link to={`${basePath}/deals`}>Manage Deals</Link> },
          { key: `${basePath}/discover`, icon: <SearchOutlined />, label: <Link to={`${basePath}/discover`}>Discover Creators</Link> }
        ];
      case 'admin':
        return [
          { key: basePath, icon: <DashboardOutlined />, label: <Link to={basePath}>Dashboard</Link> },
          { key: `${basePath}/users`, icon: <TeamOutlined />, label: <Link to={`${basePath}/users`}>Users</Link> },
          { key: `${basePath}/creators`, icon: <UserOutlined />, label: <Link to={`${basePath}/creators`}>Creators</Link> },
          { key: `${basePath}/deals`, icon: <ContainerOutlined />, label: <Link to={`${basePath}/deals`}>Deals</Link> },
          { key: `${basePath}/revenue`, icon: <DollarOutlined />, label: <Link to={`${basePath}/revenue`}>Revenue</Link> },
          { key: `${basePath}/moderation`, icon: <WarningOutlined />, label: <Link to={`${basePath}/moderation`}>Reports</Link> },
          { key: `${basePath}/ai-moderation`, icon: <RobotOutlined />, label: <Link to={`${basePath}/ai-moderation`}>AI Moderation</Link> },
          { key: `${basePath}/email-preview`, icon: <MailOutlined />, label: <Link to={`${basePath}/email-preview`}>Email Preview</Link> }
        ];
      default:
        return [];
    }
  };

  const userMenuItems = [
    { key: 'home', icon: <HomeOutlined />, label: 'Back to Home', onClick: () => navigate('/') },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout }
  ];

  const getTitle = () => {
    switch (type) {
      case 'user': return 'User Dashboard';
      case 'creator': return 'Creator Dashboard';
      case 'company': return 'Company Dashboard';
      case 'admin': return 'Admin Panel';
      default: return 'Dashboard';
    }
  };

  const sideMenu = (
    <div style={{
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: isAdmin
        ? 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)'
        : 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)'
    }}>
      {/* Subtle Mesh Glow */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '120%',
        height: '120%',
        backgroundImage: isAdmin
          ? 'radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.12) 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div
        style={{
          padding: isMobile ? '24px 20px' : '32px 24px',
          textAlign: 'left',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: isMobile ? 18 : 22,
              fontWeight: 800,
              backgroundImage: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{
              width: isMobile ? 28 : 32,
              height: isMobile ? 28 : 32,
              background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: isMobile ? '16px' : '18px'
            }}>AI</div>
            <span>Platform</span>
          </Link>
        </div>

        {type === 'user' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}
          >
            <Avatar
              size={44}
              src={!avatarError && user?.avatar ? getImageUrl(user.avatar) : undefined}
              onError={() => {
                setAvatarError(true);
                return false;
              }}
              style={{
                border: '2px solid rgba(102, 126, 234, 0.3)',
                background: !user?.avatar || avatarError ? '#6366F1' : '#1E293B',
                color: '#fff',
                fontWeight: 600
              }}
            >
              {user?.name?.[0]?.toUpperCase() || <UserOutlined />}
            </Avatar>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                color: '#F8FAFC',
                fontWeight: 700,
                fontSize: '14px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2
              }}>
                {user?.name || 'User'}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#818CF8',
                fontWeight: 600,
                marginTop: '2px'
              }}>
                {subscription?.plan === 'PREMIUM' ? 'Premium Member' : subscription?.plan === 'FREE' ? 'Free Member' : 'Member'}
                {subscription?.plan === 'PREMIUM' && <StarOutlined style={{ fontSize: '10px', color: '#FCD34D' }} />}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        className={`dashboard-menu ${isAdmin ? 'admin-menu' : ''}`}
        items={getMenuItems()}
        onClick={() => setMobileMenuOpen(false)}
        style={{ background: 'transparent', borderRight: 'none', paddingTop: '8px' }}
      />

      <style>{`
        .admin-menu .ant-menu-item {
          color: #94A3B8 !important;
        }
        .admin-menu .ant-menu-item:hover {
          color: #F8FAFC !important;
          background: rgba(255, 255, 255, 0.05) !important;
        }
        .admin-menu .ant-menu-item-selected {
          background: linear-gradient(90deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%) !important;
          color: #F8FAFC !important;
          border: 1px solid rgba(102, 126, 234, 0.3);
        }
        .admin-menu .ant-menu-item-selected a,
        .admin-menu .ant-menu-item-selected span,
        .admin-menu .ant-menu-item-selected .anticon {
          color: #F8FAFC !important;
        }
        .dashboard-menu .ant-menu-item {
          height: 48px !important;
          line-height: 48px !important;
          margin: 4px 16px !important;
          border-radius: 12px !important;
          color: #94A3B8 !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
        }
        .dashboard-menu .ant-menu-item:hover {
          color: #F8FAFC !important;
          background: rgba(255, 255, 255, 0.05) !important;
        }
        .dashboard-menu .ant-menu-item-selected {
          background: linear-gradient(90deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%) !important;
          color: #F8FAFC !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.2);
        }
        .dashboard-menu .ant-menu-item-selected .anticon {
          color: #818CF8 !important;
        }
      `}</style>
    </div>
  );

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: isAdmin ? '#e6ebf8' : '#020617',
      }}
    >
      <DemoModeBanner />
      {!isMobile && (
        <Sider
          width={type === 'user' ? 240 : 260}
          style={{
            background: isAdmin
              ? 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)'
              : 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
            borderRight: isAdmin ? '1px solid rgba(102, 126, 234, 0.15)' : '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: isAdmin ? '6px 0 24px rgba(15, 23, 42, 0.08)' : '4px 0 24px rgba(0, 0, 0, 0.2)',
            position: 'fixed',
            height: '100vh',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
          }}
        >
          {sideMenu}
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{
          body: { padding: 0, background: isAdmin ? '#0F172A' : '#0F172A' },
          mask: { backdropFilter: 'blur(4px)' }
        }}
        width={260}
        closable={false}
      >
        {sideMenu}
      </Drawer>

      <Layout style={{
        marginLeft: isMobile ? 0 : (type === 'user' ? 240 : 260),
        minHeight: '100vh',
        background: isAdmin
          ? 'linear-gradient(135deg, #e1e6f6 0%, #d4dbf1 100%)'
          : 'linear-gradient(135deg, #020617 0%, #0F172A 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Neural Decoration Spheres */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '600px',
          height: '600px',
          background: isAdmin ? 'rgba(102, 126, 234, 0.26)' : 'rgba(99, 102, 241, 0.08)',
          filter: 'blur(120px)',
          borderRadius: '50%',
          zIndex: 0,
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-5%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: isAdmin ? 'rgba(118, 75, 162, 0.22)' : 'rgba(168, 85, 247, 0.05)',
          filter: 'blur(100px)',
          borderRadius: '50%',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <Header
          style={{
            background: isAdmin ? 'rgba(230, 235, 248, 0.95)' : 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            padding: isMobile ? '0 16px' : '0 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: isAdmin ? '1px solid rgba(102, 126, 234, 0.12)' : '1px solid rgba(255, 255, 255, 0.05)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            height: '64px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <AntButton
                type="text"
                icon={<MenuOutlined style={{ fontSize: '18px', color: '#FFFFFF' }} />}
                onClick={() => setMobileMenuOpen(true)}
                style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            )}
            <h2
              style={{
                margin: 0,
                fontSize: isMobile ? 18 : 22,
                fontWeight: 800,
                color: isAdmin ? '#1f2a44' : '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              {getTitle()}
            </h2>
          </div>
          <Space size={isMobile ? "middle" : "large"}>
            {type === 'creator' && (
              <NotificationCenter
                theme="dark"
                title="Notifications"
                emptyText="No notifications yet"
              />
            )}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  src={!avatarError && user?.avatar ? getImageUrl(user.avatar) : undefined}
                  onError={() => {
                    setAvatarError(true);
                    return false;
                  }}
                  style={{
                    border: isAdmin ? '2px solid rgba(102, 126, 234, 0.4)' : '2px solid rgba(99, 102, 241, 0.4)',
                    background: !user?.avatar || avatarError ? (isAdmin ? '#1E293B' : '#6366F1') : undefined,
                    color: '#fff',
                    fontWeight: 600
                  }}
                  size={isMobile ? "small" : "default"}
                >
                  {user?.name?.[0]?.toUpperCase() || <UserOutlined />}
                </Avatar>
                {!isMobile && (
                  <span style={{ fontWeight: 600, color: isAdmin ? '#4b5563' : '#94A3B8' }}>
                    {user?.name || 'User'}
                  </span>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: isMobile ? '16px' : '24px 32px',
            background: 'transparent',
            padding: 0,
            minHeight: 'calc(100vh - 64px)',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
