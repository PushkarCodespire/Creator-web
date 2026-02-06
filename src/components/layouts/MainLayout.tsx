// ===========================================
// MAIN LAYOUT (Public Pages)
// ===========================================

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Space, Drawer, Input } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined, MenuOutlined, CloseOutlined, TwitterOutlined, LinkedinOutlined, GithubOutlined, MailOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import DemoModeBanner from '../DemoModeBanner';
import MobileNav from './MobileNav';
import { NotificationCenter } from '../notifications';
import ErrorBoundary from '../common/ErrorBoundary';
import { BellOutlined } from '@ant-design/icons';
import { getImageUrl } from '../../services/api';
import { colors } from '../../styles/tokens';

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
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
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard', onClick: () => navigate(getDashboardPath()) },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <DemoModeBanner />
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '24px',
          padding: '0 32px',
          position: 'sticky',
          top: 12,
          margin: '12px auto',
          width: isMobile ? 'calc(100% - 24px)' : 'calc(100% - 48px)',
          maxWidth: '1440px',
          zIndex: 1000,
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="flagship-header"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            to="/"
            style={{
              fontSize: '22px',
              fontWeight: 800,
              backgroundImage: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginRight: 24,
              letterSpacing: '-0.03em',
              whiteSpace: 'nowrap',
              filter: 'drop-shadow(0 2px 4px rgba(118, 75, 162, 0.15))',
              transition: 'all 0.3s ease',
            }}
            className="brand-logo"
          >
            AI Creator Platform
          </Link>
          <style>{`
            .brand-logo:hover {
              transform: skewX(-2deg) scale(1.02);
              filter: drop-shadow(0 4px 8px rgba(118, 75, 162, 0.25));
            }
            .flagship-header {
              animation: headerEntry 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes headerEntry {
              0% { opacity: 0; transform: translateY(-20px) scale(0.98); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            .nav-link {
              position: relative;
              color: #4B5563 !important;
              font-weight: 600 !important;
              padding: 0 4px !important;
              margin: 0 12px !important;
              transition: all 0.3s ease !important;
            }
            .nav-link:hover {
              color: #764BA2 !important;
              transform: translateY(-1px);
            }
            .nav-link::after {
              content: '';
              position: absolute;
              bottom: 12px;
              left: 50%;
              width: 0;
              height: 2px;
              background: linear-gradient(90deg, #667EEA, #764BA2);
              transition: all 0.3s ease;
              transform: translateX(-50%);
              border-radius: 2px;
            }
            .nav-link:hover::after {
              width: 80%;
            }
          `}</style>
          <div className="hide-mobile">
            <Menu
              mode="horizontal"
              style={{ border: 'none', background: 'transparent' }}
              selectedKeys={[]}
            >
              <Menu.Item key="features" className="nav-link">
                <a
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    const scrollToSection = (id: string) => {
                      const element = document.getElementById(id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    };

                    if (window.location.pathname === '/') {
                      scrollToSection('features');
                    } else {
                      navigate('/');
                      setTimeout(() => scrollToSection('features'), 100);
                    }
                  }}
                >
                  Features
                </a>
              </Menu.Item>
              <Menu.Item key="how-it-works" className="nav-link">
                <a
                  href="#how-it-works"
                  onClick={(e) => {
                    e.preventDefault();
                    const scrollToSection = (id: string) => {
                      const element = document.getElementById(id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    };

                    if (window.location.pathname === '/') {
                      scrollToSection('how-it-works');
                    } else {
                      navigate('/');
                      setTimeout(() => scrollToSection('how-it-works'), 100);
                    }
                  }}
                >
                  How it works
                </a>
              </Menu.Item>
              <Menu.Item key="pricing" className="nav-link">
                <a
                  href="#pricing"
                  onClick={(e) => {
                    e.preventDefault();
                    const scrollToSection = (id: string) => {
                      const element = document.getElementById(id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    };

                    if (window.location.pathname === '/') {
                      scrollToSection('pricing');
                    } else {
                      navigate('/');
                      setTimeout(() => scrollToSection('pricing'), 100);
                    }
                  }}
                >
                  Pricing
                </a>
              </Menu.Item>
              <Menu.Item key="creators" className="nav-link">
                <Link to="/creators">Explore creators</Link>
              </Menu.Item>
            </Menu>
          </div>
        </div>

        <Space size="middle" className="hide-mobile">
          {isAuthenticated ? (
            <>
              <ErrorBoundary
                fallback={
                  <BellOutlined
                    style={{
                      fontSize: 22,
                      color: '#6B7280',
                      cursor: 'pointer',
                    }}
                  />
                }
              >
                <NotificationCenter />
              </ErrorBoundary>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar
                    src={user?.avatar ? getImageUrl(user.avatar) : undefined}
                    style={{
                      backgroundColor: !user?.avatar ? colors.primary.solid : undefined,
                      color: '#fff',
                      fontWeight: 600
                    }}
                  >
                    {user?.name?.[0]?.toUpperCase() || <UserOutlined />}
                  </Avatar>
                  <span>{user?.name}</span>
                </Space>
              </Dropdown>
            </>
          ) : (
            <Space>
              <Button
                type="text"
                onClick={() => navigate('/login')}
                style={{
                  color: '#1F2937',
                  fontWeight: 500,
                }}
              >
                Log in
              </Button>
              <Button
                type="primary"
                onClick={() => navigate('/register')}
                style={{
                  borderRadius: 9999,
                  backgroundImage: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                  border: 'none',
                  boxShadow: '0 10px 15px rgba(102, 126, 234, 0.25)',
                  color: '#E5E7EB',
                }}
              >
                Get started
              </Button>
            </Space>
          )}
        </Space>

        {/* Mobile hamburger */}
        <button
          className="hide-desktop"
          onClick={() => setMobileNavOpen(true)}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 8,
          }}
          aria-label="Open navigation"
        >
          <MenuOutlined style={{ fontSize: 20, color: '#111827' }} />
        </button>
      </Header>

      {/* Mobile side navigation */}
      <Drawer
        placement="left"
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        width={260}
        bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 700 }}>AI Creator Platform</span>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setMobileNavOpen(false)}
          />
        </div>
        <Menu
          mode="inline"
          selectable={false}
          items={[
            {
              key: 'features',
              label: 'Features',
              onClick: () => {
                setMobileNavOpen(false);
                setTimeout(() => {
                  const element = document.getElementById('features');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    navigate('/#features');
                  }
                }, 100);
              }
            },
            {
              key: 'how-it-works',
              label: 'How it works',
              onClick: () => {
                setMobileNavOpen(false);
                setTimeout(() => {
                  const element = document.getElementById('how-it-works');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    navigate('/#how-it-works');
                  }
                }, 100);
              }
            },
            {
              key: 'pricing',
              label: 'Pricing',
              onClick: () => {
                setMobileNavOpen(false);
                setTimeout(() => {
                  const element = document.getElementById('pricing');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    navigate('/#pricing');
                  }
                }, 100);
              }
            },
            { key: 'creators', label: 'Explore creators', onClick: () => { navigate('/creators'); setMobileNavOpen(false); } },
          ]}
        />
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {isAuthenticated ? (
            <Button
              type="primary"
              block
              onClick={() => {
                navigate(getDashboardPath());
                setMobileNavOpen(false);
              }}
            >
              Go to dashboard
            </Button>
          ) : (
            <>
              <Button
                block
                onClick={() => {
                  navigate('/login');
                  setMobileNavOpen(false);
                }}
              >
                Log in
              </Button>
              <Button
                type="primary"
                block
                onClick={() => {
                  navigate('/register');
                  setMobileNavOpen(false);
                }}
              >
                Get started
              </Button>
            </>
          )}
        </div>
      </Drawer>

      <Content
        style={{
          background:
            'radial-gradient(circle at top left, rgba(102,126,234,0.08), transparent 55%), radial-gradient(circle at top right, rgba(118,75,162,0.06), transparent 55%), #FAFBFC',
        }}
      >
        <Outlet />
      </Content>

      <Footer
        style={{
          background: 'linear-gradient(180deg, #0B1120 0%, #020617 100%)',
          borderTop: '1px solid rgba(148,163,184,0.2)',
          color: '#E5E7EB',
          padding: '64px 24px 32px',
        }}
      >
        <div className="container">
          {/* Main Footer Content */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr 1.5fr',
              gap: isMobile ? 32 : 48,
              marginBottom: 48,
            }}
          >
            {/* Brand Column */}
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 12,
                  backgroundImage: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}
              >
                AI Creator Platform
              </div>
              <p style={{ fontSize: 14, color: '#9CA3AF', maxWidth: 280, lineHeight: 1.6, marginBottom: 20 }}>
                Turn your expertise into 24/7 AI conversations and earn while you sleep. Built for modern creators.
              </p>

              {/* Social Media Icons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'rgba(102,126,234,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#667EEA',
                    transition: 'all 0.2s',
                    border: '1px solid rgba(102,126,234,0.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102,126,234,0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(102,126,234,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <TwitterOutlined style={{ fontSize: 16 }} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'rgba(102,126,234,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#667EEA',
                    transition: 'all 0.2s',
                    border: '1px solid rgba(102,126,234,0.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102,126,234,0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(102,126,234,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <LinkedinOutlined style={{ fontSize: 16 }} />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'rgba(102,126,234,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#667EEA',
                    transition: 'all 0.2s',
                    border: '1px solid rgba(102,126,234,0.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102,126,234,0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(102,126,234,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <GithubOutlined style={{ fontSize: 16 }} />
                </a>
              </div>

              {/* Trust Badges */}
              <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF' }}>
                  <SafetyOutlined style={{ color: '#10B981' }} />
                  <span>Secure & Encrypted</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF' }}>
                  <LockOutlined style={{ color: '#10B981' }} />
                  <span>GDPR Compliant</span>
                </div>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14, color: '#E5E7EB' }}>Product</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li>
                  <Link to="/creators" style={{ fontSize: 13, color: '#9CA3AF', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E5E7EB'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" style={{ fontSize: 13, color: '#9CA3AF', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E5E7EB'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/creators" style={{ fontSize: 13, color: '#9CA3AF', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E5E7EB'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                    API Docs
                  </Link>
                </li>
                <li>
                  <Link to="/mvp1-presentation" style={{ fontSize: 13, color: '#9CA3AF', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E5E7EB'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14, color: '#E5E7EB' }}>Company</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li>
                  <Link to="/community" style={{ fontSize: 13, color: '#9CA3AF', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E5E7EB'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                    Community
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" style={{ fontSize: 13, color: '#9CA3AF', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E5E7EB'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" style={{ fontSize: 13, color: '#9CA3AF', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E5E7EB'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" style={{ fontSize: 13, color: '#9CA3AF', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E5E7EB'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14, color: '#E5E7EB' }}>Resources</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li>
                  <Link to="/trending" style={{ fontSize: 13, color: '#9CA3AF', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E5E7EB'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/help" style={{ fontSize: 13, color: '#9CA3AF', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E5E7EB'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/trending" style={{ fontSize: 13, color: '#9CA3AF', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E5E7EB'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link to="/terms" style={{ fontSize: 13, color: '#9CA3AF', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E5E7EB'} onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                    Terms &amp; Privacy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div>
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14, color: '#E5E7EB' }}>Stay Updated</div>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16, lineHeight: 1.5 }}>
                Get the latest updates, tips, and creator success stories delivered to your inbox.
              </p>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="Enter your email"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(148,163,184,0.2)',
                    color: '#E5E7EB',
                  }}
                  prefix={<MailOutlined style={{ color: '#9CA3AF' }} />}
                />
                <Button
                  type="primary"
                  onClick={() => navigate('/register')}
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                    border: 'none',
                    borderRadius: '0 6px 6px 0',
                  }}
                >
                  Subscribe
                </Button>
              </Space.Compact>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 8 }}>
                No spam. Unsubscribe anytime.
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              paddingTop: 32,
              borderTop: '1px solid rgba(148,163,184,0.1)',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: 16,
            }}
          >
            <div style={{ fontSize: 12, color: '#6B7280' }}>
              © {new Date().getFullYear()} AI Creator Platform. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <Link to="/terms" style={{ fontSize: 12, color: '#6B7280', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#9CA3AF'} onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}>
                Privacy Policy
              </Link>
              <Link to="/terms" style={{ fontSize: 12, color: '#6B7280', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#9CA3AF'} onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}>
                Terms of Service
              </Link>
              <Link to="/terms" style={{ fontSize: 12, color: '#6B7280', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#9CA3AF'} onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}>
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </Footer>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </Layout>
  );
};

export default MainLayout;
