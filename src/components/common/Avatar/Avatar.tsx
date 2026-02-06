// ===========================================
// CUSTOM AVATAR COMPONENT
// Avatar with status indicators and gradient rings
// ===========================================

import React from 'react';
import { Avatar as AntAvatar, AvatarProps, Badge } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { colors } from '../../../styles/tokens';

export interface CustomAvatarProps extends AvatarProps {
  status?: 'online' | 'offline' | 'busy' | 'away';
  verified?: boolean;
  gradientRing?: boolean;
  showStatus?: boolean;
  children?: React.ReactNode;
}

const CustomAvatar: React.FC<CustomAvatarProps> = ({
  status,
  verified = false,
  gradientRing = false,
  showStatus = false,
  size = 40,
  style,
  src,
  children,
  ...props
}) => {
  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return '#52c41a'; // Green
      case 'offline':
        return colors.gray[400];
      case 'busy':
        return colors.error.solid;
      case 'away':
        return colors.warning.solid;
      default:
        return colors.gray[400];
    }
  };

  // Calculate sizes for gradient ring
  const avatarSize = typeof size === 'number' ? size : 40;
  const ringPadding = 3;
  const ringSize = avatarSize + (ringPadding * 2);

  // Avatar with gradient ring (for stories)
  if (gradientRing) {
    return (
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
        }}
      >
        {/* Gradient Ring */}
        <div
          style={{
            width: ringSize,
            height: ringSize,
            borderRadius: '50%',
            background: colors.primary.gradient,
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* White Border */}
          <div
            style={{
              width: avatarSize + 2,
              height: avatarSize + 2,
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Avatar */}
            <AntAvatar
              {...props}
              src={src}
              size={avatarSize}
              style={{
                ...style,
              }}
            >
              {children}
            </AntAvatar>
          </div>
        </div>

        {/* Verified Badge */}
        {verified && (
          <CheckCircleFilled
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              color: colors.primary.solid,
              background: '#ffffff',
              borderRadius: '50%',
              fontSize: avatarSize * 0.3,
            }}
          />
        )}
      </div>
    );
  }

  // Regular avatar with status indicator
  const avatar = (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <AntAvatar
        {...props}
        src={src}
        size={size}
        style={style}
      >
        {children}
      </AntAvatar>

      {/* Status Indicator */}
      {showStatus && status && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: avatarSize * 0.25,
            height: avatarSize * 0.25,
            borderRadius: '50%',
            background: getStatusColor(),
            border: '2px solid #ffffff',
          }}
        />
      )}

      {/* Verified Badge */}
      {verified && !showStatus && (
        <CheckCircleFilled
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            color: colors.primary.solid,
            background: '#ffffff',
            borderRadius: '50%',
            fontSize: avatarSize * 0.3,
          }}
        />
      )}
    </div>
  );

  return avatar;
};

export default CustomAvatar;
