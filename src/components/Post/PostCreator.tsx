// ===========================================
// POST CREATOR COMPONENT - Premium Light Theme
// ===========================================

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Image as ImageIcon, Film, Zap } from 'lucide-react';
import { Input, message, Upload, Avatar, Button, Space, Typography, Tag, Divider } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { postApi, getImageUrl } from '../../services/api';
import { colors, shadows } from '../../styles/tokens';
import { logger } from '../../utils/logger';

const { TextArea } = Input;
const { Text } = Typography;

export interface PostCreatorProps {
  onPostCreated?: (post: Record<string, unknown>) => void;
  onCancel?: () => void;
  placeholder?: string;
  maxLength?: number;
  allowMedia?: boolean;
}

const PostCreator: React.FC<PostCreatorProps> = ({
  onPostCreated,
  onCancel,
  placeholder = "Commence neural transmission...",
  maxLength = 5000,
  allowMedia = true,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<Array<{ type: 'image' | 'video'; url: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textAreaRef = useRef<any>(null);

  const handleMediaUpload = async (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      message.error('Neural mismatch: Only images or videos supported');
      return false;
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error(`Neural overflow: File size limit ${isVideo ? '50MB' : '10MB'}`);
      return false;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      const uploadedUrl = data.data.url;

      setMediaUrls((prev) => [
        ...prev,
        { type: isVideo ? 'video' : 'image', url: uploadedUrl },
      ]);
      message.success('Vector uploaded to matrix');
    } catch (error) {
      logger.error('Upload error:', error);
      message.error('Matrix connection unstable: Upload failed');
    } finally {
      setIsUploading(false);
    }
    return false;
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaUrls.length === 0) {
      message.warning('Neural transmission requires payload');
      return;
    }

    setIsSubmitting(true);
    try {
      let postType = 'TEXT';
      if (mediaUrls.length > 0) {
        postType = mediaUrls[0].type === 'video' ? 'VIDEO' : 'IMAGE';
        if (mediaUrls.length > 1) postType = 'CAROUSEL';
      }

      const response = await postApi.createPost({
        content: content.trim(),
        media: mediaUrls.length > 0 ? mediaUrls : undefined,
        type: postType,
      });

      message.success('Transmission synthesized!');
      setContent('');
      setMediaUrls([]);
      if (onPostCreated) onPostCreated(response.data.data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || 'Synthesis error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > maxLength;

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '24px',
      padding: '24px',
      border: `1px solid ${colors.gray[100]}`,
      boxShadow: shadows.md
    }}>
      {/* Input Nexus */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        <Avatar
          size={52}
          src={user?.avatar ? getImageUrl(user.avatar) : undefined}
          style={{
            border: `2px solid ${colors.gray[50]}`,
            boxShadow: shadows.sm,
            flexShrink: 0,
            background: colors.gray[50]
          }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </Avatar>
        <div style={{ flex: 1 }}>
          <TextArea
            ref={textAreaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            autoSize={{ minRows: 4, maxRows: 12 }}
            maxLength={maxLength}
            style={{
              fontSize: '17px',
              border: 'none',
              boxShadow: 'none',
              resize: 'none',
              padding: '8px 0',
              color: colors.text.primary,
              fontWeight: 500,
              background: 'transparent'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <Tag bordered={false} style={{
              background: isOverLimit ? colors.error.subtle : 'transparent',
              color: isOverLimit ? colors.error.solid : colors.text.tertiary,
              fontWeight: 700,
              fontSize: '11px',
              borderRadius: '6px'
            }}>
              {characterCount.toLocaleString()} / {maxLength.toLocaleString()}
            </Tag>
          </div>
        </div>
      </div>

      {/* Vector Preview Grid */}
      <AnimatePresence>
        {mediaUrls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              display: 'grid',
              gridTemplateColumns: mediaUrls.length === 1 ? '1fr' : 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '24px',
              padding: '12px',
              background: colors.gray[50],
              borderRadius: '20px',
              border: `1px solid ${colors.gray[100]}`
            }}
          >
            {mediaUrls.map((media, index) => (
              <div key={index} style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '200px', border: `1px solid ${colors.gray[100]}` }}>
                {media.type === 'image' ? (
                  <img src={media.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <Button
                  type="primary"
                  danger
                  shape="circle"
                  size="small"
                  icon={<X size={14} />}
                  onClick={() => handleRemoveMedia(index)}
                  style={{ position: 'absolute', top: '12px', right: '12px', backdropFilter: 'blur(10px)', background: 'rgba(239, 68, 68, 0.9)', border: 'none' }}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Divider style={{ margin: '0 0 20px 0', borderColor: colors.gray[50] }} />

      {/* Protocol Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size="middle">
          {allowMedia && (
            <>
              <Upload accept="image/*" beforeUpload={handleMediaUpload} showUploadList={false} disabled={isUploading || isSubmitting}>
                <Button
                  type="text"
                  icon={<ImageIcon size={18} color={colors.primary.solid} />}
                  style={{
                    borderRadius: '8px',
                    height: '40px',
                    padding: '0 16px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: colors.primary.subtle,
                    color: colors.primary.solid
                  }}
                >
                  Visual
                </Button>
              </Upload>
              <Upload accept="video/*" beforeUpload={handleMediaUpload} showUploadList={false} disabled={isUploading || isSubmitting}>
                <Button
                  type="text"
                  icon={<Film size={18} color="#8b5cf6" />}
                  style={{
                    borderRadius: '8px',
                    height: '40px',
                    padding: '0 16px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#f5f3ff',
                    color: '#8b5cf6'
                  }}
                >
                  Stream
                </Button>
              </Upload>
            </>
          )}

          {isUploading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.text.tertiary, fontWeight: 700, fontSize: '13px' }}>
              <Loader2 size={16} className="spin-anim" /> SYNCHRONIZING...
            </div>
          )}
        </Space>

        <Space size="middle">
          {onCancel && (
            <Button
              type="text"
              onClick={onCancel}
              disabled={isSubmitting}
              style={{ borderRadius: '8px', fontWeight: 600, color: colors.text.tertiary }}
            >
              Abort
            </Button>
          )}
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isOverLimit || isUploading || (!content.trim() && mediaUrls.length === 0)}
            icon={!isSubmitting && <Zap size={18} fill="currentColor" />}
            style={{
              height: '44px',
              borderRadius: '8px',
              fontWeight: 600,
              padding: '0 24px',
              background: colors.primary.solid,
              border: 'none',
              boxShadow: shadows.md,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isSubmitting ? 'Synthesizing...' : 'Transmit'}
          </Button>
        </Space>
      </div>

      <style>{`
        .spin-anim { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default PostCreator;
