// ===========================================
// AVATAR UPLOAD - Circular Profile Picture
// ===========================================

import React, { useState, useEffect } from 'react';
import { Avatar, Spin, message } from 'antd';
import { UserOutlined, CameraOutlined } from '@ant-design/icons';
import { ImageUpload } from './ImageUpload';
import api, { getImageUrl } from '../../services/api';
import { colors } from '../../styles/tokens';

export interface AvatarUploadProps {
  currentAvatar?: string;
  userId?: string;
  onUploadSuccess?: (url: string) => void;
  size?: number;
  disabled?: boolean;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  userId,
  onUploadSuccess,
  size = 120,
  disabled = false
}) => {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar);
  const [loading, setLoading] = useState(false);

  // Sync local state with props when currentAvatar changes
  useEffect(() => {
    if (!currentAvatar) {
      setAvatarUrl(currentAvatar);
      return;
    }
    setAvatarUrl(getImageUrl(currentAvatar));
  }, [currentAvatar]);

  // Upload avatar to backend
  const handleUpload = async (croppedImage: Blob, fileName: string): Promise<{ url: string }> => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', croppedImage, fileName);
      if (userId) {
        formData.append('userId', userId);
      }

      const response = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const url = response.data.data.url;
      setAvatarUrl(getImageUrl(url));

      if (onUploadSuccess) {
        onUploadSuccess(url);
      }

      return { url };
    } catch (error: unknown) {
      message.error('Failed to upload avatar');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="avatar-upload-container" style={{ textAlign: 'center' }}>
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          cursor: disabled ? 'default' : 'pointer'
        }}
      >
        <Spin spinning={loading}>
          <Avatar
            size={size}
            src={avatarUrl}
            icon={!avatarUrl && <UserOutlined />}
            style={{
              backgroundColor: !avatarUrl ? colors.primary.solid : colors.gray[100],
              border: `2px solid ${colors.gray[100]}`
            }}
          />
        </Spin>

        {!disabled && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: colors.primary.solid,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid #ffffff`,
              boxShadow: '0 4px 12px rgba(18, 104, 255, 0.2)'
            }}
          >
            <ImageUpload
              aspectRatio={1}
              maxSize={5}
              minWidth={200}
              minHeight={200}
              onUpload={handleUpload}
              disabled={disabled || loading}
              buttonText=""
              cropShape="round"
            >
              <div
                style={{
                  position: 'absolute',
                  top: -18,
                  left: -18,
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <CameraOutlined style={{ fontSize: '16px', color: 'white' }} />
              </div>
            </ImageUpload>
          </div>
        )}
      </div>

      <div style={{ marginTop: '12px', fontSize: '13px', color: colors.text.tertiary, fontWeight: 500 }}>
        {disabled ? 'Avatar' : 'Click camera icon to change'}
      </div>
    </div>
  );
};

export default AvatarUpload;
