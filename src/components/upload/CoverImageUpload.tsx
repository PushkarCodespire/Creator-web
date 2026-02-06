// ===========================================
// COVER IMAGE UPLOAD - Wide Banner
// ===========================================

import React, { useState, useEffect } from 'react';
import { Card, Spin, Button, message } from 'antd';
import { PictureOutlined, CameraOutlined } from '@ant-design/icons';
import { ImageUpload } from './ImageUpload';
import api, { getImageUrl } from '../../services/api';

export interface CoverImageUploadProps {
  currentCover?: string;
  userId?: string;
  onUploadSuccess?: (url: string) => void;
  height?: number;
  disabled?: boolean;
}

export const CoverImageUpload: React.FC<CoverImageUploadProps> = ({
  currentCover,
  userId,
  onUploadSuccess,
  height = 200,
  disabled = false
}) => {
  const [coverUrl, setCoverUrl] = useState(currentCover);
  const [loading, setLoading] = useState(false);

  // Sync local state with props when currentCover changes
  useEffect(() => {
    setCoverUrl(currentCover);
  }, [currentCover]);

  // Upload cover image to backend
  const handleUpload = async (croppedImage: Blob, fileName: string): Promise<{ url: string }> => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('cover', croppedImage, fileName);
      if (userId) {
        formData.append('userId', userId);
      }

      const response = await api.post('/upload/cover', formData);

      const url = response.data.data.url;
      setCoverUrl(url);

      if (onUploadSuccess) {
        onUploadSuccess(url);
      }

      return { url };
    } catch (error: any) {
      message.error('Failed to upload cover image');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cover-image-upload">
      <Spin spinning={loading}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: `${height}px`,
            backgroundColor: coverUrl ? 'transparent' : '#1e293b',
            backgroundImage: coverUrl ? `url(${getImageUrl(coverUrl)})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)'
          }}
        >
          {!coverUrl && (
            <div style={{ textAlign: 'center', color: '#64748b' }}>
              <PictureOutlined style={{ fontSize: '48px', marginBottom: '8px', opacity: 0.5 }} />
              <div style={{ fontWeight: 600 }}>Neural Network Cover Missing</div>
            </div>
          )}

          {!disabled && (
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px'
              }}
            >
              <ImageUpload
                aspectRatio={16 / 4} // Wide banner ratio
                maxSize={10}
                minWidth={800}
                minHeight={200}
                onUpload={handleUpload}
                disabled={disabled || loading}
                buttonText=""
                cropShape="rect"
              >
                <Button
                  type="primary"
                  icon={<CameraOutlined />}
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  {coverUrl ? 'Change Cover' : 'Upload Cover'}
                </Button>
              </ImageUpload>
            </div>
          )}
        </div>
      </Spin>
    </div>
  );
};

export default CoverImageUpload;
