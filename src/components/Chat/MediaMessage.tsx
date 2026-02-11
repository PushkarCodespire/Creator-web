// ===========================================
// MEDIA MESSAGE COMPONENT
// ===========================================

import { useState } from 'react';
import { Modal, Image, message } from 'antd';
import { PlayCircleOutlined, SoundOutlined, FileOutlined, DownloadOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { MediaFile } from '../../types';
import { colors, spacing, typography } from '../../styles/tokens';
import { downloadFromUrl } from '../../utils/fileDownloadUtils';

interface MediaMessageProps {
  media: MediaFile[];
}

export const MediaMessage: React.FC<MediaMessageProps> = ({ media }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = media.filter(m => m.type === 'image');
  const videos = media.filter(m => m.type === 'video');
  const audios = media.filter(m => m.type === 'audio');
  const files = media.filter(m => m.type === 'file');

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  // Determine grid layout based on number of images
  const getGridStyle = (count: number) => {
    if (count === 1) {
      return { display: 'block' };
    } else if (count === 2) {
      return { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[2] };
    } else if (count === 3) {
      return { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[2] };
    } else {
      return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: spacing[2] };
    }
  };

  return (
    <div style={{ marginTop: spacing[2] }}>
      {/* Images */}
      {images.length > 0 && (
        <div style={getGridStyle(images.length)}>
          {images.map((img, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleImageClick(index)}
              style={{
                cursor: 'pointer',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                maxWidth: images.length === 1 ? '400px' : '100%',
                maxHeight: images.length === 1 ? '400px' : '200px',
              }}
            >
              <img
                src={img.url}
                alt={img.name || 'Image'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <motion.div
                whileHover={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: spacing[2],
                  right: spacing[2],
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  downloadFromUrl(img.url, img.name || `image-${index}`);
                }}
              >
                <DownloadOutlined style={{ fontSize: '16px' }} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox for images */}
      {lightboxOpen && (
        <Image.PreviewGroup
          preview={{
            visible: lightboxOpen,
            current: currentImageIndex,
            onVisibleChange: (visible) => setLightboxOpen(visible),
          }}
        >
          {images.map((img, index) => (
            <Image key={index} src={img.url} style={{ display: 'none' }} />
          ))}
        </Image.PreviewGroup>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <div style={{ marginTop: images.length > 0 ? spacing[2] : 0 }}>
          {videos.map((video, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.01 }}
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: videos.length > 1 && index < videos.length - 1 ? spacing[2] : 0,
                maxWidth: '400px',
              }}
            >
              <video
                src={video.url}
                controls
                style={{
                  width: '100%',
                  display: 'block',
                  maxHeight: '300px',
                }}
              >
                Your browser does not support the video tag.
              </video>
              {video.name && (
                <div
                  style={{
                    padding: spacing[2],
                    background: colors.gray[100],
                    fontSize: typography.fontSize.sm,
                    color: colors.gray[700],
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], flex: 1 }}>
                    <PlayCircleOutlined />
                    {video.name}
                  </div>
                  <DownloadOutlined
                    style={{ cursor: 'pointer', color: colors.primary.solid }}
                    onClick={() => downloadFromUrl(video.url, video.name || `video-${index}`)}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Audio files */}
      {audios.length > 0 && (
        <div style={{ marginTop: images.length > 0 || videos.length > 0 ? spacing[2] : 0 }}>
          {audios.map((audio, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.01 }}
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: audios.length > 1 && index < audios.length - 1 ? spacing[2] : 0,
                background: colors.gray[100],
                padding: spacing[3],
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  marginBottom: spacing[2],
                  fontSize: typography.fontSize.sm,
                  color: colors.gray[700],
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], flex: 1 }}>
                  <SoundOutlined style={{ fontSize: typography.fontSize.lg }} />
                  {audio.name || 'Audio message'}
                </div>
                <DownloadOutlined
                  style={{ cursor: 'pointer', color: colors.primary.solid }}
                  onClick={() => downloadFromUrl(audio.url, audio.name || `audio-${index}`)}
                />
              </div>
              <audio src={audio.url} controls style={{ width: '100%' }}>
                Your browser does not support the audio element.
              </audio>
            </motion.div>
          ))}
        </div>
      )}

      {/* Other files */}
      {files.length > 0 && (
        <div style={{ marginTop: images.length > 0 || videos.length > 0 || audios.length > 0 ? spacing[2] : 0 }}>
          {files.map((file, index) => {
            const handleDownload = async (e: React.MouseEvent) => {
              e.preventDefault();
              try {
                await downloadFromUrl(file.url, file.name);
                message.success('Download started');
              } catch (error) {
                console.error('Download failed:', error);
                message.error('Failed to download file');
              }
            };

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                onClick={handleDownload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: spacing[3],
                  background: colors.gray[100],
                  borderRadius: '12px',
                  marginBottom: files.length > 1 && index < files.length - 1 ? spacing[2] : 0,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.gray[200];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.gray[100];
                }}
              >
                <FileOutlined style={{ fontSize: typography.fontSize.lg, color: colors.primary.solid }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: typography.fontWeight.medium, color: colors.gray[800] }}>{file.name || 'File'}</div>
                  {file.size && (
                    <div style={{ fontSize: typography.fontSize.xs, color: colors.gray[500] }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  )}
                </div>
                <DownloadOutlined style={{ fontSize: typography.fontSize.lg, color: colors.primary.solid }} />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaMessage;
