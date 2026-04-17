// ===========================================
// SEARCH RESULTS PAGE
// ===========================================

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, Row, Col, Card, Empty, Spin, Tag, Select, DatePicker, Checkbox } from 'antd';
import { SearchOutlined, UserOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import SearchBar from '../components/Search/SearchBar';
import { searchApi } from '../services/api';
import { colors, spacing } from '../styles/tokens';
import { logger } from '../utils/logger';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

type SearchType = 'all' | 'creator' | 'post' | 'user' | 'hashtag';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  image?: string;
}

interface SearchResults {
  creators?: SearchResultItem[];
  posts?: SearchResultItem[];
  users?: SearchResultItem[];
}

interface SearchTotals {
  creators?: number;
  posts?: number;
  users?: number;
}

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const _navigate = useNavigate();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState<SearchType>((searchParams.get('type') as SearchType) || 'all');
  const [results, setResults] = useState<SearchResults>({});
  const [totals, setTotals] = useState<SearchTotals>({});
  const [loading, setLoading] = useState(false);

  // Filters
  const [category, setCategory] = useState<string | undefined>();
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dateRange, setDateRange] = useState<any>(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const params: Record<string, string | number | boolean> = {
        q: searchQuery,
        type,
        limit: 20,
      };

      if (category) params.category = category;
      if (verifiedOnly) params.verified = true;
      if (dateRange && dateRange.length === 2) {
        params.dateFrom = dateRange[0].toISOString();
        params.dateTo = dateRange[1].toISOString();
      }

      const response = await searchApi.globalSearch(params as { q: string; type?: SearchType; category?: string; limit?: number; verified?: boolean; dateFrom?: string; dateTo?: string });
      setResults(response.data.data.results || {});
      setTotals(response.data.data.totals || {});
    } catch (error) {
      logger.error('Search failed:', error);
      setResults({});
      setTotals({});
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setSearchParams({ q: newQuery, type });
  };

  const handleTypeChange = (newType: string) => {
    setType(newType as SearchType);
    setSearchParams({ q: query, type: newType });
  };

  const handleFilterChange = () => {
    performSearch(query);
  };

  return (
    <div style={{ padding: spacing[6], maxWidth: '1200px', margin: '0 auto' }}>
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: spacing[6] }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
          <SearchOutlined style={{ fontSize: '32px', color: colors.primary.solid }} />
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700 }}>Search</h1>
        </div>

        <SearchBar
          placeholder="Search creators, posts, hashtags..."
          onSearch={handleSearch}
          autoFocus={!query}
        />

        {query && (
          <div style={{ marginTop: spacing[4], fontSize: '16px', color: colors.gray[600] }}>
            Search results for: <strong>{query}</strong>
          </div>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: spacing[6] }}
      >
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Category"
                allowClear
                value={category}
                onChange={(value) => {
                  setCategory(value);
                  setTimeout(handleFilterChange, 100);
                }}
                style={{ width: '100%' }}
                options={[
                  { label: 'Fitness', value: 'Fitness' },
                  { label: 'Tech', value: 'Tech' },
                  { label: 'Business', value: 'Business' },
                  { label: 'Lifestyle', value: 'Lifestyle' },
                  { label: 'Education', value: 'Education' },
                  { label: 'Entertainment', value: 'Entertainment' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <RangePicker
                onChange={(dates) => {
                  setDateRange(dates);
                  setTimeout(handleFilterChange, 100);
                }}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Checkbox
                checked={verifiedOnly}
                onChange={(e) => {
                  setVerifiedOnly(e.target.checked);
                  setTimeout(handleFilterChange, 100);
                }}
              >
                Verified only
              </Checkbox>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Results */}
      {query && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs
            activeKey={type}
            onChange={handleTypeChange}
            size="large"
            items={[
              {
                key: 'all',
                label: `All (${Object.values(totals).reduce((a: number, b: number) => a + b, 0)})`,
                children: <AllResults results={results} loading={loading} />,
              },
              {
                key: 'creator',
                label: (
                  <span>
                    <UserOutlined /> Creators ({totals.creators || 0})
                  </span>
                ),
                children: <CreatorResults creators={results.creators || []} loading={loading} />,
              },
              {
                key: 'post',
                label: (
                  <span>
                    <FileTextOutlined /> Posts ({totals.posts || 0})
                  </span>
                ),
                children: <PostResults posts={results.posts || []} loading={loading} />,
              },
              {
                key: 'user',
                label: (
                  <span>
                    <TeamOutlined /> Users ({totals.users || 0})
                  </span>
                ),
                children: <UserResults users={results.users || []} loading={loading} />,
              },
            ]}
          />
        </motion.div>
      )}
    </div>
  );
};

// All Results Tab
const AllResults: React.FC<{ results: SearchResults; loading: boolean }> = ({ results, loading }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: spacing[8] }}>
        <Spin size="large" />
      </div>
    );
  }

  const hasResults = Object.values(results).some((arr) => Array.isArray(arr) && arr.length > 0);

  if (!hasResults) {
    return <Empty description="No results found" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
      {(results.creators?.length ?? 0) > 0 && (
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: spacing[3] }}>
            <UserOutlined /> Creators
          </h3>
          <CreatorResults creators={results.creators!.slice(0, 3)} loading={false} />
        </div>
      )}

      {(results.posts?.length ?? 0) > 0 && (
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: spacing[3] }}>
            <FileTextOutlined /> Posts
          </h3>
          <PostResults posts={results.posts!.slice(0, 5)} loading={false} />
        </div>
      )}

      {(results.users?.length ?? 0) > 0 && (
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: spacing[3] }}>
            <TeamOutlined /> Users
          </h3>
          <UserResults users={results.users!.slice(0, 3)} loading={false} />
        </div>
      )}
    </div>
  );
};

// Creator Results
const CreatorResults: React.FC<{ creators: SearchResultItem[]; loading: boolean }> = ({ creators, loading }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: spacing[8] }}>
        <Spin size="large" />
      </div>
    );
  }

  if (creators.length === 0) {
    return <Empty description="No creators found" />;
  }

  return (
    <Row gutter={[16, 16]}>
      {creators.map((creator) => (
        <Col key={creator.id} xs={24} sm={12} md={8}>
          <motion.div whileHover={{ y: -4 }}>
            <Card
              hoverable
              onClick={() => window.location.href = creator.url}
              cover={
                creator.image && (
                  <div style={{ textAlign: 'center', padding: spacing[4], background: colors.gray[50] }}>
                    <img
                      src={creator.image}
                      alt={creator.title}
                      style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </div>
                )
              }
            >
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: spacing[2] }}>
                  {creator.title}
                </h4>
                <p style={{ fontSize: '14px', color: colors.gray[600], marginBottom: spacing[2] }}>
                  {creator.subtitle}
                </p>
                <Tag color="blue">Creator</Tag>
              </div>
            </Card>
          </motion.div>
        </Col>
      ))}
    </Row>
  );
};

// Post Results
const PostResults: React.FC<{ posts: SearchResultItem[]; loading: boolean }> = ({ posts, loading }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: spacing[8] }}>
        <Spin size="large" />
      </div>
    );
  }

  if (posts.length === 0) {
    return <Empty description="No posts found" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
      {posts.map((post) => (
        <motion.div key={post.id} whileHover={{ x: 4 }}>
          <Card
            hoverable
            onClick={() => window.location.href = post.url}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', gap: spacing[3] }}>
              {post.image && (
                <img
                  src={post.image}
                  alt={post.subtitle}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', color: colors.gray[500], marginBottom: spacing[1] }}>
                  {post.subtitle}
                </div>
                <div style={{ fontSize: '16px', color: colors.gray[800] }}>
                  {post.title}
                </div>
                <div style={{ marginTop: spacing[2] }}>
                  <Tag color="green">Post</Tag>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// User Results
const UserResults: React.FC<{ users: SearchResultItem[]; loading: boolean }> = ({ users, loading }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: spacing[8] }}>
        <Spin size="large" />
      </div>
    );
  }

  if (users.length === 0) {
    return <Empty description="No users found" />;
  }

  return (
    <Row gutter={[16, 16]}>
      {users.map((user) => (
        <Col key={user.id} xs={24} sm={12} md={8}>
          <motion.div whileHover={{ y: -4 }}>
            <Card
              hoverable
              onClick={() => window.location.href = user.url}
            >
              <div style={{ display: 'flex', gap: spacing[3], alignItems: 'center' }}>
                <img
                  src={user.image || '/default-avatar.png'}
                  alt={user.title}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: spacing[1] }}>
                    {user.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: colors.gray[500], margin: 0 }}>
                    {user.subtitle}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      ))}
    </Row>
  );
};

export default SearchPage;
