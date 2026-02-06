// ===========================================
// POST CREATOR COMPONENT
// Rich text editor for creating posts with media
// ===========================================

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PictureOutlined,
  VideoCameraOutlined,
  CloseCircleFilled,
  LoadingOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { Input, message, Upload } from 'antd';
import type { UploadFile } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { postApi } from '../../services/api';
import CustomCard from '../common/Card/CustomCard';
import CustomButton from '../common/Button/CustomButton';
import CustomAvatar from '../common/Avatar/Avatar';
import { fadeIn, slideUp } from '../../styles/animations';
import { colors, typography, spacing, shadows } from '../../styles/tokens';

const { TextArea } = Input;

export interface PostCreatorProps {
  onPostCreated?: (post: any) => void;
  onCancel?: () => void;
  placeholder?: string;
  maxLength?: number;
  allowMedia?: boolean;
}

const PostCreator: React.FC<PostCreatorProps> = ({
  onPostCreated,
  onCancel,
  placeholder = "What's on your mind?",
  maxLength = 5000,
  allowMedia = true,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<UploadFile[]>([]);
  const [mediaUrls, setMediaUrls] = useState<Array<{ type: 'image' | 'video'; url: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const textAreaRef = useRef<any>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleMediaUpload = async (file: File) => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      message.error('Please upload only images or videos');
      return false;
    }

    // Validate file size (10MB for images, 50MB for videos)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error(`File size must be less than ${isVideo ? '50MB' : '10MB'}`);
      return false;
    }

    setIsUploading(true);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload file to server
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const uploadedUrl = data.data.url;

      // Add to media URLs
      setMediaUrls((prev) => [
        ...prev,
        {
          type: isVideo ? 'video' : 'image',
          url: uploadedUrl,
        },
      ]);

      message.success('Media uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload media');
    } finally {
      setIsUploading(false);
    }

    return false; // Prevent default upload behavior
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validate content
    if (!content.trim() && mediaUrls.length === 0) {
      message.warning('Please write something or add media');
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine post type
      let postType = 'TEXT';
      if (mediaUrls.length > 0) {
        postType = mediaUrls[0].type === 'video' ? 'VIDEO' : 'IMAGE';
        if (mediaUrls.length > 1) {
          postType = 'CAROUSEL';
        }
      }

      // Create post
      const response = await postApi.createPost({
        content: content.trim(),
        media: mediaUrls.length > 0 ? mediaUrls : undefined,
        type: postType,
      });

      message.success('Post created successfully!');

      // Reset form
      setContent('');
      setMediaFiles([]);
      setMediaUrls([]);

      // Notify parent
      if (onPostCreated) {
        onPostCreated(response.data.data);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create post';
      message.error(errorMessage);
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setContent('');
    setMediaFiles([]);
    setMediaUrls([]);
    if (onCancel) {
      onCancel();
    }
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > maxLength;

  return (
    <motion.div variants={fadeIn} initial="initial" animate="enter">
      <CustomCard depth={1} gradient={false}>
        {/* Header with avatar */}
        <div style={{ display: 'flex', gap: spacing[3], marginBottom: spacing[3] }}>
          <CustomAvatar
            src={user?.avatar}
            alt={user?.name}
            size={48}
            status="online"
          />
          <div style={{ flex: 1 }}>
            <TextArea
              ref={textAreaRef}
              value={content}
              onChange={handleContentChange}
              placeholder={placeholder}
              autoSize={{ minRows: 3, maxRows: 10 }}
              maxLength={maxLength}
              style={{
                fontSize: typography.fontSize.base,
                border: 'none',
                boxShadow: 'none',
                resize: 'none',
                padding: spacing[2],
              }}
            />

            {/* Character count */}
            <div
              style={{
                textAlign: 'right',
                fontSize: typography.fontSize.xs,
                color: isOverLimit ? colors.error.solid : colors.gray[500],
                marginTop: spacing[1],
              }}
            >
              {characterCount} / {maxLength}
            </div>
          </div>
        </div>

        {/* Media Preview */}
        <AnimatePresence>
          {mediaUrls.length > 0 && (
            <motion.div
              variants={slideUp}
              initial="initial"
              animate="enter"
              exit="exit"
              style={{
                display: 'grid',
                gridTemplateColumns: mediaUrls.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                gap: spacing[2],
                marginBottom: spacing[3],
              }}
            >
              {mediaUrls.map((media, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: shadows.md,
                  }}
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={`Upload ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <video
                      src={media.url}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  )}
                  <CloseCircleFilled
                    onClick={() => handleRemoveMedia(index)}
                    style={{
                      position: 'absolute',
                      top: spacing[2],
                      right: spacing[2],
                      fontSize: '24px',
                      color: 'white',
                      cursor: 'pointer',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    }}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: spacing[3],
            borderTop: `1px solid ${colors.gray[200]}`,
          }}
        >
          {/* Media upload buttons */}
          <div style={{ display: 'flex', gap: spacing[2] }}>
            {allowMedia && (
              <>
                <Upload
                  accept="image/*"
                  beforeUpload={handleMediaUpload}
                  showUploadList={false}
                  disabled={isUploading || isSubmitting}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[2],
                        padding: `${spacing[2]} ${spacing[3]}`,
                        cursor: 'pointer',
                        borderRadius: '8px',
                        color: colors.success.solid,
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = colors.success.light)
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <PictureOutlined style={{ fontSize: '20px' }} />
                      <span style={{ fontSize: typography.fontSize.sm, fontWeight: 600 }}>
                        Photo
                      </span>
                    </div>
                  </motion.div>
                </Upload>

                <Upload
                  accept="video/*"
                  beforeUpload={handleMediaUpload}
                  showUploadList={false}
                  disabled={isUploading || isSubmitting}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[2],
                        padding: `${spacing[2]} ${spacing[3]}`,
                        cursor: 'pointer',
                        borderRadius: '8px',
                        color: colors.error.solid,
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = colors.error.light)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <VideoCameraOutlined style={{ fontSize: '20px' }} />
                      <span style={{ fontSize: typography.fontSize.sm, fontWeight: 600 }}>
                        Video
                      </span>
                    </div>
                  </motion.div>
                </Upload>
              </>
            )}

            {isUploading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                <LoadingOutlined spin />
                <span style={{ fontSize: typography.fontSize.sm, color: colors.gray[500] }}>
                  Uploading...
                </span>
              </div>
            )}
          </div>

          {/* Submit and cancel buttons */}
          <div style={{ display: 'flex', gap: spacing[2] }}>
            <CustomButton variant="ghost" onClick={handleClear} disabled={isSubmitting}>
              Cancel
            </CustomButton>
            <CustomButton
              variant="primary"
              gradient
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={isOverLimit || isUploading || (!content.trim() && mediaUrls.length === 0)}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </CustomButton>
          </div>
        </div>
      </CustomCard>
    </motion.div>
  );
};

export default PostCreator;
