// ===========================================
// MAIN LAYOUT (Public Pages)
// ===========================================

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Space, Drawer, Input } from 'antd';
import {
  User,
  LogOut,
  LayoutDashboard,
  Menu as MenuIcon,
  X,
  Twitter,
  Linkedin,
  Github,
  Mail,
  ShieldCheck,
  Lock,
  Bell,
  Search,
  Sparkles
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import DemoModeBanner from '../DemoModeBanner';
import MobileNav from './MobileNav';
import { NotificationCenter } from '../notifications';
import ErrorBoundary from '../common/ErrorBoundary';
import { getImageUrl } from '../../services/api';
import { colors, shadows, borderRadius, typography } from '../../styles/tokens';

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'CREATOR': return '/creator-dashboard';
      case 'COMPANY': return '/company-dashboard';
      case 'ADMIN': return '/admin';
      default: return '/dashboard';
    }
  };

  const userMenuItems = [
    {
      key: 'dashboard',
      icon: <LayoutDashboard size={14} />,
      label: 'Dashboard',
      onClick: () => navigate(getDashboardPath())
    },
    {
      key: 'logout',
      icon: <LogOut size={14} />,
      label: 'Logout',
      onClick: handleLogout
    }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (location.pathname === '/') {
      scrollToSection(id);
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <DemoModeBanner />
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${colors.gray[200]}`,
          padding: isMobile ? '0 16px' : '0 40px',
          position: 'sticky',
          top: 0,
          width: '100%',
          zIndex: 1000,
          height: '72px',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '20px',
              fontWeight: 800,
              color: colors.primary.solid,
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
            className="brand-logo"
          >
            <img
              src="/Logo.png"
              alt="CodeSpire"
              style={{
                height: 48, // Slightly larger height for the logo image
                width: 'auto',
                display: 'block'
              }}
            />
          </Link>

          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <nav style={{ display: 'flex', gap: 4 }}>
              <a
                href="#features"
                onClick={(e) => handleNavClick(e, 'features')}
                className="nav-link"
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  color: '#475467',
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => handleNavClick(e, 'how-it-works')}
                className="nav-link"
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  color: '#475467',
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                How it works
              </a>
              <a
                href="#pricing"
                onClick={(e) => handleNavClick(e, 'pricing')}
                className="nav-link"
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  color: '#475467',
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                Pricing
              </a>
              <Link
                to="/creators"
                className="nav-link"
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  color: '#475467',
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                Explore
              </Link>
            </nav>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {isAuthenticated ? (
            <Space size="middle" className="hide-mobile">
              <NotificationCenter />
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }} className="user-dropdown-trigger">
                  <Avatar
                    src={user?.avatar ? getImageUrl(user.avatar) : undefined}
                    size={32}
                    style={{
                      border: `2px solid ${colors.primary.subtle}`,
                      backgroundColor: colors.primary.solid,
                    }}
                  >
                    {user?.name?.[0]?.toUpperCase() || <User size={16} />}
                  </Avatar>
                  <span style={{ fontWeight: 600, color: '#101828', fontSize: '14px' }}>{user?.name}</span>
                </div>
              </Dropdown>
            </Space>
          ) : (
            <Space size={12} className="hide-mobile">
              <Button
                type="text"
                onClick={() => navigate('/login')}
                style={{
                  color: '#475467',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                Log in
              </Button>
              <Button
                type="primary"
                onClick={() => navigate('/register')}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  borderRadius: '8px',
                  background: colors.primary.solid,
                  fontWeight: 600,
                  fontSize: '14px',
                  boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
                }}
              >
                Get started
              </Button>
            </Space>
          )}

          <button
            className="hide-desktop"
            onClick={() => setMobileNavOpen(true)}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#101828',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <MenuIcon size={24} />
          </button>
        </div>
      </Header>

      <Drawer
        placement="right"
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        width={280}
        closeIcon={<X size={20} />}
        styles={{ body: { padding: '24px 16px' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to="/" onClick={() => setMobileNavOpen(false)} style={{
            fontSize: '18px', fontWeight: 700, color: colors.primary.solid, marginBottom: 24
          }}>
            CodeSpire
          </Link>

          <Menu
            mode="inline"
            selectable={false}
            style={{ border: 'none' }}
            items={[
              { key: 'features', label: 'Features', onClick: () => { setMobileNavOpen(false); navigate('/#features'); } },
              { key: 'how', label: 'How it works', onClick: () => { setMobileNavOpen(false); navigate('/#how-it-works'); } },
              { key: 'pricing', label: 'Pricing', onClick: () => { setMobileNavOpen(false); navigate('/#pricing'); } },
              { key: 'explore', label: 'Explore creators', onClick: () => { setMobileNavOpen(false); navigate('/creators'); } },
            ]}
          />

          <div style={{ marginTop: 24, padding: '0 12px' }}>
            {isAuthenticated ? (
              <Button type="primary" block onClick={() => { navigate(getDashboardPath()); setMobileNavOpen(false); }}>
                Go to dashboard
              </Button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Button block onClick={() => { navigate('/login'); setMobileNavOpen(false); }}>Log in</Button>
                <Button type="primary" block onClick={() => { navigate('/register'); setMobileNavOpen(false); }}>Get started</Button>
              </div>
            )}
          </div>
        </div>
      </Drawer>

      <Content>
        <Outlet />
      </Content>

      <Footer
        style={{
          background: '#0B1120',
          color: '#94a3b8',
          padding: '80px 40px 40px',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr 1.5fr',
              gap: 48,
              marginBottom: 64,
            }}
          >
            <div>
              <div style={{ marginBottom: 24 }}>
                <img src="/Logo.png" alt="CodeSpire" style={{ height: 48, width: 'auto', filter: 'brightness(0) invert(1)' }} />
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                The leading platform for creators to tokenize their expertise into 24/7 AI-powered experiences.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                {[Twitter, Linkedin, Github].map((Icon, i) => (
                  <a key={i} href="#" style={{
                    width: 36, height: 36, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', transition: 'all 0.2s'
                  }}>
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Pricing', 'API', 'Status'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Terms', 'Privacy', 'Cookies', 'Licenses'] }
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px', marginBottom: 20 }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map(link => (
                    <li key={link}><a href="#" style={{ color: '#94a3b8', fontSize: '14px' }}>{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h4 style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px', marginBottom: 20 }}>Subscribe to updates</h4>
              <p style={{ fontSize: 13, marginBottom: 16 }}>Stay up to date with the latest features and releases.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  placeholder="Email address"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    borderRadius: '8px'
                  }}
                />
                <Button type="primary" style={{ borderRadius: '8px' }}>Join</Button>
              </div>
            </div>
          </div>

          <div style={{
            paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px'
          }}>
            <span>© {new Date().getFullYear()} CodeSpire. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 24 }}>
              <a href="#" style={{ color: '#94a3b8' }}>Privacy</a>
              <a href="#" style={{ color: '#94a3b8' }}>Terms</a>
            </div>
          </div>
        </div>
      </Footer>
      <MobileNav />

      <style>{`
        .nav-link:hover {
          background-color: ${colors.gray[100]};
          color: ${colors.primary.solid} !important;
        }
        .user-dropdown-trigger:hover {
          background-color: ${colors.gray[50]};
        }
        .brand-logo:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
      `}</style>
    </Layout>
  );
};

export default MainLayout;
