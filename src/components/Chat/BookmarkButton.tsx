// ===========================================
// BOOKMARK BUTTON COMPONENT
// ===========================================

import { useState } from 'react';
import { Tooltip, message as antMessage } from 'antd';
import { BookOutlined, BookFilled } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { bookmarkApi } from '../../services/api';
import { colors } from '../../styles/tokens';

interface BookmarkButtonProps {
  messageId: string;
  isBookmarked?: boolean;
  onBookmarkChange?: (bookmarked: boolean) => void;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  messageId,
  isBookmarked = false,
  onBookmarkChange,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [loading, setLoading] = useState(false);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      antMessage.info('Please login to bookmark messages');
      return;
    }

    try {
      setLoading(true);

      if (bookmarked) {
        await bookmarkApi.removeBookmark(messageId);
        setBookmarked(false);
        antMessage.success('Bookmark removed');
        if (onBookmarkChange) onBookmarkChange(false);
      } else {
        await bookmarkApi.addBookmark(messageId);
        setBookmarked(true);
        antMessage.success('Message bookmarked');
        if (onBookmarkChange) onBookmarkChange(true);
      }
    } catch (error: any) {
      console.error('Failed to toggle bookmark:', error);
      antMessage.error(error.response?.data?.error || 'Failed to update bookmark');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={bookmarked ? 'Remove bookmark' : 'Bookmark message'}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleBookmark}
        style={{
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          opacity: loading ? 0.5 : 1,
        }}
      >
        {bookmarked ? (
          <BookFilled
            style={{
              fontSize: '16px',
              color: colors.warning.solid,
            }}
          />
        ) : (
          <BookOutlined
            style={{
              fontSize: '16px',
              color: colors.gray[500],
            }}
          />
        )}
      </motion.div>
    </Tooltip>
  );
};

export default BookmarkButton;
