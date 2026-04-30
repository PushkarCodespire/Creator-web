import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { message, Typography, Button } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { PostCard } from '../components/Post';
import { useInfiniteFeed } from '../hooks/queries';
import DashboardContentLoader from '../components/common/DashboardContentLoader';
import { ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Feed: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [_isCreator, setIsCreator] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteFeed(10);

  useEffect(() => {
    if (user?.role === 'CREATOR') {
      setIsCreator(true);
    }
  }, [user]);

  const posts = data?.pages.flatMap((page) => page.data?.posts || []) || [];

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ maxWidth: '400px', textAlign: 'center' }}>
          <Title level={2} style={{ color: '#1E293B' }}>Join the Conversation</Title>
          <Text style={{ color: '#64748B', display: 'block', marginBottom: '24px' }}>
            Login to follow your favorite creators and see their latest posts in your personalized feed.
          </Text>
          <Button type="primary" size="large" onClick={() => navigate('/login')} style={{ borderRadius: '12px', height: '48px', width: '100%', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', border: 'none' }}>
            Login to AI Platform
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) return <DashboardContentLoader />;

  if (isError) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <Title level={3} style={{ color: '#EF4444' }}>Oops! Something went wrong</Title>
        <Text style={{ color: '#64748B' }}>We couldn't load your feed right now.</Text>
        <div style={{ marginTop: '24px' }}>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Title level={2} style={{ color: '#1E293B', margin: 0, fontWeight: 800 }}>Explore Feed</Title>
          <Text style={{ color: '#64748B', fontSize: '16px' }}>Discover what creators are sharing today.</Text>
        </div>
        <Button
          type="text"
          icon={<ReloadOutlined />}
          style={{ color: '#6366F1', fontWeight: 600 }}
          onClick={() => refetch()}
        >
          Refresh Feed
        </Button>
      </div>

      <InfiniteScroll
        dataLength={posts.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={<div style={{ padding: '20px' }}><DashboardContentLoader /></div>}
        endMessage={
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748B' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</div>
            <Text style={{ color: '#94A3B8', fontWeight: 600 }}>You're all caught up!</Text>
            <div style={{ marginTop: '16px' }}>
              <Button type="link" onClick={() => navigate('/creators')}>Find more creators to follow</Button>
            </div>
          </div>
        }
      >
        {posts.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '60px',
            textAlign: 'center',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}>
            <Title level={4} style={{ color: '#1E293B' }}>Your feed is empty</Title>
            <Text style={{ color: '#64748B', display: 'block', marginBottom: '24px' }}>
              Start following creators to see their posts and updates here.
            </Text>
            <Button type="primary" onClick={() => navigate('/creators')}>Discover Creators</Button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostDelete={() => refetch()}
              onPostUpdate={() => message.info('Update feature coming soon')}
            />
          ))
        )}
      </InfiniteScroll>
    </div>
  );
};

export default Feed;
