// ===========================================
// USER CHATS PAGE
// ===========================================

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Card, Empty, Spin, Tag, Pagination, Input, Select, Row, Col, Button, Typography } from 'antd';
import { MessageOutlined, SearchOutlined, StarFilled, CheckCircleFilled, FilterOutlined } from '@ant-design/icons';
import { chatApi, getImageUrl } from '../../services/api';
import DashboardContentLoader from '../../components/common/DashboardContentLoader';
import { motion } from 'framer-motion';
import { debounce } from '../../utils/debounce';
import { colors, shadows } from '../../styles/tokens';
import { logger } from '../../utils/logger';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const UserChats = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [sort, setSort] = useState<'recent' | 'alphabetical' | 'oldest'>('recent');
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search function
  const debouncedFetchConversations = useCallback(
    debounce((searchValue: string) => {
      fetchConversations(searchValue);
    }, 500),
    [currentPage, pageSize, category, timeFilter, sort]
  );

  useEffect(() => {
    if (search) {
      debouncedFetchConversations(search);
    } else {
      fetchConversations();
    }
  }, [currentPage, pageSize, category, timeFilter, sort]);

  useEffect(() => {
    return () => {
      debouncedFetchConversations.cancel();
    };
  }, []);

  const fetchConversations = async (searchValue?: string) => {
    try {
      setLoading(true);
      const response = await chatApi.getUserConversations({
        page: currentPage,
        limit: pageSize,
        search: searchValue || search || undefined,
        category: category || undefined,
        timeFilter: timeFilter !== 'all' ? timeFilter : undefined,
        sort
      });
      setConversations(response.data.data.conversations || []);
      setTotal(response.data.data.pagination?.total || 0);
    } catch (err) {
      logger.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
    debouncedFetchConversations(value);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchConversations();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory(undefined);
    setTimeFilter('all');
    setSort('recent');
    setCurrentPage(1);
  };

  if (loading && conversations.length === 0) {
    return <DashboardContentLoader />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '32px' }}
    >
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ color: colors.text.primary, marginBottom: '4px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          My Conversations
        </Title>
        <Text style={{ color: colors.text.tertiary, fontSize: '16px', fontWeight: 500 }}>
          Continue chatting with your favorite creators
        </Text>
      </div>

      {/* Search and Filters */}
      <Card
        bordered={false}
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: `1px solid ${colors.gray[100]}`,
          boxShadow: shadows.md,
          marginBottom: '24px'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="Search by creator name..."
              allowClear
              size="large"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              prefix={<SearchOutlined style={{ color: colors.text.tertiary }} />}
              style={{ borderRadius: '12px' }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: showFilters ? colors.primary.subtle : 'transparent',
                border: `1px solid ${colors.gray[200]}`,
                color: colors.text.primary,
                borderRadius: '12px',
                fontWeight: 700
              }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Col>

          {showFilters && (
            <>
              <Col xs={24} sm={8} md={6}>
                <Select
                  placeholder="Category"
                  allowClear
                  size="large"
                  value={category}
                  onChange={(value) => { setCategory(value); handleFilterChange(); }}
                  style={{ width: '100%' }}
                >
                  <Option value="Fitness">Fitness</Option>
                  <Option value="Tech">Tech</Option>
                  <Option value="Health">Health</Option>
                  <Option value="Business">Business</Option>
                  <Option value="Education">Education</Option>
                </Select>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Select
                  placeholder="Time Filter"
                  size="large"
                  value={timeFilter}
                  onChange={(value) => { setTimeFilter(value); handleFilterChange(); }}
                  style={{ width: '100%' }}
                >
                  <Option value="today">Today</Option>
                  <Option value="week">This Week</Option>
                  <Option value="month">This Month</Option>
                  <Option value="all">All Time</Option>
                </Select>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Select
                  placeholder="Sort By"
                  size="large"
                  value={sort}
                  onChange={(value) => { setSort(value); handleFilterChange(); }}
                  style={{ width: '100%' }}
                >
                  <Option value="recent">Most Recent</Option>
                  <Option value="alphabetical">Alphabetical</Option>
                  <Option value="oldest">Oldest First</Option>
                </Select>
              </Col>
              <Col xs={24} sm={24} md={6}>
                <Button
                  onClick={handleResetFilters}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${colors.gray[200]}`,
                    color: colors.text.tertiary,
                    borderRadius: '12px',
                    width: '100%',
                    fontWeight: 700
                  }}
                >
                  Reset Filters
                </Button>
              </Col>
            </>
          )}
        </Row>
      </Card>

      {conversations.length === 0 && !loading ? (
        <Card
          bordered={false}
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: `1px solid ${colors.gray[100]}`,
            boxShadow: shadows.md,
            padding: '60px 0',
            textAlign: 'center'
          }}
        >
          <Empty
            description={<span style={{ color: colors.text.tertiary, fontSize: '16px', fontWeight: 500 }}>No conversations found</span>}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '16px' }}>
            {conversations.map((item) => (
              <Card
                key={item.id}
                hoverable
                bordered={false}
                style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  border: `1px solid ${colors.gray[100]}`,
                  boxShadow: shadows.md,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                bodyStyle={{ padding: '20px' }}
                onClick={() => navigate(`/chat/${item.creator?.id || item.creatorId}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <Avatar
                    size={64}
                    src={item.creator?.profileImage ? getImageUrl(item.creator.profileImage) : undefined}
                    style={{
                      background: !item.creator?.profileImage ? colors.primary.solid : undefined,
                      color: '#fff',
                      fontWeight: 700,
                      border: `2px solid ${colors.primary.subtle}`
                    }}
                  >
                    {item.creator?.displayName?.[0]?.toUpperCase()}
                  </Avatar>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Text style={{ color: colors.text.primary, fontWeight: 800, fontSize: '18px' }}>
                        {item.creator?.displayName}
                      </Text>
                      {item.creator?.isVerified && (
                        <CheckCircleFilled style={{ color: colors.primary.solid, fontSize: '16px' }} />
                      )}
                    </div>
                    {item.creator?.tagline && (
                      <Text style={{ color: colors.text.secondary, fontSize: '13px', display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                        {item.creator.tagline}
                      </Text>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {item.creator?.category && (
                        <Tag color="blue" style={{ borderRadius: '8px' }}>
                          {item.creator.category}
                        </Tag>
                      )}
                      {item.creator?.rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <StarFilled style={{ color: colors.warning.solid, fontSize: '14px' }} />
                          <Text style={{ color: colors.text.tertiary, fontSize: '13px', fontWeight: 700 }}>{item.creator.rating}</Text>
                        </div>
                      )}
                      <Tag icon={<MessageOutlined />} style={{ borderRadius: '8px' }}>
                        {item._count?.messages || item.totalMessages || 0} messages
                      </Tag>
                    </div>
                    {item.lastMessage?.content && (
                      <Text style={{ color: colors.text.tertiary, fontSize: '14px', display: 'block', marginTop: '12px', fontStyle: 'italic', fontWeight: 500 }}>
                        "{item.lastMessage.content.slice(0, 100)}..."
                      </Text>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {total > pageSize && (
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={(page) => setCurrentPage(page)}
                onShowSizeChange={(_current, size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                showSizeChanger
                pageSizeOptions={['10', '20', '50']}
                showTotal={(total) => (
                  <Text style={{ color: colors.text.tertiary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px' }}>
                    Total {total} conversations
                  </Text>
                )}
                style={{
                  display: 'inline-flex',
                  background: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '20px',
                  border: `1px solid ${colors.gray[100]}`,
                  boxShadow: shadows.sm
                }}
              />
            </div>
          )}
        </>
      )}

      {loading && conversations.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Spin />
        </div>
      )}
    </motion.div>
  );
};

export default UserChats;
