// ===========================================
// MOBILE NAVIGATION
// Bottom tab bar for mobile devices (Instagram-style)
// ===========================================

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from 'antd';
import { Home, Compass, MessageSquare, User, CreditCard, LogIn } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { colors, shadows, zIndex } from '../../styles/tokens';
import { motion } from 'framer-motion';

const MobileNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'CREATOR':
        return '/creator-dashboard';
      case 'COMPANY':
        return '/company-dashboard';
      case 'ADMIN':
        return '/admin';
      default:
        return '/dashboard';
    }
  };

  // Navigation items (different for guests vs authenticated users)
  const navItems = isAuthenticated
    ? [
      {
        key: 'home',
        label: 'Home',
        icon: <Home size={20} />,
        path: '/',
      },
      {
        key: 'explore',
        label: 'Explore',
        icon: <Compass size={20} />,
        path: '/creators',
      },
      {
        key: 'chats',
        label: 'Chats',
        icon: <MessageSquare size={20} />,
        path: '/dashboard/chats',
        badge: 0,
      },
      {
        key: 'profile',
        label: 'Profile',
        icon: <User size={20} />,
        path: getDashboardPath(),
      },
    ]
    : [
      {
        key: 'home',
        label: 'Home',
        icon: <Home size={20} />,
        path: '/',
      },
      {
        key: 'explore',
        label: 'Creators',
        icon: <Compass size={20} />,
        path: '/creators',
      },
      {
        key: 'pricing',
        label: 'Pricing',
        icon: <CreditCard size={20} />,
        path: '/pricing',
      },
      {
        key: 'login',
        label: 'Log in',
        icon: <LogIn size={20} />,
        path: '/login',
      },
    ];

  // Check if current path matches nav item
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Navigate to path
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div
      className="hide-desktop"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: '#ffffff',
        borderTop: `1px solid ${colors.gray[200]}`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 8px',
        zIndex: zIndex.fixed,
        boxShadow: shadows.xl,
      }}
    >
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <motion.div
            key={item.key}
            onClick={() => handleNavigation(item.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '8px',
              position: 'relative',
            }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Badge for notifications */}
            {item.badge && item.badge > 0 ? (
              <Badge count={item.badge} size="small">
                <div
                  style={{
                    fontSize: '24px',
                    color: active ? colors.primary.solid : colors.gray[600],
                    transition: 'color 0.3s',
                  }}
                >
                  {item.icon}
                </div>
              </Badge>
            ) : (
              <div
                style={{
                  fontSize: '24px',
                  color: active ? colors.primary.solid : colors.gray[600],
                  transition: 'color 0.3s',
                }}
              >
                {item.icon}
              </div>
            )}

            {/* Label */}
            <span
              style={{
                fontSize: '10px',
                marginTop: '4px',
                color: active ? colors.primary.solid : colors.gray[600],
                fontWeight: active ? 600 : 400,
                transition: 'all 0.3s',
              }}
            >
              {item.label}
            </span>

            {/* Active Indicator */}
            {active && (
              <motion.div
                layoutId="activeTab"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40px',
                  height: '3px',
                  background: colors.primary.gradient,
                  borderRadius: '0 0 3px 3px',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default MobileNav;
