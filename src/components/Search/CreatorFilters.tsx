// ===========================================
// CREATOR FILTERS COMPONENT
// Advanced filtering for creator gallery - Light Theme
// ===========================================

import { useState } from 'react';
import { Drawer, Select, Slider, Switch, Button, Space } from 'antd';
import { Filter, X } from 'lucide-react';
import { colors, spacing, shadows, borderRadius } from '../../styles/tokens';

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
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], color: colors.text.primary }}>
            <Filter size={20} style={{ color: colors.primary.solid }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: colors.text.primary }}>Filter Matrix</span>
          </div>
          {hasActiveFilters && (
            <Button
              type="text"
              size="small"
              onClick={handleReset}
              style={{ color: colors.primary.solid, fontSize: 13, fontWeight: 600 }}
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
          background: '#FFFFFF',
          borderBottom: `1px solid ${colors.gray[100]}`,
          padding: '24px',
        },
        body: {
          background: colors.gray[50], // Very light background
          padding: '32px 24px',
          color: colors.text.primary,
        },
        mask: {
          backdropFilter: 'blur(8px)',
          background: 'rgba(16, 24, 40, 0.4)',
        }
      }}
      closeIcon={<X size={20} style={{ color: colors.text.secondary }} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        <Space direction="vertical" size={32} style={{ width: '100%', marginBottom: 100 }}>
          {/* Category Filter */}
          <div className="filter-section">
            <h4 style={labelStyle}>Identity Domain</h4>
            <Select
              style={{ width: '100%' }}
              placeholder="All Domains"
              value={selectedCategory}
              onChange={onCategoryChange}
              allowClear
              className="premium-filter-select"
              dropdownStyle={{ borderRadius: borderRadius.md, padding: '8px', boxShadow: shadows.lg }}
            >
              {categories.map((cat) => (
                <Option key={cat.name} value={cat.name}>
                  {cat.name} <span style={{ color: colors.text.tertiary, fontSize: 12, fontWeight: 400 }}>({cat.count})</span>
                </Option>
              ))}
            </Select>
          </div>

          {/* Price Filter */}
          <div className="filter-section">
            <h4 style={labelStyle}>Monetization Model</h4>
            <Select
              style={{ width: '100%' }}
              value={priceFilter}
              onChange={onPriceFilterChange}
              className="premium-filter-select"
            >
              <Option value="all">Unfiltered Access</Option>
              <Option value="free">Genesis Only (Free)</Option>
              <Option value="premium">Protocol Only (Paid)</Option>
            </Select>
          </div>

          {/* Rating Filter */}
          <div className="filter-section">
            <h4 style={labelStyle}>
              Neural Credibility: <span style={{ color: colors.primary.solid }}>{localRating > 0 ? `${localRating}+` : 'Any'}</span>
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
                track: { background: colors.primary.gradient },
                handle: { background: colors.primary.solid, border: '3px solid #ffffff', boxShadow: shadows.sm }
              }}
            />
          </div>

          {/* Verified Filter */}
          <div className="filter-section">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#FFFFFF',
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${colors.gray[200]}`,
              boxShadow: shadows.sm
            }}>
              <div>
                <h4 style={{ ...labelStyle, marginBottom: 2 }}>Protocol Verified</h4>
                <p style={{
                  fontSize: 12,
                  color: colors.text.tertiary,
                  margin: 0,
                  fontWeight: 500
                }}>
                  Verified persona matrix
                </p>
              </div>
              <Switch
                checked={verifiedOnly}
                onChange={onVerifiedChange}
                style={{ background: verifiedOnly ? colors.primary.solid : colors.gray[200] }}
              />
            </div>
          </div>
        </Space>

        {/* Action Buttons - Fixed at bottom */}
        <div style={{
          position: 'absolute',
          bottom: -32,
          left: -24,
          right: -24,
          padding: '24px',
          background: '#FFFFFF',
          borderTop: `1px solid ${colors.gray[100]}`,
          display: 'flex',
          gap: spacing[3],
          zIndex: 10,
          boxShadow: '0 -4px 12px rgba(0,0,0,0.02)'
        }}>
          <Button
            block
            size="large"
            onClick={onClose}
            style={{
              background: '#ffffff',
              color: colors.text.primary,
              border: `1px solid ${colors.gray[200]}`,
              borderRadius: 8,
              height: 44,
              fontWeight: 500
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
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              height: 44,
              fontWeight: 500,
              boxShadow: shadows.md
            }}
          >
            Update Matrix
          </Button>
        </div>
      </div>

      <style>{`
        .premium-filter-select .ant-select-selector {
          background: #FFFFFF !important;
          border: 1px solid ${colors.gray[200]} !important;
          color: ${colors.text.primary} !important;
          height: 48px !important;
          padding: 8px 16px !important;
          border-radius: 12px !important;
          transition: all 0.3s ease !important;
          box-shadow: ${shadows.sm} !important;
        }
        .premium-filter-select .ant-select-selector:hover {
          border-color: ${colors.primary.solid} !important;
          box-shadow: ${shadows.md} !important;
        }
        .premium-filter-select .ant-select-arrow {
          color: ${colors.text.tertiary};
        }
        .ant-select-dropdown {
          padding: 8px !important;
          border-radius: 12px !important;
          border: 1px solid ${colors.gray[100]} !important;
          box-shadow: ${shadows.lg} !important;
        }
        .ant-select-item {
          border-radius: 8px !important;
          margin-bottom: 2px !important;
          padding: 8px 12px !important;
          color: ${colors.text.secondary} !important;
          font-weight: 500 !important;
        }
        .ant-select-item-option-selected {
          background-color: ${colors.primary.subtle} !important;
          color: ${colors.primary.solid} !important;
        }
        .ant-select-item-option-active {
          background-color: ${colors.gray[50]} !important;
        }
        .ant-slider-rail {
          background-color: ${colors.gray[200]} !important;
          height: 6px !important;
        }
        .ant-slider-track {
          height: 6px !important;
        }
        .ant-slider-handle::after {
          width: 12px !important;
          height: 12px !important;
          inset-block-start: 1px !important;
          inset-inline-start: 1px !important;
        }
      `}</style>
    </Drawer>
  );
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: colors.text.secondary,
  marginBottom: spacing[3],
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  display: 'block'
};

const markStyle: React.CSSProperties = {
  color: colors.text.tertiary,
  fontSize: 11,
  fontWeight: 600,
  marginTop: 8
};

export default CreatorFilters;



