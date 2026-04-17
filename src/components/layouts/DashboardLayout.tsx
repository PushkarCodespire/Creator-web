// ===========================================
// DASHBOARD LAYOUT
// ===========================================

import { useLocation, useNavigate, Outlet, Link } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, Drawer, Grid, Button as AntButton, type MenuProps } from 'antd';
import { LayoutDashboard, MessageSquare, Star, Users, CircleDollarSign, Settings, Search, Trophy, Globe, PenSquare, FileText, BarChart3, Lightbulb, Wallet, Box, Store, User, LogOut, Mail, Menu as MenuIcon, AlertCircle, Bot, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { getImageUrl, subscriptionApi } from '../../services/api';
import { colors, shadows } from '../../styles/tokens';
import DemoModeBanner from '../DemoModeBanner';
import { NotificationCenter } from '../notifications';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subscription, setSubscription] = useState<any>(user?.subscription || null);
  const isCreatorRejected = type === 'creator' && (user?.creator?.isRejected || user?.creator?.rejected);
  const creatorRejectionReason = user?.creator?.rejectionReason;
  const creatorRejectedAt = user?.creator?.rejectedAt;

  const isMobile = !screens.md;
  const _isAdmin = type === 'admin';

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
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

  const disableMenuItems = (items: MenuProps['items'] = []): MenuProps['items'] => {
    const next = (items || []).map((item) => {
      if (!item) return item;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const typed = item as any;
      if (typed.type === 'divider') return typed;
      if (typed.children) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { ...typed, disabled: true, children: disableMenuItems(typed.children as any) } as any;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...typed, disabled: true } as any;
    });
    return next as MenuProps['items'];
  };

  const getMenuItems = () => {
    const basePath = type === 'user' ? '/dashboard' : type === 'creator' ? '/creator-dashboard' : type === 'company' ? '/company-dashboard' : '/admin';

    switch (type) {
      case 'user':
        return [
          { key: basePath, icon: <LayoutDashboard size={18} />, label: <Link to={basePath}>Overview</Link> },
          { key: `${basePath}/chats`, icon: <MessageSquare size={18} />, label: <Link to={`${basePath}/chats`}>Chats</Link> },
          { key: `${basePath}/bookmarks`, icon: <Star size={18} />, label: <Link to={`${basePath}/bookmarks`}>Bookmarks</Link> },
          { key: `${basePath}/following`, icon: <Users size={18} />, label: <Link to={`${basePath}/following`}>Following</Link> },
          { key: `${basePath}/subscription`, icon: <CircleDollarSign size={18} />, label: <Link to={`${basePath}/subscription`}>Subscription</Link> },
          { key: `${basePath}/settings`, icon: <Settings size={18} />, label: <Link to={`${basePath}/settings`}>Settings</Link> },
          { type: 'divider' as const },
          { key: '/creators', icon: <Search size={18} />, label: <Link to="/creators">Browse Creators</Link> },
          { key: '/trending', icon: <Trophy size={18} />, label: <Link to="/trending">Leaderboard</Link> },
          { key: '/community', icon: <Globe size={18} />, label: <Link to="/community">Community</Link> }
        ];
      case 'creator':
        return [
          { key: basePath, icon: <LayoutDashboard size={18} />, label: <Link to={basePath}>Dashboard</Link> },
          { key: `${basePath}/posts`, icon: <PenSquare size={18} />, label: <Link to={`${basePath}/posts`}>Posts</Link> },
          { key: `${basePath}/content`, icon: <FileText size={18} />, label: <Link to={`${basePath}/content`}>Content</Link> },
          { key: `${basePath}/analytics`, icon: <BarChart3 size={18} />, label: <Link to={`${basePath}/analytics`}>Analytics</Link> },
          { key: `${basePath}/opportunities`, icon: <Lightbulb size={18} />, label: <Link to={`${basePath}/opportunities`}>Opportunities</Link> },
          { key: `${basePath}/payouts`, icon: <Wallet size={18} />, label: <Link to={`${basePath}/payouts`}>Payouts</Link> },
          { key: `${basePath}/settings`, icon: <Settings size={18} />, label: <Link to={`${basePath}/settings`}>Settings</Link> }
        ];
      case 'company':
        return [
          { key: basePath, icon: <LayoutDashboard size={18} />, label: <Link to={basePath}>Dashboard</Link> },
          { key: `${basePath}/opportunities`, icon: <Lightbulb size={18} />, label: <Link to={`${basePath}/opportunities`}>My Opportunities</Link> },
          { key: `${basePath}/deals`, icon: <Box size={18} />, label: <Link to={`${basePath}/deals`}>Manage Deals</Link> },
          { key: `${basePath}/discover`, icon: <Search size={18} />, label: <Link to={`${basePath}/discover`}>Discover Creators</Link> }
        ];
      case 'admin':
        return [
          { key: basePath, icon: <LayoutDashboard size={18} />, label: <Link to={basePath}>Dashboard</Link> },
          { key: `${basePath}/users`, icon: <Users size={18} />, label: <Link to={`${basePath}/users`}>Users</Link> },
          { key: `${basePath}/creators`, icon: <User size={18} />, label: <Link to={`${basePath}/creators`}>Creators</Link> },
          { key: `${basePath}/companies`, icon: <Store size={18} />, label: <Link to={`${basePath}/companies`}>Companies</Link> },
          { key: `${basePath}/deals`, icon: <Box size={18} />, label: <Link to={`${basePath}/deals`}>Deals</Link> },
          { key: `${basePath}/revenue`, icon: <CircleDollarSign size={18} />, label: <Link to={`${basePath}/revenue`}>Revenue</Link> },
          { key: `${basePath}/moderation`, icon: <AlertCircle size={18} />, label: <Link to={`${basePath}/moderation`}>Reports</Link> },
          { key: `${basePath}/ai-moderation`, icon: <Bot size={18} />, label: <Link to={`${basePath}/ai-moderation`}>AI Moderation</Link> },
          { key: `${basePath}/email-preview`, icon: <Mail size={18} />, label: <Link to={`${basePath}/email-preview`}>Email Preview</Link> }
        ];
      default:
        return [];
    }
  };

  const menuItems = isCreatorRejected && type === 'creator'
    ? disableMenuItems(getMenuItems())
    : getMenuItems();

  const userMenuItems = [
    { key: 'home', icon: <Home size={18} />, label: 'Back to Home', onClick: () => navigate('/') },
    { key: 'logout', icon: <LogOut size={18} />, label: 'Logout', onClick: handleLogout }
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
      background: '#ffffff',
      borderRight: `1px solid ${colors.gray[200]}`
    }}>
      {/* Suble Accent Glow */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '120%',
        height: '120%',
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(18, 104, 255, 0.03) 0%, transparent 50%)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
          >
            <img
              src="/Logo.png"
              alt="CodeSpire"
              style={{
                height: isMobile ? 26 : 30,
                width: 'auto',
                display: 'block'
              }}
            />
          </Link>
        </div>

        {(type === 'user' || type === 'creator') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              padding: '16px',
              background: colors.gray[50],
              borderRadius: '16px',
              border: `1px solid ${colors.gray[100]}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
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
                border: `2px solid ${colors.primary.subtle}`,
                background: !user?.avatar || avatarError ? colors.primary.solid : colors.gray[100],
                color: '#fff',
                fontWeight: 600
              }}
            >
              {user?.name?.[0]?.toUpperCase() || <User size={18} />}
            </Avatar>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                color: colors.text.primary,
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
                color: colors.primary.solid,
                fontWeight: 600,
                marginTop: '2px'
              }}>
                {subscription?.plan === 'PREMIUM' ? 'Premium Member' : subscription?.plan === 'FREE' ? 'Free Member' : 'Member'}
                {subscription?.plan === 'PREMIUM' && <Star size={10} style={{ color: colors.warning.solid }} />}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        className="dashboard-menu flagship-menu"
        items={menuItems}
        onClick={() => setMobileMenuOpen(false)}
        style={{ background: 'transparent', borderRight: 'none', paddingTop: '0' }}
      />

      <style>{`
        .flagship-menu .ant-menu-item {
          height: 44px !important;
          line-height: 44px !important;
          margin: 4px 16px !important;
          border-radius: 10px !important;
          color: ${colors.text.secondary} !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
        }
        .flagship-menu .ant-menu-item .ant-menu-title-content a {
          color: inherit !important;
        }
        .flagship-menu .ant-menu-item:hover {
          color: ${colors.primary.solid} !important;
          background: ${colors.primary.subtle} !important;
        }
        .flagship-menu .ant-menu-item-selected {
          background: ${colors.primary.solid} !important;
          color: #ffffff !important;
          box-shadow: ${shadows.md} !important;
        }
        .flagship-menu .ant-menu-item-selected a {
          color: #ffffff !important;
          font-weight: 600 !important;
        }
        .flagship-menu .ant-menu-item-selected .anticon,
        .flagship-menu .ant-menu-item-selected svg {
          color: #ffffff !important;
        }
        .flagship-menu .ant-menu-item-divider {
          margin: 16px 24px !important;
          border-color: ${colors.gray[100]} !important;
        }
      `}</style>
    </div >
  );

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: colors.background,
      }}
    >
      <DemoModeBanner />
      {!isMobile && (
        <Sider
          width={type === 'user' ? 240 : 260}
          style={{
            background: '#ffffff',
            borderRight: `1px solid ${colors.gray[200]}`,
            boxShadow: '4px 0 24px rgba(16, 24, 40, 0.02)',
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
          body: { padding: 0, background: '#ffffff' },
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
        background: colors.background,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Suble Decoration Spheres */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '600px',
          height: '600px',
          background: 'rgba(18, 104, 255, 0.03)',
          filter: 'blur(120px)',
          borderRadius: '50%',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <Header
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            padding: isMobile ? '0 16px' : '0 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${colors.gray[200]}`,
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
                icon={<MenuIcon size={20} style={{ color: colors.text.primary }} />}
                onClick={() => setMobileMenuOpen(true)}
                style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            )}
            <h2
              style={{
                margin: 0,
                fontSize: isMobile ? 18 : 20,
                fontWeight: 700,
                color: colors.text.primary,
                letterSpacing: '-0.02em',
              }}
            >
              {getTitle()}
            </h2>
          </div>
          <Space size={isMobile ? "middle" : "large"}>
            {(type === 'creator' || type === 'user') && (
              <NotificationCenter
                theme="light"
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
                    border: `1px solid ${colors.gray[200]}`,
                    background: !user?.avatar || avatarError ? colors.primary.solid : colors.gray[100],
                    color: '#fff',
                    fontWeight: 600
                  }}
                  size={isMobile ? "small" : "default"}
                >
                  {user?.name?.[0]?.toUpperCase() || <User size={isMobile ? 14 : 18} />}
                </Avatar>
                {!isMobile && (
                  <span style={{ fontWeight: 600, color: colors.text.secondary }}>
                    {user?.name || 'User'}
                  </span>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: isMobile ? '16px' : '32px',
            background: 'transparent',
            padding: 0,
            minHeight: 'calc(100vh - 128px)',
            position: 'relative',
            zIndex: 1
          }}
        >
          {isCreatorRejected && (
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  background: colors.error.subtle,
                  border: `1px solid ${colors.error.light}`,
                  color: colors.error.dark,
                  padding: '16px 20px',
                  borderRadius: '16px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>
                  Creator Application Rejected
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  {creatorRejectionReason || 'Your creator application was rejected.'}
                </div>
                {creatorRejectedAt && (
                  <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                    Rejected on {new Date(creatorRejectedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}
          <div style={{ position: 'relative' }}>
            {isCreatorRejected && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 5,
                  cursor: 'not-allowed',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            )}
            <div style={{ opacity: isCreatorRejected ? 0.6 : 1, pointerEvents: isCreatorRejected ? 'none' : 'auto' }}>
              <Outlet />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
