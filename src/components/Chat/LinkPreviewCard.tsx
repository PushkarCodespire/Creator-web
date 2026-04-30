// ===========================================
// LINK PREVIEW CARD COMPONENT
// ===========================================

import { useState, useEffect } from 'react';
import { Skeleton } from 'antd';
import { LinkOutlined, GlobalOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { linkPreviewApi } from '../../services/api';
import { LinkPreview } from '../../types';
import { logger } from '../../utils/logger';
import { colors, spacing, typography } from '../../styles/tokens';

interface LinkPreviewCardProps {
  url: string;
}

export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({ url }) => {
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(false);

  useEffect(() => {
    fetchPreview();
  }, [url]);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await linkPreviewApi.getPreview(url);
      setPreview(response.data.data);
    } catch (error) {
      logger.error('Failed to fetch link preview:', error);
      setError(true);
      // Set minimal preview on error
      setPreview({
        url,
        title: url,
        description: '',
        image: null,
        siteName: new URL(url).hostname,
        type: 'website',
        favicon: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div
        style={{
          border: `1px solid ${colors.gray[200]}`,
          borderRadius: '12px',
          overflow: 'hidden',
          marginTop: spacing[2],
          maxWidth: '400px',
        }}
      >
        <Skeleton.Image active style={{ width: '100%', height: '200px' }} />
        <div style={{ padding: spacing[3] }}>
          <Skeleton active paragraph={{ rows: 2 }} />
        </div>
      </div>
    );
  }

  if (!preview) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={handleClick}
      style={{
        border: `1px solid ${colors.gray[200]}`,
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        marginTop: spacing[2],
        maxWidth: '400px',
        background: 'white',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.primary.solid;
        e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary.light}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.gray[200];
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Image */}
      {preview.image && (
        <div
          style={{
            width: '100%',
            height: '200px',
            background: colors.gray[100],
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <img
            src={preview.image}
            alt={preview.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: spacing[3] }}>
        {/* Site Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            marginBottom: spacing[2],
          }}
        >
          {preview.favicon ? (
            <img
              src={preview.favicon}
              alt=""
              style={{ width: '16px', height: '16px' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <GlobalOutlined style={{ fontSize: '14px', color: colors.gray[500] }} />
          )}
          <span
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.gray[600],
              textTransform: 'uppercase',
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            {preview.siteName}
          </span>
        </div>

        {/* Title */}
        <h4
          style={{
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            color: colors.gray[900],
            marginBottom: spacing[2],
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {preview.title}
        </h4>

        {/* Description */}
        {preview.description && (
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.gray[600],
              marginBottom: spacing[2],
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {preview.description}
          </p>
        )}

        {/* URL */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
            fontSize: typography.fontSize.xs,
            color: colors.primary.solid,
          }}
        >
          <LinkOutlined />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {new URL(url).hostname}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default LinkPreviewCard;
