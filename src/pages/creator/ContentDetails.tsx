// ===========================================
// CONTENT DETAILS PAGE
// Shows full content information with chunks
// ===========================================

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Tag,
  Spin,
  message,
  Descriptions,
  List,
  Progress,
  Space,
  Typography,
  Divider,
  Alert,
  Row,
  Col,
} from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  YoutubeOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { contentApi } from '../../services/api';
import { connectSocket, getSocket } from '../../utils/socket';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { colors, spacing } from '../../styles/tokens';

const { Title, Text, Paragraph } = Typography;

interface Chunk {
  id: string;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  createdAt: string;
}

interface ContentDetails {
  id: string;
  title: string;
  type: 'YOUTUBE_VIDEO' | 'MANUAL_TEXT' | 'FAQ';
  sourceUrl?: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string;
  chunks?: Chunk[];
  chunksCount?: number;
  createdAt: string;
  processedAt?: string;
  updatedAt: string;
  rawText?: string;
}

const ContentDetails = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const [content, setContent] = useState<ContentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (contentId) {
      fetchContent();
    }
  }, [contentId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!contentId) return;

    const authToken = token || localStorage.getItem('token') || undefined;
    const socket = connectSocket(authToken);

    const handleUpdate = (update: any) => {
      if (update.contentId === contentId) {
        setContent((prev) =>
          prev
            ? {
                ...prev,
                status: update.status || prev.status,
                chunksCount: update.chunksCount ?? prev.chunksCount,
                errorMessage: update.errorMessage ?? prev.errorMessage,
                processedAt: update.processedAt ?? prev.processedAt,
                progressPercentage: update.progress?.percentage,
                progressMessage: update.message,
                progressStage: update.progress?.stage,
              }
            : null
        );

        if (update.status === 'COMPLETED') {
          message.success(`Content processed successfully! Created ${update.chunksCount} chunks.`);
          fetchContent(); // Refresh to get chunks
        } else if (update.status === 'FAILED') {
          message.error(`Processing failed: ${update.errorMessage}`);
        }
      }
    };

    socket.on('content_processing_update', handleUpdate);

    return () => {
      const current = getSocket();
      current?.off('content_processing_update', handleUpdate);
    };
  }, [contentId, token]);

  const fetchContent = async () => {
    if (!contentId) return;

    try {
      setLoading(true);
      const response = await contentApi.getById(contentId);
      setContent(response.data.data);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to load content');
      navigate('/creator-dashboard/content');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contentId) return;

    try {
      await contentApi.delete(contentId);
      message.success('Content deleted successfully');
      navigate('/creator-dashboard/content');
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to delete content');
    }
  };

  const handleRetrain = async () => {
    if (!contentId) return;

    try {
      setProcessing(true);
      await contentApi.retrain(contentId);
      message.success('Retraining started');
      setContent((prev) => (prev ? { ...prev, status: 'PROCESSING', errorMessage: undefined } : null));
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to retrain');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          color: 'success',
          icon: <CheckCircleOutlined />,
          text: 'Completed',
          bg: 'rgba(16, 185, 129, 0.1)',
          border: 'rgba(16, 185, 129, 0.3)',
        };
      case 'PROCESSING':
        return {
          color: 'processing',
          icon: <SyncOutlined spin />,
          text: 'Processing',
          bg: 'rgba(59, 130, 246, 0.1)',
          border: 'rgba(59, 130, 246, 0.3)',
        };
      case 'FAILED':
        return {
          color: 'error',
          icon: <CloseCircleOutlined />,
          text: 'Failed',
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.3)',
        };
      default:
        return {
          color: 'default',
          icon: <FileTextOutlined />,
          text: status,
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'YOUTUBE_VIDEO':
        return <YoutubeOutlined style={{ color: '#EF4444' }} />;
      case 'FAQ':
        return <QuestionCircleOutlined style={{ color: colors.primary.solid }} />;
      default:
        return <FileTextOutlined style={{ color: colors.primary.solid }} />;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!content) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Content not found"
          description="The content you're looking for doesn't exist or has been deleted."
          type="error"
          action={
            <Button onClick={() => navigate('/creator-dashboard/content')}>Back to Content</Button>
          }
        />
      </div>
    );
  }

  const statusConfig = getStatusConfig(content.status);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: spacing[6] }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/creator-dashboard/content')}
          style={{ marginBottom: spacing[4] }}
        >
          Back to Content
        </Button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: spacing[2] }}>
              {getTypeIcon(content.type)}
              <Tag color={content.type === 'YOUTUBE_VIDEO' ? 'red' : content.type === 'FAQ' ? 'purple' : 'blue'}>
                {content.type.replace('_', ' ')}
              </Tag>
              <Tag
                color={statusConfig.color}
                style={{
                  background: statusConfig.bg,
                  borderColor: statusConfig.border,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {statusConfig.icon}
                {statusConfig.text}
              </Tag>
            </div>
            <Title level={1} style={{ color: '#FFFFFF', margin: 0, fontSize: '32px', fontWeight: 900 }}>
              {content.title}
            </Title>
          </div>

          <Space>
            {content.status === 'FAILED' && (
              <Button icon={<ReloadOutlined />} onClick={handleRetrain} loading={processing}>
                Retry Processing
              </Button>
            )}
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Delete
            </Button>
          </Space>
        </div>
      </div>

      {/* Error Alert */}
      {content.status === 'FAILED' && content.errorMessage && (
        <Alert
          message="Processing Failed"
          description={content.errorMessage}
          type="error"
          showIcon
          style={{ marginBottom: spacing[6] }}
          action={
            <Button size="small" onClick={handleRetrain} loading={processing}>
              Retry
            </Button>
          }
        />
      )}

      {/* Processing Progress */}
      {content.status === 'PROCESSING' && (
        <Card
          style={{
            marginBottom: spacing[6],
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ marginBottom: spacing[3] }}>
            <Text strong style={{ color: '#FFFFFF', fontSize: '16px' }}>
              Processing Status
            </Text>
          </div>
          <Progress
            percent={(content as any).progressPercentage || 0}
            status="active"
            strokeColor={{
              '0%': '#6366F1',
              '100%': '#A855F7',
            }}
            style={{ marginBottom: spacing[2] }}
          />
          {(content as any).progressStage && (
            <Text style={{ color: '#94A3B8', fontSize: '14px' }}>
              Stage: {(content as any).progressStage} • {(content as any).progressMessage || 'Processing...'}
            </Text>
          )}
        </Card>
      )}

      <Row gutter={[24, 24]}>
        {/* Main Content Info */}
        <Col xs={24} lg={16}>
          <Card
            title="Content Information"
            style={{
              marginBottom: spacing[6],
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Descriptions
              column={1}
              items={[
                {
                  key: 'type',
                  label: 'Type',
                  children: (
                    <Tag color={content.type === 'YOUTUBE_VIDEO' ? 'red' : content.type === 'FAQ' ? 'purple' : 'blue'}>
                      {content.type.replace('_', ' ')}
                    </Tag>
                  ),
                },
                {
                  key: 'status',
                  label: 'Status',
                  children: (
                    <Tag color={statusConfig.color} icon={statusConfig.icon}>
                      {statusConfig.text}
                    </Tag>
                  ),
                },
                ...(content.sourceUrl
                  ? [
                      {
                        key: 'sourceUrl',
                        label: 'Source URL',
                        children: (
                          <a href={content.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: colors.primary.light }}>
                            {content.sourceUrl}
                          </a>
                        ),
                      },
                    ]
                  : []),
                {
                  key: 'chunks',
                  label: 'Chunks Created',
                  children: <Text strong>{content.chunksCount || 0}</Text>,
                },
                {
                  key: 'created',
                  label: 'Created',
                  children: new Date(content.createdAt).toLocaleString(),
                },
                ...(content.processedAt
                  ? [
                      {
                        key: 'processed',
                        label: 'Processed',
                        children: new Date(content.processedAt).toLocaleString(),
                      },
                    ]
                  : []),
              ]}
              labelStyle={{ color: '#94A3B8', fontWeight: 600 }}
              contentStyle={{ color: '#FFFFFF' }}
            />
          </Card>

          {/* Chunks List */}
          {content.chunks && content.chunks.length > 0 && (
            <Card
              title={`Content Chunks (${content.chunks.length})`}
              style={{
                background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <List
                dataSource={content.chunks}
                renderItem={(chunk: Chunk) => (
                  <List.Item
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      padding: '20px 0',
                    }}
                  >
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <Tag color="blue">Chunk #{chunk.chunkIndex + 1}</Tag>
                        <Text style={{ color: '#94A3B8', fontSize: '12px' }}>
                          {chunk.tokenCount} tokens
                        </Text>
                      </div>
                      <Paragraph
                        style={{
                          color: '#E2E8F0',
                          margin: 0,
                          fontSize: '14px',
                          lineHeight: '1.6',
                        }}
                        ellipsis={{ rows: 3, expandable: true, symbol: 'Show more' }}
                      >
                        {chunk.text}
                      </Paragraph>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Card
            title="Quick Actions"
            style={{
              marginBottom: spacing[6],
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {content.status === 'FAILED' && (
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={handleRetrain}
                  loading={processing}
                  block
                  size="large"
                >
                  Retry Processing
                </Button>
              )}
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete} block size="large">
                Delete Content
              </Button>
            </Space>
          </Card>

          {/* Stats Card */}
          <Card
            title="Statistics"
            style={{
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#94A3B8' }}>Chunks</Text>
                <Text strong style={{ color: '#FFFFFF' }}>
                  {content.chunksCount || 0}
                </Text>
              </div>
              <Divider style={{ margin: 0, borderColor: 'rgba(255, 255, 255, 0.05)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#94A3B8' }}>Status</Text>
                <Tag color={statusConfig.color} icon={statusConfig.icon}>
                  {statusConfig.text}
                </Tag>
              </div>
              <Divider style={{ margin: 0, borderColor: 'rgba(255, 255, 255, 0.05)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#94A3B8' }}>Created</Text>
                <Text style={{ color: '#FFFFFF', fontSize: '12px' }}>
                  {new Date(content.createdAt).toLocaleDateString()}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ContentDetails;
