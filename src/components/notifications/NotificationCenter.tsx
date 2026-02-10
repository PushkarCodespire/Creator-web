// ===========================================
// NOTIFICATION CENTER COMPONENT
// Dropdown notification panel with real-time updates
// ===========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BellOutlined,
  BellFilled,
  MessageFilled,
  HeartFilled,
  LoadingOutlined,
  BulbOutlined,
  StarFilled,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Badge, Dropdown, Empty, Spin, Button, Tooltip } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import api from '../../services/api';
import { connectSocket, getSocket } from '../../utils/socket';
import { colors, spacing, typography, shadows } from '../../styles/tokens';
import { Notification } from '../../types';
import './NotificationCenter.css';

let notificationSequence = 0;
const buildFallbackNotificationId = () => `notif_${Date.now()}_${++notificationSequence}`;

interface NotificationCenterProps {
  filterTypes?: string[];
  title?: string;
  emptyText?: string;
  theme?: 'light' | 'dark';
  limit?: number;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  filterTypes,
  title = 'Notifications',
  emptyText = 'No notifications',
  theme = 'light',
  limit = 50
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const normalizedFilterTypes = useMemo(
    () => (filterTypes || []).map((type) => type.toLowerCase().trim()).filter(Boolean),
    [filterTypes]
  );

  const matchesType = (type?: string) => {
    if (normalizedFilterTypes.length === 0) return true;
    const normalized = (type || '').toLowerCase();
    return normalizedFilterTypes.some((filter) =>
      normalized === filter || normalized.includes(filter)
    );
  };

  const normalizeNotification = (payload: any): Notification => {
    // If it's already a clean notification object from our API
    if (payload.id && payload.type && payload.message) {
      return payload as Notification;
    }

    return {
      id: payload?.id || payload?._id || buildFallbackNotificationId(),
      userId: payload?.userId || user?.id || '',
      type: payload?.type || payload?.notificationType || 'GENERAL',
      title: payload?.title || payload?.subject || 'Notification',
      message: payload?.message || payload?.body || payload?.content || '',
      isRead: payload?.isRead ?? false,
      actionUrl: (payload?.type || '').toLowerCase().includes('opportunity') || (payload?.actionUrl || '').includes('/opportunities/')
        ? '/creator-dashboard/opportunities'
        : (payload?.actionUrl || payload?.url),
      data: payload?.data,
      priority: (payload?.priority as any) || 'NORMAL',
      createdAt: payload?.createdAt || new Date().toISOString(),
      readAt: payload?.readAt || null,
      expiresAt: payload?.expiresAt || null
    };
  };

  const buildOpportunityNotification = (payload: any): Notification => {
    const opportunity = payload?.opportunity || payload;
    const companyName = opportunity?.company?.companyName || payload?.company?.companyName;
    const title = opportunity?.title ? `New opportunity: ${opportunity.title}` : 'New opportunity';
    const message = companyName ? `From ${companyName}` : 'A new brand opportunity is available';
    return {
      id: payload?.notificationId || payload?.id || (opportunity?.id ? `opportunity_${opportunity.id}` : `opportunity_${Date.now()}`),
      userId: payload?.userId || user?.id || '',
      type: 'OPPORTUNITY',
      title,
      message,
      isRead: false,
      actionUrl: '/creator-dashboard/opportunities',
      data: payload,
      createdAt: payload?.createdAt || new Date().toISOString()
    };
  };

  const pushNotification = (notification: Notification) => {
    setNotifications((prev) => {
      const exists = prev.some((item) => item.id === notification.id);
      if (exists) return prev;
      const next = [notification, ...prev];
      return next.slice(0, limit);
    });
  };

  const filteredNotifications = useMemo(() => {
    if (normalizedFilterTypes.length === 0) return notifications;
    return notifications.filter((notification) => matchesType(notification.type));
  }, [notifications, normalizedFilterTypes]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    loadNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadNotifications();
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const authToken = token || localStorage.getItem('token') || undefined;
    const socket = connectSocket(authToken, user.id);

    const handleNotification = (payload: any) => {
      const normalized = normalizeNotification(payload);
      pushNotification(normalized);
    };

    const handleOpportunity = (payload: any) => {
      const normalized = buildOpportunityNotification(payload);
      pushNotification(normalized);
    };

    socket.on('notification', handleNotification);
    socket.on('opportunity:new', handleOpportunity);

    return () => {
      const current = getSocket();
      current?.off('notification', handleNotification);
      current?.off('opportunity:new', handleOpportunity);
    };
  }, [isAuthenticated, user?.id, token]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/notifications');

      // Initialize with empty array
      let notificationsData: Notification[] = [];

      // Extremely defensive check for response data
      if (response && response.data) {
        const data = response.data;

        if (Array.isArray(data)) {
          notificationsData = data;
        } else if (data.data && Array.isArray(data.data)) {
          notificationsData = data.data;
        } else if (data.notifications && Array.isArray(data.notifications)) {
          notificationsData = data.notifications;
        } else if (data.data && data.data.notifications && Array.isArray(data.data.notifications)) {
          notificationsData = data.data.notifications;
        } else {
          console.warn('Notification API response format unexpected:', data);
        }
      }

      const normalized = (Array.isArray(notificationsData) ? notificationsData : [])
        .map((item) => normalizeNotification(item))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setNotifications(normalized.slice(0, limit));
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]); // Always fallback to empty array
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleClick = (notification: Notification) => {
    if (!notification || !notification.id) return;
    if (!notification.isRead) handleMarkAsRead(notification.id);
    setIsOpen(false);

    const type = (notification.type || '').toLowerCase();
    const url = (notification.actionUrl || '').toLowerCase();

    // Force opportunity notifications (by type OR url) to the dashboard page
    if (type.includes('opportunity') || url.includes('/opportunities/')) {
      navigate('/creator-dashboard/opportunities');
    } else if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  // Use an extra-safe approach for unreadCount
  let unreadCount = 0;
  try {
    if (filteredNotifications && typeof filteredNotifications.filter === 'function') {
      unreadCount = filteredNotifications.filter(n => n && !n.isRead).length;
    }
  } catch (e) {
    console.error('Error calculating unreadCount:', e);
  }

  const getIcon = (type: string) => {
    const normalized = (type || '').toLowerCase();
    if (normalized.includes('opportunity')) return <BulbOutlined style={{ color: colors.warning.solid }} />;
    if (normalized.includes('review')) return <StarFilled style={{ color: colors.warning.solid }} />;
    if (normalized.includes('system') || normalized.includes('announcement')) {
      return <BellFilled style={{ color: colors.info.solid || colors.primary.solid }} />;
    }
    if (normalized.includes('chat') || normalized.includes('message')) {
      return <MessageFilled style={{ color: colors.primary.solid }} />;
    }
    if (normalized.includes('like') || normalized.includes('follow')) {
      return <HeartFilled style={{ color: colors.success.solid }} />;
    }
    return <BellFilled style={{ color: colors.primary.solid }} />;
  };

  const formatTime = (timestamp: string) => {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const inactiveColor = theme === 'dark' ? colors.gray[200] : colors.gray[600];

  const content = (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>{title}</h3>
        {unreadCount > 0 && (
          <Tooltip title="Mark all as read">
            <Button
              type="text"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAllAsRead();
              }}
              style={{ color: colors.primary.solid, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Mark all read
            </Button>
          </Tooltip>
        )}
      </div>

      <div className="notification-list">
        {isLoading ? (
          <div style={{ padding: spacing[8], textAlign: 'center' }}>
            <Spin indicator={<LoadingOutlined spin style={{ fontSize: 24, color: colors.primary.solid }} />} />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={{ padding: spacing[12] }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span style={{ color: '#64748b' }}>{emptyText}</span>}
            />
          </div>
        ) : (
          filteredNotifications.map(n => (
            <div
              key={n.id}
              className={`notification-item ${!n.isRead ? 'unread' : ''}`}
              onClick={() => handleClick(n)}
            >
              <div className="notification-icon-wrapper">
                {getIcon(n.type)}
              </div>
              <div className="notification-content">
                <div className="notification-title">{n.title}</div>
                <div className="notification-message">{n.message}</div>
                <div className="notification-time">
                  <BulbOutlined style={{ fontSize: 10 }} />
                  {formatTime(n.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => content}
      trigger={['click']}
      open={isOpen}
      onOpenChange={setIsOpen}
      placement="bottomRight"
    >
      <div style={{ cursor: 'pointer' }}>
        <Badge count={unreadCount} offset={[-5, 5]}>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            {unreadCount > 0 ? (
              <BellFilled style={{ fontSize: '22px', color: colors.primary.solid }} />
            ) : (
              <BellOutlined style={{ fontSize: '22px', color: inactiveColor }} />
            )}
          </motion.div>
        </Badge>
      </div>
    </Dropdown>
  );
};

export { NotificationCenter };
export default NotificationCenter;
