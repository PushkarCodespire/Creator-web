// ===========================================
// MEDIA UPLOAD BUTTON COMPONENT
// ===========================================

import { useState, useRef } from 'react';
import { message as antMessage, Tooltip, Modal } from 'antd';
import { PictureOutlined, VideoCameraOutlined, AudioOutlined, CloseOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { chatApi } from '../../services/api';
import CustomButton from '../common/Button/CustomButton';
import { colors, spacing, typography } from '../../styles/tokens';
import { logger } from '../../utils/logger';
import { MediaFile } from '../../types';

interface MediaUploadButtonProps {
  onMediaUploaded: (media: MediaFile[]) => void;
  disabled?: boolean;
}

export const MediaUploadButton: React.FC<MediaUploadButtonProps> = ({ onMediaUploaded, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles: File[] = [];
    const maxSize = 25 * 1024 * 1024; // 25MB

    for (const file of files) {
      // Check file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/mpeg',
        'video/webm',
        'video/quicktime',
        'audio/mpeg',
        'audio/wav',
        'audio/webm',
        'audio/ogg',
      ];

      if (!allowedTypes.includes(file.type)) {
        antMessage.error(`${file.name} is not a supported file type`);
        continue;
      }

      // Check file size
      if (file.size > maxSize) {
        antMessage.error(`${file.name} exceeds the maximum size of 25MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      const total = selectedFiles.length + validFiles.length;
      if (total > 5) {
        antMessage.warning('You can only upload up to 5 files at once');
        setSelectedFiles([...selectedFiles, ...validFiles].slice(0, 5));
      } else {
        setSelectedFiles([...selectedFiles, ...validFiles]);
      }
      setPreviewVisible(true);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    if (selectedFiles.length === 1) {
      setPreviewVisible(false);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      const response = await chatApi.uploadChatMedia(selectedFiles);
      const uploadedMedia = response.data.data.media;

      onMediaUploaded(uploadedMedia);
      setSelectedFiles([]);
      setPreviewVisible(false);
      antMessage.success(`${selectedFiles.length} file(s) uploaded successfully`);
    } catch (error: unknown) {
      logger.error('Failed to upload media:', error);
      const err = error as { response?: { data?: { error?: string } } };
      antMessage.error(err.response?.data?.error || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (uploading) return;
    setSelectedFiles([]);
    setPreviewVisible(false);
  };

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <Tooltip title="Upload media (images, videos, audio)">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <CustomButton
            variant="ghost"
            icon={<PictureOutlined style={{ fontSize: '20px' }} />}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            style={{ padding: '8px' }}
          />
        </motion.div>
      </Tooltip>

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        title={`Selected Files (${selectedFiles.length}/5)`}
        onCancel={handleCancel}
        footer={[
          <CustomButton key="cancel" onClick={handleCancel} disabled={uploading}>
            Cancel
          </CustomButton>,
          <CustomButton
            key="upload"
            variant="primary"
            gradient
            onClick={handleUpload}
            loading={uploading}
            disabled={selectedFiles.length === 0}
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
          </CustomButton>,
        ]}
        width={600}
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {selectedFiles.map((file, index) => {
            const preview = getFilePreview(file);
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            const isAudio = file.type.startsWith('audio/');

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3],
                  padding: spacing[3],
                  border: `1px solid ${colors.gray[200]}`,
                  borderRadius: '12px',
                  marginBottom: spacing[2],
                  background: 'white',
                }}
              >
                {/* Preview */}
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    background: colors.gray[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {isImage && preview ? (
                    <img src={preview} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : isVideo ? (
                    <VideoCameraOutlined style={{ fontSize: '24px', color: colors.primary.solid }} />
                  ) : isAudio ? (
                    <AudioOutlined style={{ fontSize: '24px', color: colors.primary.solid }} />
                  ) : (
                    <PictureOutlined style={{ fontSize: '24px', color: colors.gray[400] }} />
                  )}
                </div>

                {/* File Info */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.gray[900],
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {file.name}
                  </div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.gray[500], marginTop: spacing[1] }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>

                {/* Remove Button */}
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <CloseOutlined
                    onClick={() => handleRemoveFile(index)}
                    style={{
                      fontSize: typography.fontSize.lg,
                      color: colors.error.solid,
                      cursor: 'pointer',
                      padding: spacing[2],
                    }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default MediaUploadButton;
