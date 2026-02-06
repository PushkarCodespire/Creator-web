// ===========================================
// COMMENT SECTION COMPONENT
// ===========================================

import { useState, useEffect } from 'react';
import { Segmented, Spin, Empty, Divider } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { commentApi } from '../../services/api';
import CommentComposer from './CommentComposer';
import CommentItem from './CommentItem';
import CustomButton from '../common/Button/CustomButton';
import { colors, spacing, typography } from '../../styles/tokens';
import { fadeIn, staggerContainer } from '../../styles/animations';
import { Comment } from '../../types';

interface CommentSectionProps {
  postId: string;
  initialCommentsCount?: number;
}

type SortBy = 'newest' | 'oldest' | 'popular';

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, initialCommentsCount = 0 }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalComments, setTotalComments] = useState(initialCommentsCount);

  const limit = 10;

  // Fetch comments
  const fetchComments = async (currentPage: number, currentSort: SortBy, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await commentApi.getComments(postId, {
        page: currentPage,
        limit,
        sort: currentSort,
      });

      const { comments: fetchedComments, pagination } = response.data.data;

      if (append) {
        setComments((prev) => [...prev, ...fetchedComments]);
      } else {
        setComments(fetchedComments);
      }

      setTotalComments(pagination.total);
      setHasMore(currentPage < pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchComments(1, sortBy);
  }, [postId, sortBy]);

  // Handle sort change
  const handleSortChange = (value: string | number) => {
    setSortBy(value as SortBy);
    setPage(1);
    setHasMore(true);
  };

  // Load more comments
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, sortBy, true);
  };

  // Handle new comment added
  const handleCommentAdded = (comment: Comment) => {
    setComments([comment, ...comments]);
    setTotalComments((prev) => prev + 1);
  };

  // Handle comment update
  const handleCommentUpdate = (commentId: string, updatedComment: Comment) => {
    setComments(comments.map((c) => (c.id === commentId ? updatedComment : c)));
  };

  // Handle comment delete
  const handleCommentDelete = (commentId: string) => {
    setComments(comments.filter((c) => c.id !== commentId));
    setTotalComments((prev) => prev - 1);
  };

  // Handle reply added
  const handleReplyAdded = (parentId: string, reply: Comment) => {
    setTotalComments((prev) => prev + 1);
    // Update parent comment's reply count if needed
    setComments(
      comments.map((c) => {
        if (c.id === parentId && c._count) {
          return { ...c, _count: { ...c._count, replies: c._count.replies + 1 } };
        }
        return c;
      })
    );
  };

  return (
    <div style={{ marginTop: spacing[8] }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[6] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <CommentOutlined style={{ fontSize: typography.fontSize['2xl'], color: colors.primary.solid }} />
          <h3 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, margin: 0 }}>
            Comments {totalComments > 0 && <span style={{ color: colors.gray[500] }}>({totalComments})</span>}
          </h3>
        </div>

        {/* Sort Options */}
        {comments.length > 0 && (
          <Segmented
            options={[
              { label: 'Newest', value: 'newest' },
              { label: 'Oldest', value: 'oldest' },
              { label: 'Popular', value: 'popular' },
            ]}
            value={sortBy}
            onChange={handleSortChange}
          />
        )}
      </div>

      <Divider style={{ margin: `${spacing[4]} 0` }} />

      {/* Comment Composer */}
      {isAuthenticated ? (
        <CommentComposer postId={postId} onCommentAdded={handleCommentAdded} />
      ) : (
        <motion.div
          variants={fadeIn}
          style={{
            padding: spacing[6],
            background: colors.gray[50],
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: spacing[6],
          }}
        >
          <p style={{ fontSize: typography.fontSize.base, color: colors.gray[600], marginBottom: spacing[4] }}>
            Please log in to leave a comment
          </p>
          <CustomButton variant="primary" gradient onClick={() => navigate('/login')}>
            Log In
          </CustomButton>
        </motion.div>
      )}

      {/* Comments List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: spacing[8] }}>
          <Spin size="large" />
        </div>
      ) : comments.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span style={{ color: colors.gray[500] }}>
              No comments yet. {isAuthenticated && 'Be the first to comment!'}
            </span>
          }
          style={{ padding: spacing[8] }}
        />
      ) : (
        <>
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                onCommentUpdate={handleCommentUpdate}
                onCommentDelete={handleCommentDelete}
                onReplyAdded={(reply) => handleReplyAdded(comment.id, reply)}
              />
            ))}
          </motion.div>

          {/* Load More Button */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: spacing[6] }}>
              <CustomButton variant="secondary" size="large" onClick={handleLoadMore} loading={loadingMore}>
                Load More Comments
              </CustomButton>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentSection;
