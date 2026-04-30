// ===========================================
// FEATURED CREATORS COMPONENT
// Premium Carousel/Grid Display for Top Creators
// ===========================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RightOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import { creatorApi } from '../../services/api';
import { logger } from '../../utils/logger';
import { Creator } from '../../types';
import { colors, spacing, typography, shadows } from '../../styles/tokens';
import { CreatorCard } from './CreatorCard';

interface FeaturedCreatorsProps {
  limit?: number;
  category?: string;
  viewMode?: 'carousel' | 'grid'; // Control layout mode
  showHeading?: boolean; // Toggle internal heading
}

export const FeaturedCreators: React.FC<FeaturedCreatorsProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  limit = 8,
  category,
  viewMode = 'carousel',
  showHeading = false
}) => {
  const _navigate = useNavigate();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFeaturedCreators();
  }, [category]);

  const fetchFeaturedCreators = async () => {
    try {
      setLoading(true);
      // Fetch more than limit to allow scrolling
      const response = await creatorApi.getAll({
        category,
        limit: 20,
        page: 1,
      });
      const sorted = (response.data.data.creators || []).sort((a: Creator, b: Creator) => {
        // Sort by "Popularity" (Rating + Chats mix)
        const scoreA = (a.rating || 0) * 10 + (a.totalChats || 0);
        const scoreB = (b.rating || 0) * 10 + (b.totalChats || 0);
        return scoreB - scoreA;
      });
      setCreators(sorted);
    } catch (error) {
      logger.error('Failed to fetch featured creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Approx card width + gap
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', gap: 20, overflow: 'hidden', padding: '20px 0' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          minWidth: 280,
          height: 380,
          background: '#f0f2f5',
          borderRadius: 24,
          animation: 'pulse 1.5s infinite'
        }} />
      ))}
    </div>
  );

  if (creators.length === 0) return null;

  return (
    <div style={{ position: 'relative' }}>
      {showHeading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[6] }}>
          <h2 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }}>
            Featured Creators
          </h2>
        </div>
      )}

      {/* Navigation Buttons for Carousel */}
      {viewMode === 'carousel' && (
        <>
          <NavigationButton direction="left" onClick={() => scroll('left')} />
          <NavigationButton direction="right" onClick={() => scroll('right')} />
        </>
      )}

      <div
        ref={scrollContainerRef}
        style={{
          display: viewMode === 'grid' ? 'grid' : 'flex',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
          gap: spacing[4],
          overflowX: viewMode === 'carousel' ? 'auto' : 'visible',
          padding: '24px 4px', // Space for shadows
          scrollSnapType: viewMode === 'carousel' ? 'x mandatory' : 'none',
          scrollbarWidth: 'none', // Hide scrollbar Firefox
          msOverflowStyle: 'none', // Hide scrollbar IE/Edge
        }}
        className="hide-scrollbar"
      >
        {creators.slice(0, viewMode === 'grid' ? undefined : 12).map((creator) => (
          <CreatorCard key={creator.id} creator={creator} layout={viewMode} />
        ))}
      </div>

      {/* Styles for scrollbar hiding */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// --- Sub-components ---

const NavigationButton = ({ direction, onClick }: { direction: 'left' | 'right', onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      position: 'absolute',
      top: '50%',
      left: direction === 'left' ? -20 : 'auto',
      right: direction === 'right' ? -20 : 'auto',
      transform: 'translateY(-50%)',
      width: 48,
      height: 48,
      borderRadius: '50%',
      border: '1px solid #E5E7EB',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(8px)',
      boxShadow: shadows.lg,
      zIndex: 10,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.text.primary,
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
      e.currentTarget.style.background = '#fff';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
    }}
  >
    {direction === 'left' ? <LeftOutlined /> : <RightOutlined />}
  </button>
);

export default FeaturedCreators;
