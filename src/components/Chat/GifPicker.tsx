// ===========================================
// GIF PICKER COMPONENT
// ===========================================

import { useState, useEffect, useRef } from 'react';
import { Input, Spin, Empty, Tabs } from 'antd';
import { SearchOutlined, FireOutlined, SmileOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, spacing, typography } from '../../styles/tokens';
import { logger } from '../../utils/logger';

const { Search } = Input;

interface GifData {
  id: string;
  url: string;
  title: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
    downsized: {
      url: string;
      width: string;
      height: string;
    };
  };
}

interface GifPickerProps {
  onGifSelect: (gifUrl: string) => void;
  apiKey?: string;
}

export const GifPicker: React.FC<GifPickerProps> = ({
  onGifSelect,
  apiKey = 'YOUR_GIPHY_API_KEY' // Default demo key, should be replaced with env variable
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState<GifData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'trending' | 'search'>('trending');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch trending GIFs on mount
  useEffect(() => {
    fetchTrendingGifs();
  }, []);

  const fetchTrendingGifs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=30&rating=g`
      );
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      logger.error('Failed to fetch trending GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      fetchTrendingGifs();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(
          query
        )}&limit=30&rating=g`
      );
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      logger.error('Failed to search GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setActiveTab('search');

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchGifs(value);
    }, 500);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key as 'trending' | 'search');
    if (key === 'trending') {
      setSearchQuery('');
      fetchTrendingGifs();
    }
  };

  const handleGifClick = (gif: GifData) => {
    // Use downsized version for better performance
    onGifSelect(gif.images.downsized.url);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        borderRadius: '12px',
      }}
    >
      {/* Search Bar */}
      <div style={{ padding: spacing[4], borderBottom: `1px solid ${colors.gray[200]}` }}>
        <Search
          placeholder="Search GIFs..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          size="large"
          style={{ borderRadius: '12px' }}
        />
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        style={{ padding: `0 ${spacing[4]}`, flex: 0 }}
        items={[
          {
            key: 'trending',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                <FireOutlined />
                Trending
              </span>
            ),
          },
          {
            key: 'search',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                <SearchOutlined />
                Search Results
              </span>
            ),
          },
        ]}
      />

      {/* GIF Grid */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: spacing[4],
          paddingTop: spacing[2],
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Spin size="large" />
          </div>
        ) : gifs.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              activeTab === 'search' ? (
                <span>No GIFs found for "{searchQuery}"</span>
              ) : (
                'No trending GIFs available'
              )
            }
            style={{ marginTop: spacing[8] }}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: spacing[2],
            }}
          >
            <AnimatePresence>
              {gifs.map((gif) => (
                <motion.div
                  key={gif.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGifClick(gif)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative',
                    aspectRatio: '1',
                    background: colors.gray[100],
                  }}
                >
                  <img
                    src={gif.images.fixed_height.url}
                    alt={gif.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <SmileOutlined style={{ fontSize: '24px', color: 'white' }} />
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Powered by Giphy */}
      <div
        style={{
          padding: spacing[2],
          textAlign: 'center',
          borderTop: `1px solid ${colors.gray[200]}`,
          fontSize: typography.fontSize.xs,
          color: colors.gray[500],
        }}
      >
        Powered by <strong>GIPHY</strong>
      </div>
    </div>
  );
};

export default GifPicker;
