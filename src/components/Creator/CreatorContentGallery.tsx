// ===========================================
// CREATOR CONTENT GALLERY COMPONENT
// Displays creator's content (videos, posts, etc.)
// ===========================================

import { useState } from 'react';
import { Row, Col, Card, Empty, Tag, Modal } from 'antd';
import {
  YoutubeOutlined,
  FileTextOutlined,
  SoundOutlined,
  BookOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { colors, spacing, typography } from '../../styles/tokens';
import CustomCard from '../common/Card/CustomCard';
import { getDownloadUrl } from '../../services/api';

interface ContentItem {
  id: string;
  title: string;
  type: 'YOUTUBE_VIDEO' | 'BLOG_POST' | 'PODCAST' | 'COURSE';
  url?: string;
  thumbnail?: string;
  description?: string;
  duration?: string;
  publishedAt?: string;
}

interface CreatorContentGalleryProps {
  contents: ContentItem[];
  creatorName: string;
}

export const CreatorContentGallery: React.FC<CreatorContentGalleryProps> = ({
  contents,
  creatorName,
}) => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  if (contents.length === 0) {
    return (
      <CustomCard depth={1} style={{ marginBottom: spacing[6] }}>
        <Empty
          description={`${creatorName} hasn't shared any content yet`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </CustomCard>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'YOUTUBE_VIDEO':
        return <YoutubeOutlined style={{ fontSize: '24px', color: colors.error.solid }} />;
      case 'BLOG_POST':
        return <FileTextOutlined style={{ fontSize: '24px', color: colors.primary.solid }} />;
      case 'PODCAST':
        return <SoundOutlined style={{ fontSize: '24px', color: colors.warning.solid }} />;
      case 'COURSE':
        return <BookOutlined style={{ fontSize: '24px', color: colors.success.solid }} />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'YOUTUBE_VIDEO':
        return 'Video';
      case 'BLOG_POST':
        return 'Blog';
      case 'PODCAST':
        return 'Podcast';
      case 'COURSE':
        return 'Course';
      default:
        return type;
    }
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  return (
    <>
      <CustomCard depth={1} style={{ marginBottom: spacing[6], background: 'white', color: colors.gray[900] }}>
        <h3 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[4], color: colors.gray[900] }}>
          Content Gallery
        </h3>
        <Row gutter={[16, 16]}>
          {contents.map((content) => (
            <Col xs={24} sm={12} lg={8} key={content.id}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card
                  hoverable
                  cover={
                    content.type === 'YOUTUBE_VIDEO' && content.url ? (
                      <div
                        style={{
                          position: 'relative',
                          paddingTop: '56.25%', // 16:9 aspect ratio
                          background: colors.gray[200],
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          const videoId = extractYouTubeId(content.url!);
                          if (videoId) {
                            setSelectedVideo(videoId);
                          }
                        }}
                      >
                        {content.thumbnail ? (
                          <img
                            src={getDownloadUrl('content', content.thumbnail)}
                            alt={content.title}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                            }}
                          >
                            <PlayCircleOutlined style={{ fontSize: '48px', color: colors.gray[400] }} />
                          </div>
                        )}
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: typography.fontSize.xs,
                          }}
                        >
                          {content.duration || 'Video'}
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          height: '150px',
                          background: colors.gray[100],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {getIcon(content.type)}
                      </div>
                    )
                  }
                  onClick={() => {
                    if (content.url && content.type !== 'YOUTUBE_VIDEO') {
                      window.open(content.url, '_blank');
                    }
                  }}
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
                        {getIcon(content.type)}
                        <Tag color="blue">{getTypeLabel(content.type)}</Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div
                          style={{
                            fontWeight: typography.fontWeight.medium,
                            marginBottom: spacing[1],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {content.title}
                        </div>
                        {content.description && (
                          <div
                            style={{
                              fontSize: typography.fontSize.sm,
                              color: colors.gray[600],
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {content.description}
                          </div>
                        )}
                      </div>
                    }
                  />
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </CustomCard>

      {/* YouTube Video Modal */}
      <Modal
        open={!!selectedVideo}
        onCancel={() => setSelectedVideo(null)}
        footer={null}
        width={800}
        centered
      >
        {selectedVideo && (
          <div style={{ paddingTop: '56.25%', position: 'relative', marginTop: spacing[4] }}>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        )}
      </Modal>
    </>
  );
};

export default CreatorContentGallery;



