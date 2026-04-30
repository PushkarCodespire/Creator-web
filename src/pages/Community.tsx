import { useState, useEffect } from 'react';
import { Input, Button, Tabs, Typography } from 'antd';
import { PlusOutlined, FireOutlined, MessageOutlined, BulbOutlined, TrophyOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ForumCard } from '../components/Community/ForumCard';
import DashboardContentLoader from '../components/common/DashboardContentLoader';
import { logger } from '../utils/logger';

const { Search } = Input;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

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

const Community = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchTopics();
  }, [activeTab]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setTopics([]);
    } catch (error) {
      logger.error('Failed to fetch topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { key: 'all', label: 'All Discussions', icon: <MessageOutlined /> },
    { key: 'Announcements', label: 'Announcements', icon: <BulbOutlined /> },
    { key: 'Tips & Tricks', label: 'Tips & Tricks', icon: <FireOutlined /> },
    { key: 'Feedback', label: 'Feedback', icon: <TrophyOutlined /> },
    { key: 'General Discussion', label: 'General', icon: <MessageOutlined /> }
  ];

  const filteredTopics = topics.filter((topic) => {
    if (activeTab !== 'all' && topic.category !== activeTab) return false;
    if (searchQuery && !topic.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <Title level={2} style={{ color: '#1E293B', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>Community Forum</Title>
          <Text style={{ color: '#64748B', fontSize: '16px' }}>Connect, collaborate, and grow with fellow creators.</Text>
        </div>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          size="large"
          style={{
            borderRadius: '12px',
            height: '48px',
            padding: '0 24px',
            background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
            border: 'none',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(118, 75, 162, 0.3)'
          }}
          onClick={() => navigate('/community/new-topic')}
        >
          Create New Topic
        </Button>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <Search
          placeholder="Search for topics, users, or keywords..."
          allowClear
          size="large"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="community-search"
          style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
        />
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ marginBottom: '32px' }}
        className="community-tabs"
      >
        {categories.map((cat) => (
          <TabPane
            tab={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{cat.icon} {cat.label}</span>}
            key={cat.key}
          />
        ))}
      </Tabs>

      <AnimatePresence mode="wait">
        {loading ? (
          <DashboardContentLoader />
        ) : filteredTopics.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '80px',
              textAlign: 'center',
              border: '1px solid rgba(226, 232, 240, 0.8)'
            }}
          >
            <Title level={4} style={{ color: '#1E293B' }}>No topics found</Title>
            <Text style={{ color: '#64748B' }}>Try searching for something else or be the first to start a conversation.</Text>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredTopics.map((topic) => (
              <ForumCard key={topic.id} topic={topic} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .community-search .ant-input-affix-wrapper {
          background: #fff !important;
          border: 1px solid #E2E8F0 !important;
          padding: 12px 20px !important;
          border-radius: 16px !important;
        }
        .community-search input {
          color: #1E293B !important;
          font-size: 16px !important;
        }
        .community-search .anticon {
          color: #6366F1 !important;
          font-size: 18px !important;
        }
        .community-tabs .ant-tabs-nav::before {
          border-bottom: 2px solid #E2E8F0;
        }
        .community-tabs .ant-tabs-tab {
          color: #64748B;
          font-weight: 600;
          font-size: 15px;
          padding: 12px 0;
          margin-right: 32px !important;
        }
        .community-tabs .ant-tabs-tab:hover {
          color: #6366F1 !important;
        }
        .community-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #6366F1 !important;
        }
        .community-tabs .ant-tabs-ink-bar {
          background: linear-gradient(90deg, #6366F1, #A855F7);
          height: 3px;
        }
      `}</style>
    </div>
  );
};

export default Community;
