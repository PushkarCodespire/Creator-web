// ===========================================
// CREATOR FILTERS COMPONENT
// Advanced filtering for creator gallery
// ===========================================

import { useState } from 'react';
import { Drawer, Select, Slider, Switch, Button, Space, Tag } from 'antd';
import { FilterOutlined, CloseOutlined } from '@ant-design/icons';
import { colors, spacing, typography } from '../../styles/tokens';

const { Option } = Select;

interface CreatorFiltersProps {
  categories: { name: string; count: number }[];
  selectedCategory?: string;
  priceFilter?: 'all' | 'free' | 'premium';
  minRating?: number;
  verifiedOnly?: boolean;
  onCategoryChange: (category: string | undefined) => void;
  onPriceFilterChange: (filter: 'all' | 'free' | 'premium') => void;
  onRatingChange: (rating: number) => void;
  onVerifiedChange: (verified: boolean) => void;
  onReset: () => void;
  visible: boolean;
  onClose: () => void;
}

export const CreatorFilters: React.FC<CreatorFiltersProps> = ({
  categories,
  selectedCategory,
  priceFilter = 'all',
  minRating = 0,
  verifiedOnly = false,
  onCategoryChange,
  onPriceFilterChange,
  onRatingChange,
  onVerifiedChange,
  onReset,
  visible,
  onClose,
}) => {
  const [localRating, setLocalRating] = useState(minRating);

  const hasActiveFilters = selectedCategory || priceFilter !== 'all' || minRating > 0 || verifiedOnly;

  const handleApply = () => {
    onRatingChange(localRating);
    onClose();
  };

  const handleReset = () => {
    setLocalRating(0);
    onReset();
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], color: colors.dark.text.primary }}>
            <FilterOutlined style={{ fontSize: 18 }} />
            <span style={{ fontSize: 18, fontWeight: 700 }}>Filters</span>
          </div>
          {hasActiveFilters && (
            <Button
              type="text"
              size="small"
              onClick={handleReset}
              style={{ color: colors.primary.light, fontSize: 13, fontWeight: 600 }}
            >
              Reset All
            </Button>
          )}
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={360}
      styles={{
        header: {
          background: colors.dark.surface,
          borderBottom: `1px solid ${colors.gray[800]}`,
          padding: '20px 24px',
        },
        body: {
          background: colors.dark.surface,
          padding: '32px 24px',
          color: colors.dark.text.primary,
        },
        mask: {
          backdropFilter: 'blur(4px)',
          background: 'rgba(0, 0, 0, 0.4)',
        }
      }}
      closeIcon={<CloseOutlined style={{ color: colors.dark.text.secondary }} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        <Space direction="vertical" size={32} style={{ width: '100%', marginBottom: 100 }}>
          {/* Category Filter */}
          <div className="filter-section">
            <h4 style={labelStyle}>Category</h4>
            <Select
              style={{ width: '100%' }}
              placeholder="All Categories"
              value={selectedCategory}
              onChange={onCategoryChange}
              allowClear
              className="custom-filter-select"
              dropdownStyle={{ background: colors.dark.elevated, border: `1px solid ${colors.gray[700]}` }}
            >
              {categories.map((cat) => (
                <Option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.count})
                </Option>
              ))}
            </Select>
          </div>

          {/* Price Filter */}
          <div className="filter-section">
            <h4 style={labelStyle}>Price</h4>
            <Select
              style={{ width: '100%' }}
              value={priceFilter}
              onChange={onPriceFilterChange}
              className="custom-filter-select"
            >
              <Option value="all">All Creators</Option>
              <Option value="free">Free Only</Option>
              <Option value="premium">Premium Only</Option>
            </Select>
          </div>

          {/* Rating Filter */}
          <div className="filter-section">
            <h4 style={labelStyle}>
              Minimum Rating: <span style={{ color: colors.primary.light }}>{localRating > 0 ? `${localRating}+` : 'Any'}</span>
            </h4>
            <Slider
              min={0}
              max={5}
              step={0.5}
              value={localRating}
              onChange={setLocalRating}
              marks={{
                0: { style: markStyle, label: 'Any' },
                3: { style: markStyle, label: '3+' },
                4: { style: markStyle, label: '4+' },
                5: { style: markStyle, label: '5' },
              }}
              tooltip={{ open: false }}
              styles={{
                track: { background: colors.primary.solid },
                handle: { background: colors.primary.solid, border: '2px solid #fff' }
              }}
            />
          </div>

          {/* Verified Filter */}
          <div className="filter-section">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ ...labelStyle, marginBottom: 2 }}>Verified Only</h4>
                <p style={{
                  fontSize: 13,
                  color: colors.dark.text.secondary,
                  margin: 0
                }}>
                  Show only verified creators
                </p>
              </div>
              <Switch
                checked={verifiedOnly}
                onChange={onVerifiedChange}
                style={{ background: verifiedOnly ? colors.primary.solid : colors.gray[700] }}
              />
            </div>
          </div>
        </Space>

        {/* Action Buttons - Fixed at bottom */}
        <div style={{
          position: 'absolute',
          bottom: -32, // Offset body padding
          left: -24,
          right: -24,
          padding: '24px',
          background: colors.dark.surface,
          borderTop: `1px solid ${colors.gray[800]}`,
          display: 'flex',
          gap: spacing[3],
          zIndex: 10
        }}>
          <Button
            block
            size="large"
            onClick={onClose}
            style={{
              background: colors.gray[900],
              color: '#fff',
              border: `1px solid ${colors.gray[700]}`,
              borderRadius: 12,
              height: 48,
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            block
            size="large"
            onClick={handleApply}
            style={{
              background: colors.primary.solid,
              borderRadius: 12,
              height: 48,
              fontWeight: 600,
              boxShadow: `0 4px 12px ${colors.primary.dark}44`
            }}
          >
            Apply Filters
          </Button>
        </div>
      </div>

      <style>{`
        .custom-filter-select .ant-select-selector {
          background: ${colors.gray[900]} !important;
          border-color: ${colors.gray[700]} !important;
          color: #fff !important;
          height: 48px !important;
          padding: 8px 16px !important;
          border-radius: 12px !important;
        }
        .custom-filter-select .ant-select-arrow {
          color: ${colors.gray[400]};
        }
        .ant-select-dropdown {
          background-color: ${colors.dark.elevated} !important;
          padding: 8px !important;
          border-radius: 12px !important;
          border: 1px solid ${colors.gray[800]} !important;
        }
        .ant-select-item {
          color: ${colors.dark.text.secondary} !important;
          border-radius: 8px !important;
          margin-bottom: 4px !important;
        }
        .ant-select-item-option-selected {
          background-color: ${colors.primary.dark} !important;
          color: #fff !important;
        }
        .ant-select-item-option-active {
          background-color: ${colors.gray[800]} !important;
          color: #fff !important;
        }
        .ant-slider-rail {
          background-color: ${colors.gray[800]} !important;
        }
      `}</style>
    </Drawer>
  );
};

const labelStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: colors.dark.text.primary,
  marginBottom: spacing[3],
  display: 'block'
};

const markStyle: React.CSSProperties = {
  color: colors.dark.text.secondary,
  fontSize: 12,
  marginTop: 8
};

export default CreatorFilters;



