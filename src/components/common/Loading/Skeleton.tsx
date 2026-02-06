// ===========================================
// LOADING SKELETON COMPONENT
// Content placeholder with shimmer animation
// ===========================================

import React from 'react';
import { Skeleton as AntSkeleton, Space } from 'antd';
import { colors, borderRadius } from '../../../styles/tokens';

export interface SkeletonProps {
  type?: 'text' | 'avatar' | 'card' | 'post' | 'list' | 'chat';
  count?: number;
  animate?: 'pulse' | 'wave';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  type = 'text',
  count = 1,
  animate = 'wave',
  width,
  height,
}) => {
  // Shimmer animation
  const shimmerStyle: React.CSSProperties = {
    background: `linear-gradient(
      90deg,
      ${colors.gray[200]} 0%,
      ${colors.gray[100]} 50%,
      ${colors.gray[200]} 100%
    )`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s infinite',
    borderRadius: borderRadius.md,
  };

  // Text skeleton
  if (type === 'text') {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            style={{
              ...shimmerStyle,
              width: width || `${100 - (index * 10)}%`,
              height: height || '16px',
            }}
          />
        ))}
      </Space>
    );
  }

  // Avatar skeleton
  if (type === 'avatar') {
    return (
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div
          style={{
            ...shimmerStyle,
            width: width || '48px',
            height: height || '48px',
            borderRadius: '50%',
          }}
        />
        <Space direction="vertical" style={{ flex: 1 }}>
          <div
            style={{
              ...shimmerStyle,
              width: '40%',
              height: '16px',
            }}
          />
          <div
            style={{
              ...shimmerStyle,
              width: '60%',
              height: '12px',
            }}
          />
        </Space>
      </div>
    );
  }

  // Card skeleton
  if (type === 'card') {
    return (
      <div
        style={{
          padding: '20px',
          background: '#fff',
          borderRadius: borderRadius.lg,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            ...shimmerStyle,
            width: '100%',
            height: '200px',
            marginBottom: '16px',
          }}
        />
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ ...shimmerStyle, width: '60%', height: '20px' }} />
          <div style={{ ...shimmerStyle, width: '100%', height: '16px' }} />
          <div style={{ ...shimmerStyle, width: '80%', height: '16px' }} />
        </Space>
      </div>
    );
  }

  // Post skeleton (social media post)
  if (type === 'post') {
    return (
      <div
        style={{
          padding: '20px',
          background: '#fff',
          borderRadius: borderRadius.lg,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          marginBottom: '16px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              ...shimmerStyle,
              width: '48px',
              height: '48px',
              borderRadius: '50%',
            }}
          />
          <Space direction="vertical" style={{ flex: 1 }}>
            <div style={{ ...shimmerStyle, width: '40%', height: '16px' }} />
            <div style={{ ...shimmerStyle, width: '30%', height: '12px' }} />
          </Space>
        </div>

        {/* Content */}
        <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
          <div style={{ ...shimmerStyle, width: '100%', height: '16px' }} />
          <div style={{ ...shimmerStyle, width: '90%', height: '16px' }} />
          <div style={{ ...shimmerStyle, width: '70%', height: '16px' }} />
        </Space>

        {/* Image */}
        <div
          style={{
            ...shimmerStyle,
            width: '100%',
            height: '300px',
            marginBottom: '16px',
          }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ ...shimmerStyle, width: '60px', height: '32px' }} />
          <div style={{ ...shimmerStyle, width: '60px', height: '32px' }} />
          <div style={{ ...shimmerStyle, width: '60px', height: '32px' }} />
        </div>
      </div>
    );
  }

  // List skeleton
  if (type === 'list') {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '16px',
              background: '#fff',
              borderRadius: borderRadius.md,
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                ...shimmerStyle,
                width: '48px',
                height: '48px',
                borderRadius: '50%',
              }}
            />
            <Space direction="vertical" style={{ flex: 1 }}>
              <div style={{ ...shimmerStyle, width: '60%', height: '16px' }} />
              <div style={{ ...shimmerStyle, width: '80%', height: '12px' }} />
            </Space>
          </div>
        ))}
      </Space>
    );
  }

  // Chat message skeleton
  if (type === 'chat') {
    return (
      <div style={{ width: '100%' }}>
        {Array.from({ length: count }).map((_, index) => {
          const isUser = index % 2 === 0;
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                marginBottom: '16px',
                alignItems: 'flex-end',
                gap: '8px',
              }}
            >
              {!isUser && (
                <div
                  style={{
                    ...shimmerStyle,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    flexShrink: 0,
                  }}
                />
              )}
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: isUser ? colors.primary.solid : '#fff',
                  ...shimmerStyle,
                }}
              >
                <div style={{ ...shimmerStyle, width: '150px', height: '16px', marginBottom: '4px' }} />
                <div style={{ ...shimmerStyle, width: '100px', height: '16px' }} />
              </div>
              {isUser && (
                <div
                  style={{
                    ...shimmerStyle,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback to Ant Design skeleton
  return <AntSkeleton active />;
};

export { Skeleton };
export default Skeleton;
