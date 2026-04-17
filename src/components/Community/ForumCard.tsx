import React from 'react';
import { Avatar, Tag, Typography, Space } from 'antd';
import {
  MessageOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PushpinFilled,
  LockFilled
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  replyCount: number;
  viewCount: number;
  lastActivity: string;
  isPinned?: boolean;
  isLocked?: boolean;
}

interface ForumCardProps {
  topic: ForumTopic;
}

export const ForumCard: React.FC<ForumCardProps> = ({ topic }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        borderRadius: '24px',
        padding: '24px',
        marginBottom: '16px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
      }}
      onClick={() => navigate(`/community/topic/${topic.id}`)}
    >
      {topic.isPinned && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          padding: '4px 12px',
          borderBottomLeftRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#fff',
          fontSize: '11px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          zIndex: 2,
          boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)'
        }}>
          <PushpinFilled style={{ fontSize: '10px' }} /> Pinned
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px' }}>
        <Avatar
          size={56}
          src={topic.author.avatar}
          icon={<UserOutlined />}
          style={{
            border: '2px solid rgba(99, 102, 241, 0.1)',
            background: '#F1F5F9',
            color: '#64748B',
            flexShrink: 0
          }}
        >
          {topic.author.name[0]}
        </Avatar>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Tag color="blue" style={{
              borderRadius: '6px',
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3B82F6',
              border: 'none',
              fontWeight: 700,
              fontSize: '11px',
              textTransform: 'uppercase'
            }}>
              {topic.category}
            </Tag>
            <Text style={{ color: '#64748B', fontSize: '13px' }}>
              started by <span style={{ color: '#334155', fontWeight: 600 }}>{topic.author.name}</span>
            </Text>
          </div>

          <Title level={4} style={{
            color: '#1E293B',
            margin: '0 0 8px 0',
            fontWeight: 800,
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {topic.title}
            {topic.isLocked && <LockFilled style={{ fontSize: '14px', color: '#94A3B8' }} />}
          </Title>

          <Text style={{
            color: '#475569',
            fontSize: '15px',
            marginBottom: '20px',
            lineHeight: 1.6,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {topic.content}
          </Text>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid rgba(226, 232, 240, 0.6)'
          }}>
            <Space size={24}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B' }}>
                <MessageOutlined style={{ fontSize: '16px' }} />
                <Text style={{ color: '#64748B', fontWeight: 600, fontSize: '13px' }}>{topic.replyCount} replies</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B' }}>
                <EyeOutlined style={{ fontSize: '16px' }} />
                <Text style={{ color: '#64748B', fontWeight: 600, fontSize: '13px' }}>{topic.viewCount} views</Text>
              </div>
            </Space>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8' }}>
              <ClockCircleOutlined style={{ fontSize: '14px' }} />
              <Text style={{ color: '#94A3B8', fontSize: '13px' }}>{topic.lastActivity}</Text>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ForumCard;
