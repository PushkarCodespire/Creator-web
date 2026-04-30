// ===========================================
// CREATOR GALLERY PAGE - Enhanced
// ===========================================

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Row, Col, Input, Tag, Pagination, Segmented } from 'antd';
import {
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FilterOutlined,
  FireFilled,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { creatorApi } from '../services/api';
import { Creator } from '../types';
import CustomButton from '../components/common/Button/CustomButton';
import { Skeleton } from '../components/common/Loading/Skeleton';
import { EmptyState } from '../components/common/EmptyState/EmptyState';
import { CreatorFilters } from '../components/Search';
import { colors, typography, spacing, shadows } from '../styles/tokens';
import { pageVariants, fadeIn, staggerContainer } from '../styles/animations';
import { logger } from '../utils/logger';
import { CreatorCard } from '../components/Discovery/CreatorCard'; // Import reused card

const { Search } = Input;

type ViewMode = 'grid' | 'list';
type SortBy = 'popular' | 'newest' | 'rating' | 'alphabetical';

const CreatorGallery = () => {
  const _navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [creators, setCreators] = useState<Creator[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(searchParams.get('category') || undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchCreators();
    fetchCategories();
  }, [search, selectedCategory, currentPage, pageSize, priceFilter, minRating, verifiedOnly, sortBy]);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const response = await creatorApi.getAll({
        search,
        category: selectedCategory,
        page: currentPage,
        limit: pageSize,
        priceFilter: priceFilter !== 'all' ? priceFilter : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        verified: verifiedOnly ? 'true' : undefined,
        sortBy,
      });
      setCreators(response.data.data.creators || []);
      setTotal(response.data.data.pagination?.total || 0);
    } catch (error) {
      logger.error('Failed to fetch creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await creatorApi.getCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      logger.error('Failed to fetch categories:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
    setSearchParams({ search: value, ...(selectedCategory && { category: selectedCategory }) });
  };

  const handleCategorySelect = (category: string | undefined) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category) params.category = category;
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSelectedCategory(undefined);
    setPriceFilter('all');
    setMinRating(0);
    setVerifiedOnly(false);
    setCurrentPage(1);
    setSearchParams({});
  };

  // Sort creators client-side
  const sortedCreators = useMemo(() => {
    const sorted = [...creators];
    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      case 'alphabetical':
        return sorted.sort((a, b) => a.displayName.localeCompare(b.displayName));
      case 'popular':
      default:
        return sorted.sort((a, b) => (b.totalChats || 0) - (a.totalChats || 0));
    }
  }, [creators, sortBy]);

  // Featured creators (top 3 by chats)
  const featuredCreators = useMemo(() => {
    return [...creators].sort((a, b) => (b.totalChats || 0) - (a.totalChats || 0)).slice(0, 3);
  }, [creators]);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      {/* Header Section */}
      <div style={{ background: '#ffffff', padding: isMobile ? '40px 20px' : '60px 0', borderBottom: `1px solid ${colors.gray[200]}` }}>
        <div className="container">
          <motion.div variants={fadeIn}>
            <h1 style={{
              fontSize: typography.fontSize['4xl'],
              fontWeight: typography.fontWeight.bold,
              marginBottom: spacing[3],
              color: colors.text.primary // Ensure visible text
            }}>
              Discover Creators
            </h1>
            <p style={{ fontSize: typography.fontSize.lg, color: colors.gray[600], marginBottom: spacing[6] }}>
              Connect with {total}+ verified experts across various niches
            </p>

            {/* Search Bar */}
            <div style={{ maxWidth: '700px', position: 'relative' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#ffffff',
                  borderRadius: '100px',
                  padding: '4px 6px 4px 20px',
                  border: `1px solid ${colors.gray[200]}`,
                  boxShadow: shadows.md,
                  transition: 'all 0.3s ease',
                }}
                className="search-input-wrapper"
              >
                <SearchOutlined style={{ color: colors.gray[400], fontSize: 18, marginRight: 12 }} />
                <Input
                  placeholder="Search by name, category, or expertise..."
                  variant="borderless"
                  size="large"
                  defaultValue={search}
                  onPressEnter={(e: React.KeyboardEvent<HTMLInputElement>) => handleSearch((e.target as HTMLInputElement).value)}
                  onChange={(e) => {
                    if (e.target.value === '') handleSearch('');
                  }}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    fontWeight: 500,
                    background: 'transparent',
                    color: colors.text.primary,
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('.search-input-wrapper input') as HTMLInputElement;
                    if (input) handleSearch(input.value);
                  }}
                  style={{
                    background: colors.primary.solid,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '100px',
                    padding: '10px 24px',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: `0 4px 12px ${colors.primary.light}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = `0 6px 16px ${colors.primary.light}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary.light}`;
                  }}
                >
                  <SearchOutlined />
                  {!isMobile && "Find Creators"}
                </button>
              </div>

              <style>{`
                .search-input-wrapper:focus-within {
                  border-color: ${colors.primary.solid} !important;
                  boxShadow: 0 0 0 4px ${colors.primary.light} !important;
                  transform: translateY(-1px);
                }
                .search-input-wrapper input::placeholder {
                  color: ${colors.gray[400]};
                }
              `}</style>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Featured Creators (Only when no filters active) */}
      {!search && !selectedCategory && featuredCreators.length > 0 && (
        <div style={{ background: '#FAFBFC', padding: isMobile ? '40px 0' : '60px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[6] }}>
              <FireFilled style={{ fontSize: '24px', color: colors.error.solid }} />
              <h2 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, margin: 0, color: colors.text.primary }}>
                Trending Now
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: spacing[6] }}>
              {featuredCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} layout="grid" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ padding: isMobile ? '40px 0' : '60px 0', background: '#FFFFFF' }}>
        <div className="container">
          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[6], flexWrap: 'wrap', gap: spacing[4] }}>
            <div>
              <span style={{ color: colors.text.primary, fontWeight: 600, marginRight: spacing[4] }}>
                {total} creator{total !== 1 ? 's' : ''} found
              </span>
              {selectedCategory && (
                <Tag closable onClose={() => handleCategorySelect(undefined)} color="blue">
                  {selectedCategory}
                </Tag>
              )}
            </div>

            <div style={{ display: 'flex', gap: spacing[3], alignItems: 'center' }}>
              <CustomButton
                variant="secondary"
                icon={<FilterOutlined />}
                onClick={() => setFilterDrawerVisible(true)}
              >
                {isMobile ? 'Filters' : 'Advanced Filters'}
              </CustomButton>
              {!isMobile && (
                <Segmented
                  options={[
                    { label: 'Grid', value: 'grid', icon: <AppstoreOutlined /> },
                    { label: 'List', value: 'list', icon: <UnorderedListOutlined /> },
                  ]}
                  value={viewMode}
                  onChange={(value) => setViewMode(value as ViewMode)}
                />
              )}
            </div>
          </div>

          {/* Content Grid with Sidebar */}
          <Row gutter={[40, 40]}>
            {/* Sidebar Filters (Desktop) */}
            {!isMobile && (
              <Col span={6}>
                <div style={{ position: 'sticky', top: '24px' }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: 24,
                    padding: '24px',
                    border: `1px solid ${colors.gray[200]}`,
                    boxShadow: shadows.sm
                  }}>
                    <div>
                      {/* Sort By */}
                      <div style={{ marginBottom: spacing[6] }}>
                        <h4 style={{
                          marginBottom: spacing[3],
                          fontSize: 12,
                          fontWeight: 700,
                          color: colors.gray[500],
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Sort By
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                          {[
                            { key: 'popular', label: 'Most Popular' },
                            { key: 'rating', label: 'Highest Rated' },
                            { key: 'newest', label: 'Newest First' },
                            { key: 'alphabetical', label: 'A-Z' },
                          ].map((option) => {
                            const isActive = sortBy === option.key;
                            return (
                              <div
                                key={option.key}
                                onClick={() => setSortBy(option.key as SortBy)}
                                style={{
                                  padding: '10px 16px',
                                  borderRadius: 12,
                                  cursor: 'pointer',
                                  background: isActive ? colors.primary.light : 'transparent',
                                  border: `1px solid ${isActive ? colors.primary.light : 'transparent'}`,
                                  fontWeight: isActive ? 600 : 500,
                                  color: isActive ? colors.primary.solid : colors.gray[700],
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isActive) {
                                    e.currentTarget.style.background = colors.gray[50];
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isActive) {
                                    e.currentTarget.style.background = 'transparent';
                                  }
                                }}
                              >
                                {option.label}
                                {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors.primary.solid }} />}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Categories */}
                      <div>
                        <h4 style={{
                          marginBottom: spacing[3],
                          fontSize: 12,
                          fontWeight: 700,
                          color: colors.gray[500],
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Categories
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          <CategoryTag
                            label="All"
                            isActive={!selectedCategory}
                            onClick={() => handleCategorySelect(undefined)}
                          />
                          {categories.map((cat) => (
                            <CategoryTag
                              key={cat.name}
                              label={cat.name}
                              count={cat.count}
                              isActive={selectedCategory === cat.name}
                              onClick={() => handleCategorySelect(cat.name)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            )}

            {/* Creators Grid/List */}
            <Col span={isMobile ? 24 : 18}>
              {loading ? (
                <Skeleton type="card" count={pageSize} />
              ) : sortedCreators.length === 0 ? (
                <EmptyState
                  type="no-results"
                  title="No creators found"
                  description="Try adjusting your search or filters"
                  actionText="Clear Filters"
                  onAction={() => {
                    setSearch('');
                    setSelectedCategory(undefined);
                    setSearchParams({});
                  }}
                />
              ) : (
                <>
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: viewMode === 'grid' ? (isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))') : '1fr',
                      gap: isMobile ? spacing[4] : spacing[6]
                    }}
                  >
                    {sortedCreators.map((creator) => (
                      <CreatorCard key={creator.id} creator={creator} layout={viewMode === 'grid' ? 'grid' : 'list'} />
                    ))}
                  </motion.div>

                  {/* Pagination */}
                  {total > pageSize && (
                    <div style={{ marginTop: spacing[8], display: 'flex', justifyContent: 'center' }}>
                      <Pagination
                        current={currentPage}
                        total={total}
                        pageSize={pageSize}
                        onChange={(page) => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onShowSizeChange={(_current, size) => {
                          setPageSize(size);
                          setCurrentPage(1);
                        }}
                        showSizeChanger
                        pageSizeOptions={['12', '24', '48', '96']}
                        showTotal={(total) => `Total ${total} creators`}
                      />
                    </div>
                  )}
                </>
              )}
            </Col>
          </Row>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <CreatorFilters
        categories={categories}
        selectedCategory={selectedCategory}
        priceFilter={priceFilter}
        minRating={minRating}
        verifiedOnly={verifiedOnly}
        onCategoryChange={handleCategorySelect}
        onPriceFilterChange={setPriceFilter}
        onRatingChange={setMinRating}
        onVerifiedChange={setVerifiedOnly}
        onReset={handleResetFilters}
        visible={filterDrawerVisible}
        onClose={() => setFilterDrawerVisible(false)}
      />
    </motion.div>
  );
};

// Helper Component for Sidebar
const CategoryTag = ({ label, count, isActive, onClick }: { label: string, count?: number, isActive: boolean, onClick: () => void }) => (
  <div
    onClick={onClick}
    style={{
      padding: '6px 12px',
      borderRadius: 100,
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
      background: isActive ? colors.primary.solid : colors.gray[100],
      color: isActive ? '#fff' : colors.gray[700],
      transition: 'all 0.2s',
      border: `1px solid ${isActive ? colors.primary.solid : 'transparent'}`,
    }}
    onMouseEnter={(e) => {
      if (!isActive) {
        e.currentTarget.style.background = colors.gray[200];
      }
    }}
    onMouseLeave={(e) => {
      if (!isActive) {
        e.currentTarget.style.background = colors.gray[100];
      }
    }}
  >
    {label} {count !== undefined && <span style={{ opacity: 0.8, fontSize: 11, marginLeft: 4 }}>{count}</span>}
  </div>
);

export default CreatorGallery;
