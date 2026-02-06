// ===========================================
// NOTIFICATION CENTER COMPONENT
// Dropdown notification panel with real-time updates
// ===========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BellOutlined,
  BellFilled,
  MessageFilled,
  HeartFilled,
  LoadingOutlined,
} from '@ant-design/icons';
import { Badge, Dropdown, Empty, Spin } from 'antd';
import api from '../../services/api';
import CustomButton from '../common/Button/CustomButton';
import { colors, spacing, typography, shadows } from '../../styles/tokens';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

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

      // Ensure we set an array, even if empty
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]); // Always fallback to empty array
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`, {});
      setNotifications(prev =>
        Array.isArray(prev)
          ? prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
          : []
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleClick = (notification: Notification) => {
    if (!notification || !notification.id) return;
    if (!notification.isRead) handleMarkAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  // Use an extra-safe approach for unreadCount
  let unreadCount = 0;
  try {
    if (notifications && typeof notifications.filter === 'function') {
      unreadCount = notifications.filter(n => n && !n.isRead).length;
    }
  } catch (e) {
    console.error('Error calculating unreadCount:', e);
  }

  const getIcon = (type: string) => {
    if (type === 'CHAT_MESSAGE') return <MessageFilled style={{ color: colors.primary.solid }} />;
    return <HeartFilled style={{ color: colors.success.solid }} />;
  };

  const formatTime = (timestamp: string) => {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const content = (
    <div style={{ width: '380px', maxHeight: '600px', background: 'white', borderRadius: '12px', boxShadow: shadows['2xl'], overflow: 'hidden' }}>
      <div style={{ padding: spacing[4], borderBottom: `1px solid ${colors.gray[200]}` }}>
        <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, margin: 0 }}>Notifications</h3>
      </div>
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ padding: spacing[8], textAlign: 'center' }}><Spin indicator={<LoadingOutlined spin />} /></div>
        ) : !Array.isArray(notifications) || notifications.length === 0 ? (
          <div style={{ padding: spacing[8] }}><Empty description="No notifications" /></div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              style={{
                padding: spacing[4],
                borderBottom: `1px solid ${colors.gray[100]}`,
                cursor: 'pointer',
                background: n.isRead ? 'white' : colors.primary.light,
                transition: 'background 0.2s',
              }}
            >
              <div style={{ display: 'flex', gap: spacing[3] }}>
                <div style={{ fontSize: '20px' }}>{getIcon(n.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing[1] }}>{n.title}</div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.gray[600], marginBottom: spacing[1] }}>{n.message}</div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.gray[500] }}>{formatTime(n.createdAt)}</div>
                </div>
                {!n.isRead && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.primary.solid, marginTop: '8px' }} />
                )}
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
              <BellOutlined style={{ fontSize: '22px', color: colors.gray[600] }} />
            )}
          </motion.div>
        </Badge>
      </div>
    </Dropdown>
  );
};

export { NotificationCenter };
export default NotificationCenter;