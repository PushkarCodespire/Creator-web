// ===========================================
// CREATOR PROFILE PAGE - Enhanced
// ===========================================

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Avatar, Tag, Tabs, Button } from 'antd';
import {
  CheckCircleFilled,
  MessageOutlined,
  YoutubeOutlined,
  InstagramOutlined,
  TwitterOutlined,
  GlobalOutlined,
  ShareAltOutlined,
  StarFilled,
  HeartFilled,
} from '@ant-design/icons';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { creatorApi, postApi, getImageUrl } from '../services/api';
import { CreatorProfile as CreatorProfileType } from '../types';
import CustomCard from '../components/common/Card/CustomCard';
import CustomButton from '../components/common/Button/CustomButton';
// import CustomAvatar from '../components/common/Avatar/Avatar';
import { Skeleton } from '../components/common/Loading/Skeleton';
import { EmptyState } from '../components/common/EmptyState/EmptyState';
import { FollowButton } from '../components/Follow';
import { PostCard, PostData } from '../components/Post';
import { ChatPreview } from '../components/Creator/ChatPreview';
import { CreatorContentGallery } from '../components/Creator/CreatorContentGallery';
import { CreatorStats } from '../components/Creator/CreatorStats';
import { FAQAccordion } from '../components/Creator/FAQAccordion';
import CreatorReviews from '../components/Creator/CreatorReviews';
import { ShareDialog } from '../components/Social/ShareDialog';
import { logger } from '../utils/logger';
import { colors, typography, spacing, shadows } from '../styles/tokens';
import { pageVariants, fadeIn, slideUp } from '../styles/animations';

type TabKey = 'about' | 'posts' | 'content' | 'reviews';

// Animated Counter Component
const AnimatedCounter = ({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const CreatorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<CreatorProfileType | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('about');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [shareDialogVisible, setShareDialogVisible] = useState(false);

  const coverRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const coverY = useTransform(scrollY, [0, 300], [0, 150]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCreator(),
        fetchCreatorPosts(),
        fetchCreatorContent()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreator = async () => {
    try {
      const response = await creatorApi.getById(id!);
      const data = response.data.data;
      setCreator(data);
      if (data.faqs) setFaqs(data.faqs);
    } catch (error) {
      logger.error('Failed to fetch creator:', error);
    }
  };

  const fetchCreatorPosts = async () => {
    try {
      const response = await postApi.getFeed({ creatorId: id, limit: 6 });
      setPosts(response.data.data.posts || []);
    } catch (error) {
      logger.error('Failed to fetch posts:', error);
    }
  };

  const fetchCreatorContent = async () => {
    try {
      // Fetch creator's content (YouTube videos, etc.)
      const response = await creatorApi.getContent(id!);
      setContentItems(response.data.data || []);
    } catch (error) {
      logger.error('Failed to fetch content:', error);
    }
  };

  const _fetchFAQs = async () => {
    // FAQs are now fetched as part of the creator profile response
    if (creator?.faqs) {
      setFaqs(creator.faqs);
    } else {
      setFaqs([]);
    }
  };

  const handleShare = () => {
    setShareDialogVisible(true);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: spacing[4] }}>
        <Skeleton type="card" count={1} />
      </div>
    );
  }

  if (!creator) {
    return (
      <EmptyState
        type="error"
        title="Creator not found"
        description="The creator you're looking for doesn't exist"
        actionText="Explore Creators"
        onAction={() => navigate('/creators')}
      />
    );
  }

  const tabItems = [
    {
      key: 'about',
      label: 'About',
      children: (
        <motion.div variants={fadeIn}>
          <CustomCard depth={1} style={{ marginBottom: spacing[6], background: 'white', color: colors.gray[900] }}>
            <h3 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[4], color: colors.gray[900] }}>
              Bio
            </h3>
            <p style={{ fontSize: typography.fontSize.base, lineHeight: '1.8', color: colors.gray[700] }}>
              {creator.bio || 'No bio available.'}
            </p>
          </CustomCard>

          {/* Chat Preview Widget */}
          {creator.welcomeMessage && (
            <ChatPreview
              creatorId={creator.id}
              creatorName={creator.displayName}
              creatorAvatar={creator.profileImage}
              welcomeMessage={creator.welcomeMessage}
            />
          )}

          {/* Creator Stats */}
          <CreatorStats
            totalChats={creator.performance?.totalChats || 0}
            totalMessages={0}
            rating={creator.performance?.rating || creator.rating}
            responseRate={creator.performance?.responseRate || 100}
            avgResponseTime={creator.performance?.avgResponseTimeSeconds || 0}
            topicExpertise={creator.topicExpertise}
            userSatisfaction={creator.satisfactionTrend?.map((item: { month: string; score: number }) => ({
              month: item.month,
              satisfaction: item.score
            }))}
          />

          {/* FAQ Accordion */}
          {faqs.length > 0 && <FAQAccordion faqs={faqs} creatorName={creator.displayName} />}

          {creator.tags && creator.tags.length > 0 && (
            <CustomCard depth={1} style={{ background: 'white', color: colors.gray[900] }}>
              <h3 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[4], color: colors.gray[900] }}>
                Expertise
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
                {creator.tags.map((tag) => (
                  <Tag key={tag} style={{ padding: '6px 12px', fontSize: typography.fontSize.sm }}>
                    {tag}
                  </Tag>
                ))}
              </div>
            </CustomCard>
          )}
        </motion.div>
      ),
    },
    {
      key: 'posts',
      label: `Posts (${posts.length})`,
      children: (
        <motion.div variants={fadeIn}>
          {posts.length === 0 ? (
            <EmptyState
              type="no-data"
              title="No posts yet"
              description={`${creator.displayName} hasn't posted anything yet`}
            />
          ) : (
            <div className="posts-list">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                />
              ))}
            </div>
          )}
        </motion.div>
      ),
    },
    {
      key: 'content',
      label: `Content (${contentItems.filter(i => i.type === 'YOUTUBE_VIDEO').length})`,
      children: (
        <motion.div variants={fadeIn}>
          {contentItems.filter(i => i.type === 'YOUTUBE_VIDEO').length === 0 ? (
            <EmptyState
              type="no-data"
              title="No videos yet"
              description={`${creator.displayName} hasn't shared any YouTube videos yet`}
            />
          ) : (
            <CreatorContentGallery
              contents={contentItems.filter(i => i.type === 'YOUTUBE_VIDEO')}
              creatorName={creator.displayName}
            />
          )}
        </motion.div>
      ),
    },
    {
      key: 'reviews',
      label: 'Reviews & Ratings',
      children: (
        <motion.div variants={fadeIn}>
          <CreatorReviews creatorId={creator.id} creatorName={creator.displayName} />
        </motion.div>
      ),
    },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      {/* Cover Image with Parallax */}
      <motion.div
        ref={coverRef}
        style={{
          height: '400px',
          background: creator.coverImage
            ? `url(${getImageUrl(creator.coverImage)}) center/cover`
            : undefined,
          position: 'relative',
          overflow: 'hidden',
          y: coverY,
          backgroundColor: '#f0f2f5' // Light grey background instead of gradient
        }}
      >
        {/* Video Intro Overlay (if available) */}
        {creator.youtubeUrl && (
          <div
            style={{
              position: 'absolute',
              bottom: spacing[4],
              left: spacing[4],
              zIndex: 2,
            }}
          >
            <Button
              type="primary"
              size="large"
              icon={<YoutubeOutlined />}
              onClick={() => {
                const videoId = creator.youtubeUrl?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
                if (videoId) {
                  window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
                }
              }}
              style={{
                background: 'rgba(0,0,0,0.7)',
                border: 'none',
                backdropFilter: 'blur(10px)',
              }}
            >
              Watch Intro Video
            </Button>
          </div>
        )}
        {/* Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.5))',
          }}
        />
      </motion.div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? `0 ${spacing[4]}` : `0 ${spacing[8]}` }}>
        {/* Profile Header Card */}
        <motion.div variants={slideUp} style={{ marginTop: '-80px', marginBottom: spacing[8], position: 'relative', zIndex: 1 }}>
          <CustomCard depth={2} style={{ padding: isMobile ? spacing[4] : spacing[6], background: 'white', color: colors.gray[900] }}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: spacing[6], alignItems: isMobile ? 'center' : 'flex-start' }}>
              {/* Avatar */}
              <div style={{ position: 'relative' }}>
                <Avatar
                  size={isMobile ? 120 : 140}
                  src={creator.profileImage ? getImageUrl(creator.profileImage) : undefined}
                  style={{
                    border: `6px solid white`,
                    boxShadow: shadows.xl,
                    // backgroundColor removed to avoid fallback color
                    color: '#fff',
                    fontWeight: 600
                  }}
                >
                  {creator.displayName?.[0]?.toUpperCase()}
                </Avatar>
                {creator.isVerified && (
                  <CheckCircleFilled
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      fontSize: '32px',
                      color: colors.primary.solid,
                      background: 'white',
                      borderRadius: '50%',
                    }}
                  />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
                <h1
                  style={{
                    fontSize: isMobile ? typography.fontSize['2xl'] : typography.fontSize['4xl'],
                    fontWeight: typography.fontWeight.bold,
                    marginBottom: spacing[2],
                  }}
                >
                  {creator.displayName}
                </h1>
                <p style={{ fontSize: typography.fontSize.lg, color: colors.gray[600], marginBottom: spacing[3] }}>
                  {creator.tagline}
                </p>
                <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start', gap: spacing[2], marginBottom: spacing[4] }}>
                  {creator.category && <Tag color="blue">{creator.category}</Tag>}
                  {creator.isVerified && <Tag color="green">Verified</Tag>}
                </div>

                {/* Stats Row */}
                <div style={{ display: 'flex', gap: isMobile ? spacing[6] : spacing[12], justifyContent: isMobile ? 'center' : 'flex-start' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.gray[900] }}>
                      <AnimatedCounter end={creator.totalChats || 0} />
                    </div>
                    <div style={{ fontSize: typography.fontSize.sm, color: colors.gray[600] }}>Chats</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.gray[900] }}>
                      <StarFilled style={{ color: colors.warning.solid, marginRight: spacing[2] }} />
                      {creator.rating ? Number(creator.rating).toFixed(1) : 'N/A'}
                    </div>
                    <div style={{ fontSize: typography.fontSize.sm, color: colors.gray[600] }}>Rating</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.success.solid }}>
                      24/7
                    </div>
                    <div style={{ fontSize: typography.fontSize.sm, color: colors.gray[600] }}>Available</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], minWidth: '200px' }}>
                <CustomButton
                  variant="primary"
                  gradient
                  size="large"
                  icon={<MessageOutlined />}
                  onClick={() => navigate(`/chat/${creator.id}`)}
                  block
                >
                  Start Chat
                </CustomButton>
                <FollowButton creatorId={creator.id} size="large" variant="secondary" block showCount />
                <CustomButton variant="ghost" size="large" icon={<ShareAltOutlined />} onClick={handleShare} block>
                  Share
                </CustomButton>
              </div>
            </div>
          </CustomCard>
        </motion.div>

        {/* Main Content */}
        <Row gutter={[32, 32]}>
          {/* Left Column - Tabs */}
          <Col xs={24} lg={16}>
            <Tabs
              activeKey={activeTab}
              items={tabItems}
              onChange={(key) => setActiveTab(key as TabKey)}
              style={{ padding: spacing[4], background: 'white', borderRadius: '16px', boxShadow: shadows.sm }}
              className="creator-tabs"
            />
          </Col>

          {/* Right Sidebar */}
          <Col xs={24} lg={8}>
            {/* Social Links */}
            {(creator.youtubeUrl || creator.instagramUrl || creator.twitterUrl || creator.websiteUrl) && (
              <CustomCard depth={1} style={{ marginBottom: spacing[6], background: 'white', color: colors.gray[900] }}>
                <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[4], color: colors.gray[900] }}>
                  Connect
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                  {creator.youtubeUrl && (
                    <a href={creator.youtubeUrl} target="_blank" rel="noopener noreferrer">
                      <CustomButton variant="secondary" icon={<YoutubeOutlined />} block>
                        YouTube
                      </CustomButton>
                    </a>
                  )}
                  {creator.instagramUrl && (
                    <a href={creator.instagramUrl} target="_blank" rel="noopener noreferrer">
                      <CustomButton variant="secondary" icon={<InstagramOutlined />} block>
                        Instagram
                      </CustomButton>
                    </a>
                  )}
                  {creator.twitterUrl && (
                    <a href={creator.twitterUrl} target="_blank" rel="noopener noreferrer">
                      <CustomButton variant="secondary" icon={<TwitterOutlined />} block>
                        Twitter
                      </CustomButton>
                    </a>
                  )}
                  {creator.websiteUrl && (
                    <a href={creator.websiteUrl} target="_blank" rel="noopener noreferrer">
                      <CustomButton variant="secondary" icon={<GlobalOutlined />} block>
                        Website
                      </CustomButton>
                    </a>
                  )}
                </div>
              </CustomCard>
            )}

            {/* CTA Card */}
            <CustomCard depth={1} gradient style={{ textAlign: 'center', padding: spacing[6] }}>
              <HeartFilled style={{ fontSize: '48px', color: colors.error.solid, marginBottom: spacing[4] }} />
              <h3 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                Ready to chat?
              </h3>
              <p style={{ color: colors.gray[600], marginBottom: spacing[4] }}>
                Get personalized advice powered by AI, trained on {creator.displayName}'s expertise
              </p>
              <CustomButton variant="primary" gradient size="large" block onClick={() => navigate(`/chat/${creator.id}`)}>
                Start Conversation
              </CustomButton>
            </CustomCard>
          </Col>
        </Row>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        visible={shareDialogVisible}
        onClose={() => setShareDialogVisible(false)}
        url={window.location.href}
        title={`${creator?.displayName} on Creator Platform`}
        description={creator?.tagline || creator?.bio}
      />
      <style>{`
        .creator-tabs .ant-tabs-tab {
          padding: 12px 16px !important;
        }
        .creator-tabs .ant-tabs-tab-btn {
          font-weight: 600 !important;
          color: ${colors.gray[600]} !important;
          font-size: 16px !important;
        }
        .creator-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: ${colors.primary.solid} !important;
        }
        .creator-tabs .ant-tabs-nav::before {
          border-bottom: 1px solid ${colors.gray[200]} !important;
        }
      `}</style>
    </motion.div>
  );
};

export default CreatorProfile;
