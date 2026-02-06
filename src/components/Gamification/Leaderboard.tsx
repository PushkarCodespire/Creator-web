import React, { useState, useEffect } from 'react';
import { Card, Avatar, Tabs, Typography, Spin } from 'antd';
import { TrophyOutlined, FireOutlined, RiseOutlined, CrownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { gamificationApi, getImageUrl } from '../../services/api';
import DashboardContentLoader from '../common/DashboardContentLoader';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Leaderboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'creators'>('users');
  const [users, setUsers] = useState([]);
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, creatorsRes] = await Promise.all([
        gamificationApi.getLeaderboard('users'),
        gamificationApi.getLeaderboard('creators')
      ]);
      setUsers(usersRes.data.data);
      setCreators(creatorsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          border: '1px solid #FCD34D',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
          icon: <CrownOutlined style={{ color: '#D97706', fontSize: '20px' }} />
        };
      case 2:
        return {
          background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
          border: '1px solid #D1D5DB',
          boxShadow: '0 4px 12px rgba(156, 163, 175, 0.15)',
          icon: <TrophyOutlined style={{ color: '#6B7280', fontSize: '18px' }} />
        };
      case 3:
        return {
          background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
          border: '1px solid #FDBA74',
          boxShadow: '0 4px 12px rgba(249, 115, 22, 0.15)',
          icon: <TrophyOutlined style={{ color: '#EA580C', fontSize: '18px' }} />
        };
      default:
        return {
          background: 'rgba(255, 255, 255, 0.5)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: 'none',
          icon: null
        };
    }
  };

  const renderEntry = (entry: any, index: number) => {
    const rank = index + 1;
    const isTopThree = rank <= 3;
    const style = getRankStyle(rank);

    return (
      <motion.div
        key={entry.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.01, x: 4 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 20px',
          marginBottom: '12px',
          borderRadius: '20px',
          background: style.background,
          border: style.border,
          boxShadow: style.boxShadow,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="leaderboard-item"
      >
        <div style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '18px',
          color: isTopThree ? '#1F293B' : '#64748B'
        }}>
          {style.icon || rank}
        </div>

        <Avatar
          size={48}
          src={getImageUrl(entry.avatar || entry.profileImage)}
          style={{
            border: isTopThree ? '2px solid rgba(255,255,255,0.8)' : '2px solid transparent',
            boxShadow: isTopThree ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          {entry.name?.[0] || entry.displayName?.[0]}
        </Avatar>

        <div style={{ flex: 1 }}>
          <div style={{ color: '#1E293B', fontWeight: 700, fontSize: '16px' }}>
            {entry.name || entry.displayName}
          </div>
          <div style={{ color: '#64748B', fontSize: '13px', fontWeight: 500 }}>
            {activeTab === 'users' ? `${entry.totalPoints?.toLocaleString()} pts` : entry.category}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#1E293B', fontWeight: 800, fontSize: '16px' }}>
            {activeTab === 'users' ? entry.conversationsCount || 0 : entry.chatsCount || 0}
          </div>
          <div style={{ color: '#10B981', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
            <ArrowUpOutlined style={{ fontSize: '10px' }} />
            {Math.floor(Math.random() * 20) + 1}%
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Card
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      }}
      bodyStyle={{ padding: '24px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            <TrophyOutlined />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1E293B', fontWeight: 800 }}>Leaderboard</Title>
            <Text style={{ color: '#64748B', fontSize: '13px' }}>Top performers this week</Text>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'users' | 'creators')}
        className="leaderboard-tabs"
        centered
        style={{ marginBottom: '24px' }}
      >
        <TabPane tab="Top Users" key="users" />
        <TabPane tab="Top Creators" key="creators" />
      </Tabs>

      {loading ? (
        <DashboardContentLoader />
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
          No data available yet
        </div>
      ) : (
        <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }} className="custom-scrollbar">
          {(activeTab === 'users' ? users : creators).map((entry, index) => renderEntry(entry, index))}
        </div>
      )}

      <style>{`
        .leaderboard-tabs .ant-tabs-nav::before {
          border-bottom: 2px solid #E2E8F0;
        }
        .leaderboard-tabs .ant-tabs-tab {
          color: #64748B;
          font-weight: 600;
          font-size: 15px;
          padding: 12px 24px;
        }
        .leaderboard-tabs .ant-tabs-tab:hover {
          color: #F59E0B !important;
        }
        .leaderboard-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #F59E0B !important;
        }
        .leaderboard-tabs .ant-tabs-ink-bar {
          background: #F59E0B;
          height: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.02);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
      `}</style>
    </Card>
  );
};

export default Leaderboard;
