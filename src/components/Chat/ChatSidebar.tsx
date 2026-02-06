// ===========================================
// CHAT SIDEBAR COMPONENT
// Shows chat history, saved messages, suggested topics
// ===========================================

import { useState, useEffect } from 'react';
import { Drawer, Input, Tabs, Empty, Spin, Typography, Button, Space, Avatar, message as antMessage } from 'antd';
import {
  HistoryOutlined,
  BookOutlined,
  BulbOutlined,
  SearchOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchUserConversations } from '../../store/slices/chatSlice';
import { chatApi, bookmarkApi, getImageUrl } from '../../services/api';
import { Conversation, Message } from '../../types';
import { colors, spacing, typography } from '../../styles/tokens';
import { formatRelativeTime } from '../../utils/dateUtils';

const { Title, Text } = Typography;

const { Search } = Input;
const { TabPane } = Tabs;

interface ChatSidebarProps {
  visible: boolean;
  onClose: () => void;
  onConversationSelect?: (conversationId: string) => void;
  currentConversationId?: string;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  visible,
  onClose,
  onConversationSelect,
  currentConversationId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { conversations } = useSelector((state: RootState) => state.chat);
  const [activeTab, setActiveTab] = useState('history');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedMessages, setSavedMessages] = useState<Message[]>([]);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && isAuthenticated) {
      loadData();
    }
  }, [visible, isAuthenticated]);

  const loadData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      await dispatch(fetchUserConversations()).unwrap();
      await loadSavedMessages();
      await loadSuggestedTopics();
    } catch (error) {
      console.error('Failed to load sidebar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedMessages = async () => {
    try {
      const response = await bookmarkApi.getUserBookmarks();
      const data = response.data.data;
      setSavedMessages(Array.isArray(data) ? data : (data?.bookmarks || data?.data || []));
    } catch (error) {
      console.error('Failed to load saved messages:', error);
    }
  };

  const loadSuggestedTopics = async () => {
    // Mock suggested topics - can be replaced with API call
    setSuggestedTopics([
      'Fitness tips',
      'Nutrition advice',
      'Workout routines',
      'Healthy recipes',
      'Motivation',
    ]);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const filteredConversations = (Array.isArray(conversations) ? conversations : []).filter((conv: Conversation) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.creator?.displayName?.toLowerCase().includes(query) ||
      conv.messages?.[0]?.content?.toLowerCase().includes(query)
    );
  });

  const filteredSavedMessages = (Array.isArray(savedMessages) ? savedMessages : []).filter((msg: Message) => {
    if (!searchQuery) return true;
    return msg.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--chat-sidebar-bg)' }}>
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: `1px solid var(--chat-border)` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={5} style={{ margin: 0, color: 'var(--chat-text-main)' }}>💬 Conversations</Title>
          <Button icon={<BulbOutlined />} type="text" shape="circle" />
        </div>
        <Search
          placeholder="Search chats..."
          allowClear
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ borderRadius: '12px' }}
        />
      </div>

      {/* Tabs / Groups */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><Spin /></div>
        ) : filteredConversations.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No chats yet" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Today Group */}
            <div>
              <Text strong style={{ fontSize: '11px', color: 'var(--chat-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px' }}>Today</Text>
              <div style={{ marginTop: '8px' }}>
                {filteredConversations.map((conv: Conversation) => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      if (onConversationSelect) onConversationSelect(conv.id);
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: conv.id === currentConversationId ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      border: conv.id === currentConversationId ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <Avatar src={conv.creator?.profileImage ? getImageUrl(conv.creator.profileImage) : undefined}>
                      {conv.creator?.displayName?.[0]}
                    </Avatar>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--chat-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.creator?.displayName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--chat-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.messages?.[0]?.content || 'Start a conversation'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button type="primary" block shape="round" icon={<BulbOutlined />} style={{ background: '#6366f1', border: 'none' }}>
              + New Chat
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;



