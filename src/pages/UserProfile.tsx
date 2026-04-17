// ===========================================
// USER PROFILE PAGE
// Display user/creator profile with posts and stats
// ===========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  EditOutlined,
  SettingOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
  CalendarOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { Tabs, message } from 'antd';
// eslint-disable-next-line no-duplicate-imports
import type { TabsProps } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { creatorApi, postApi, followApi } from '../services/api';
import { PostCard, PostData } from '../components/Post';
import { FollowButton } from '../components/Follow';
import CustomButton from '../components/common/Button/CustomButton';
import CustomCard from '../components/common/Card/CustomCard';
import CustomAvatar from '../components/common/Avatar/Avatar';
import { Skeleton } from '../components/common/Loading/Skeleton';
import { EmptyState } from '../components/common/EmptyState/EmptyState';
import { pageVariants, fadeIn, slideUp } from '../styles/animations';
import { logger } from '../utils/logger';
import { colors, spacing, typography, shadows } from '../styles/tokens';

interface UserProfileData {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: string;
  createdAt: string;
  creator?: {
    id: string;
    displayName: string;
    bio?: string;
    category?: string;
    profileImage?: string;
    coverImage?: string;
    isVerified: boolean;
    location?: string;
    website?: string;
    socialLinks?: Record<string, string>;
  };
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  const isOwnProfile = currentUser?.id === userId;
  const isCreator = profile?.role === 'CREATOR';

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadPosts();
      loadFollowStats();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);

      // Load creator profile if it's a creator
      const response = await creatorApi.getById(userId!);
      const creatorData = response.data.data;

      // Construct profile data
      setProfile({
        id: userId!,
        name: creatorData.displayName,
        avatar: creatorData.profileImage,
        role: 'CREATOR',
        createdAt: creatorData.createdAt,
        creator: creatorData,
      });
    } catch (error: unknown) {
      logger.error('Error loading profile:', error);
      message.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await postApi.getFeed({
        creatorId: userId,
        limit: 20,
      });

      setPosts(response.data.data.posts);
    } catch (error) {
      logger.error('Error loading posts:', error);
    }
  };

  const loadFollowStats = async () => {
    try {
      const response = await followApi.getFollowStats(userId!);
      setFollowStats(response.data.data);

      // Check if current user is following
      if (isAuthenticated && !isOwnProfile) {
        const followResponse = await followApi.checkFollowing(userId!);
        setIsFollowing(followResponse.data.data.isFollowing);
      }
    } catch (error) {
      logger.error('Error loading follow stats:', error);
    }
  };

  const handleFollowChange = (following: boolean, newCount: number) => {
    setIsFollowing(following);
    setFollowStats((prev) => ({ ...prev, followers: newCount }));
  };

  const handleEditProfile = () => {
    if (isCreator) {
      navigate('/creator-dashboard/settings');
    } else {
      navigate('/dashboard/profile');
    }
  };

  const tabItems: TabsProps['items'] = [
    {
      key: 'posts',
      label: `Posts (${posts.length})`,
      children: (
        <div>
          {posts.length === 0 ? (
            <EmptyState
              type="no-posts"
              title="No posts yet"
              description={
                isOwnProfile
                  ? 'Start sharing your thoughts with your followers'
                  : `${profile?.name} hasn't posted anything yet`
              }
              actionText={isOwnProfile ? 'Create Post' : undefined}
              onAction={isOwnProfile ? () => navigate('/feed') : undefined}
            />
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                showActions={true}
                onPostDelete={(postId) => setPosts((prev) => prev.filter((p) => p.id !== postId))}
              />
            ))
          )}
        </div>
      ),
    },
    {
      key: 'about',
      label: 'About',
      children: (
        <CustomCard depth={1}>
          <div style={{ padding: spacing[4] }}>
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing[4],
              }}
            >
              About
            </h3>
            {profile?.creator?.bio ? (
              <p
                style={{
                  fontSize: typography.fontSize.base,
                  lineHeight: '1.6',
                  color: colors.gray[700],
                  marginBottom: spacing[4],
                }}
              >
                {profile.creator.bio}
              </p>
            ) : (
              <p style={{ color: colors.gray[500] }}>No bio available</p>
            )}

            {profile?.creator?.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] }}>
                <EnvironmentOutlined style={{ color: colors.gray[500] }} />
                <span style={{ color: colors.gray[700] }}>{profile.creator.location}</span>
              </div>
            )}

            {profile?.creator?.website && (
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] }}>
                <LinkOutlined style={{ color: colors.gray[500] }} />
                <a
                  href={profile.creator.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: colors.primary.solid }}
                >
                  {profile.creator.website}
                </a>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <CalendarOutlined style={{ color: colors.gray[500] }} />
              <span style={{ color: colors.gray[700] }}>
                Joined {new Date(profile?.createdAt || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </CustomCard>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: spacing[4] }}>
        <Skeleton type="card" count={1} />
      </div>
    );
  }

  if (!profile) {
    return (
      <EmptyState
        type="error"
        title="Profile not found"
        description="The profile you're looking for doesn't exist"
        actionText="Go Home"
        onAction={() => navigate('/')}
      />
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      style={{
        minHeight: '100vh',
        background: colors.gray[50],
      }}
    >
      {/* Cover Image */}
      <div
        style={{
          height: '300px',
          background: profile.creator?.coverImage
            ? `url(${profile.creator.coverImage}) center/cover`
            : colors.primary.gradient,
          position: 'relative',
        }}
      />

      {/* Profile Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: `0 ${spacing[4]}` }}>
        {/* Profile Header Card */}
        <motion.div variants={slideUp} style={{ marginTop: '-80px', marginBottom: spacing[6] }}>
          <CustomCard depth={2}>
            <div style={{ padding: spacing[6] }}>
              {/* Avatar and Name Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: spacing[4],
                }}
              >
                {/* Left: Avatar and Name */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[4] }}>
                  <CustomAvatar
                    src={profile.creator?.profileImage || profile.avatar}
                    alt={profile.name}
                    size={120}
                    verified={profile.creator?.isVerified}
                    style={{
                      border: `4px solid white`,
                      boxShadow: shadows.lg,
                    }}
                  />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
                      <h1
                        style={{
                          fontSize: typography.fontSize['3xl'],
                          fontWeight: typography.fontWeight.bold,
                          color: colors.gray[900],
                          margin: 0,
                        }}
                      >
                        {profile.creator?.displayName || profile.name}
                      </h1>
                      {profile.creator?.isVerified && (
                        <CheckCircleFilled style={{ color: colors.primary.solid, fontSize: '24px' }} />
                      )}
                    </div>

                    {profile.creator?.category && (
                      <p
                        style={{
                          fontSize: typography.fontSize.base,
                          color: colors.gray[600],
                          marginBottom: spacing[3],
                        }}
                      >
                        {profile.creator.category}
                      </p>
                    )}

                    {/* Stats Row */}
                    <div style={{ display: 'flex', gap: spacing[6] }}>
                      <div>
                        <span
                          style={{
                            fontSize: typography.fontSize.xl,
                            fontWeight: typography.fontWeight.bold,
                            color: colors.gray[900],
                          }}
                        >
                          {posts.length}
                        </span>
                        <span style={{ color: colors.gray[600], marginLeft: spacing[2] }}>Posts</span>
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: typography.fontSize.xl,
                            fontWeight: typography.fontWeight.bold,
                            color: colors.gray[900],
                          }}
                        >
                          {followStats.followers.toLocaleString()}
                        </span>
                        <span style={{ color: colors.gray[600], marginLeft: spacing[2] }}>Followers</span>
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: typography.fontSize.xl,
                            fontWeight: typography.fontWeight.bold,
                            color: colors.gray[900],
                          }}
                        >
                          {followStats.following.toLocaleString()}
                        </span>
                        <span style={{ color: colors.gray[600], marginLeft: spacing[2] }}>Following</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div style={{ display: 'flex', gap: spacing[2] }}>
                  {isOwnProfile ? (
                    <>
                      <CustomButton variant="secondary" icon={<EditOutlined />} onClick={handleEditProfile}>
                        Edit Profile
                      </CustomButton>
                      <CustomButton variant="ghost" icon={<SettingOutlined />} onClick={handleEditProfile}>
                        Settings
                      </CustomButton>
                    </>
                  ) : (
                    <>
                      {isCreator && (
                        <FollowButton
                          creatorId={userId!}
                          initialFollowing={isFollowing}
                          initialFollowerCount={followStats.followers}
                          size="large"
                          variant="primary"
                          onFollowChange={handleFollowChange}
                        />
                      )}
                      <CustomButton variant="secondary" onClick={() => navigate(`/chat/${userId}`)}>
                        Message
                      </CustomButton>
                    </>
                  )}
                </div>
              </div>

              {/* Bio (short version) */}
              {profile.creator?.bio && (
                <p
                  style={{
                    marginTop: spacing[4],
                    fontSize: typography.fontSize.base,
                    lineHeight: '1.6',
                    color: colors.gray[700],
                    maxWidth: '600px',
                  }}
                >
                  {profile.creator.bio.length > 200
                    ? `${profile.creator.bio.substring(0, 200)}...`
                    : profile.creator.bio}
                </p>
              )}
            </div>
          </CustomCard>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeIn}>
          <Tabs activeKey={activeTab} items={tabItems} onChange={setActiveTab} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
