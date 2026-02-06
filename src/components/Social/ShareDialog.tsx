// ===========================================
// SHARE DIALOG COMPONENT
// Share chat/profile with social media
// ===========================================

import { useState } from 'react';
import { Modal, Button, Input, message as antMessage, Space, Divider } from 'antd';
import {
  ShareAltOutlined,
  CopyOutlined,
  FacebookOutlined,
  TwitterOutlined,
  WhatsAppOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import { colors, spacing } from '../../styles/tokens';

interface ShareDialogProps {
  visible: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  description?: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  visible,
  onClose,
  url,
  title = 'Share this',
  description,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      antMessage.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      antMessage.error('Failed to copy link');
    }
  };

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          antMessage.error('Failed to share');
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <ShareAltOutlined />
          <span>Share</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <div style={{ padding: spacing[2] }}>
        {/* URL Input */}
        <div style={{ marginBottom: spacing[4] }}>
          <Input
            value={url}
            readOnly
            suffix={
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={handleCopy}
                style={{ color: copied ? colors.success.solid : colors.gray[600] }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            }
          />
        </div>

        <Divider>Share via</Divider>

        {/* Social Media Buttons */}
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {'share' in navigator && (
            <Button
              block
              size="large"
              icon={<ShareAltOutlined />}
              onClick={handleNativeShare}
              style={{ marginBottom: spacing[2] }}
            >
              Share via...
            </Button>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: spacing[2] }}>
            <Button
              block
              size="large"
              icon={<FacebookOutlined style={{ color: '#1877F2' }} />}
              onClick={() => handleShare('facebook')}
            >
              Facebook
            </Button>
            <Button
              block
              size="large"
              icon={<TwitterOutlined style={{ color: '#1DA1F2' }} />}
              onClick={() => handleShare('twitter')}
            >
              Twitter
            </Button>
            <Button
              block
              size="large"
              icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
              onClick={() => handleShare('whatsapp')}
            >
              WhatsApp
            </Button>
            <Button
              block
              size="large"
              icon={<LinkedinOutlined style={{ color: '#0077B5' }} />}
              onClick={() => handleShare('linkedin')}
            >
              LinkedIn
            </Button>
          </div>
        </Space>
      </div>
    </Modal>
  );
};

export default ShareDialog;



