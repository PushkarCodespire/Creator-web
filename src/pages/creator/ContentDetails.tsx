// ===========================================
// CONTENT DETAILS PAGE - Premium Light Theme
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
  Tooltip,
} from 'antd';
import {
  ArrowLeft,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileText,
  Youtube,
  HelpCircle,
  Clock,
  ExternalLink,
  Zap,
  Layers,
  ShieldCheck,
  ChevronRight,
  Database,
  Cpu
} from 'lucide-react';
import { contentApi } from '../../services/api';
import { connectSocket, getSocket } from '../../utils/socket';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { colors, spacing, shadows, borderRadius } from '../../styles/tokens';
import { motion, AnimatePresence } from 'framer-motion';

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
          message.success(`Neural capture successful! Created ${update.chunksCount} vectors.`);
          fetchContent();
        } else if (update.status === 'FAILED') {
          message.error(`Neural capture failed: ${update.errorMessage}`);
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
      message.error(err.response?.data?.error || 'Failed to synchronize neural asset');
      navigate('/creator-dashboard/content');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contentId) return;
    try {
      await contentApi.delete(contentId);
      message.success('Neural asset purged successfully');
      navigate('/creator-dashboard/content');
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to purge asset');
    }
  };

  const handleRetrain = async () => {
    if (!contentId) return;
    try {
      setProcessing(true);
      await contentApi.retrain(contentId);
      message.success('Neural recalibration started');
      setContent((prev) => (prev ? { ...prev, status: 'PROCESSING', errorMessage: undefined } : null));
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to recalibrate');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          color: colors.success.solid,
          bg: colors.success.subtle,
          icon: <CheckCircle2 size={16} />,
          text: 'Calibrated'
        };
      case 'PROCESSING':
        return {
          color: colors.primary.solid,
          bg: colors.primary.subtle,
          icon: <RefreshCw size={16} className="spin-anim" />,
          text: 'Syncing'
        };
      case 'FAILED':
        return {
          color: colors.error.solid,
          bg: colors.error.subtle,
          icon: <XCircle size={16} />,
          text: 'Offline'
        };
      default:
        return {
          color: colors.gray[500],
          bg: colors.gray[50],
          icon: <Database size={16} />,
          text: status
        };
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'YOUTUBE_VIDEO':
        return { icon: <Youtube size={24} color="#ef4444" />, label: 'YouTube Stream', color: '#ef4444' };
      case 'FAQ':
        return { icon: <HelpCircle size={24} color="#8b5cf6" />, label: 'FAQ Matrix', color: '#8b5cf6' };
      default:
        return { icon: <FileText size={24} color={colors.primary.solid} />, label: 'Knowledge Base', color: colors.primary.solid };
    }
  };

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.background }}>
        <Spin size="large" tip={<span style={{ fontWeight: 800, marginTop: '20px', display: 'block' }}>Inspecting neural patterns...</span>} />
      </div>
    );
  }

  if (!content) return null;

  const statusConfig = getStatusConfig(content.status);
  const typeConfig = getTypeConfig(content.type);
  const cardStyle = {
    background: '#ffffff',
    borderRadius: '24px',
    border: `1px solid ${colors.gray[100]}`,
    boxShadow: shadows.md,
    overflow: 'hidden'
  };

  return (
    <div style={{ padding: spacing[8], maxWidth: '1240px', margin: '0 auto', background: colors.background, minHeight: '100vh' }}>
      {/* Header Nexus */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: spacing[10] }}
      >
        <Button
          type="link"
          icon={<ArrowLeft size={18} style={{ marginRight: '8px' }} />}
          onClick={() => navigate('/creator-dashboard/content')}
          style={{ marginBottom: spacing[6], padding: 0, color: colors.text.tertiary, fontWeight: 700, display: 'flex', alignItems: 'center' }}
        >
          Return to Registry
        </Button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '32px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: colors.gray[50], padding: '12px', borderRadius: '14px', border: `1px solid ${colors.gray[100]}` }}>
                {typeConfig.icon}
              </div>
              <div>
                <Tag bordered={false} style={{
                  background: statusConfig.bg,
                  color: statusConfig.color,
                  fontWeight: 900,
                  borderRadius: '8px',
                  padding: '4px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  textTransform: 'uppercase'
                }}>
                  {statusConfig.icon} {statusConfig.text}
                </Tag>
                <div style={{ fontSize: '13px', color: colors.text.tertiary, fontWeight: 600, marginTop: '4px' }}>
                  ID: <span style={{ fontFamily: 'monospace' }}>{content.id}</span>
                </div>
              </div>
            </div>
            <Title level={1} style={{ color: colors.text.primary, margin: 0, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {content.title}
            </Title>
          </div>

          <Space size="large">
            {content.status === 'FAILED' && (
              <Button
                type="primary"
                icon={<RefreshCw size={18} style={{ marginRight: '8px' }} />}
                onClick={handleRetrain}
                loading={processing}
                style={{ height: '44px', borderRadius: '8px', fontWeight: 600, background: colors.primary.solid, color: '#ffffff', border: 'none', boxShadow: shadows.md }}
              >
                Perform Recalibration
              </Button>
            )}
            <Button
              danger
              icon={<Trash2 size={18} style={{ marginRight: '8px' }} />}
              onClick={handleDelete}
              style={{ height: '44px', borderRadius: '8px', fontWeight: 600, padding: '0 24px' }}
            >
              Purge Asset
            </Button>
          </Space>
        </div>
      </motion.div>

      {/* Error Alert */}
      {content.status === 'FAILED' && content.errorMessage && (
        <Alert
          message={<span style={{ fontWeight: 800 }}>Neural Disruption Detected</span>}
          description={<span style={{ fontWeight: 500 }}>{content.errorMessage}</span>}
          type="error"
          showIcon
          icon={<XCircle size={20} />}
          style={{ marginBottom: spacing[10], borderRadius: '20px', padding: '24px', border: `1px solid ${colors.error.solid}20` }}
          action={
            <Button type="primary" danger onClick={handleRetrain} loading={processing} style={{ borderRadius: '10px', fontWeight: 700 }}>
              Retry Sync
            </Button>
          }
        />
      )}

      {/* Synchronizing Progress */}
      {content.status === 'PROCESSING' && (
        <Card bordered={false} style={{ ...cardStyle, marginBottom: spacing[10], padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Cpu size={20} style={{ color: colors.primary.solid }} />
              <Title level={4} style={{ color: colors.text.primary, margin: 0, fontWeight: 800, letterSpacing: '-0.01em' }}>Neural Extraction in Progress</Title>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 900, color: colors.primary.solid }}>{(content as any).progressPercentage || 0}%</span>
          </div>
          <Progress
            percent={(content as any).progressPercentage || 0}
            showInfo={false}
            strokeColor={colors.primary.solid}
            strokeWidth={14}
            style={{ marginBottom: '32px' }}
          />
          <div style={{
            background: colors.gray[50],
            padding: '20px',
            borderRadius: '16px',
            border: `1px solid ${colors.gray[100]}`,
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <RefreshCw size={20} className="spin-anim" style={{ color: colors.primary.solid }} />
            <div>
              <Text style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Stage</Text>
              <Text style={{ fontSize: '15px', fontWeight: 600, color: colors.text.primary }}>
                <span style={{ color: colors.primary.solid, fontWeight: 800 }}>[{(content as any).progressStage?.toUpperCase()}]</span> • {(content as any).progressMessage || 'Synthesizing knowledge vectors...'}
              </Text>
            </div>
          </div>
        </Card>
      )}

      <Row gutter={[32, 32]}>
        {/* Intelligence Matrix Information */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Layers size={20} color={colors.primary.solid} />
                <span style={{ fontWeight: 800, color: colors.text.primary }}>Intelligence Specification</span>
              </div>
            }
            bordered={false}
            style={{ ...cardStyle, marginBottom: spacing[10] }}
            styles={{ body: { padding: '40px' }, header: { borderBottom: `1px solid ${colors.gray[50]}`, padding: '0 40px' } }}
          >
            <Descriptions
              column={2}
              layout="vertical"
              items={[
                {
                  key: 'type',
                  label: 'Neural Classification',
                  children: (
                    <Tag bordered={false} icon={typeConfig.icon} style={{
                      background: colors.gray[50],
                      color: typeConfig.color,
                      fontWeight: 800,
                      borderRadius: '8px',
                      padding: '6px 16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px'
                    }}>
                      {typeConfig.label}
                    </Tag>
                  ),
                },
                {
                  key: 'status',
                  label: 'Operational State',
                  children: (
                    <Tag bordered={false} icon={statusConfig.icon} style={{
                      background: statusConfig.bg,
                      color: statusConfig.color,
                      fontWeight: 900,
                      borderRadius: '8px',
                      padding: '6px 16px',
                      fontSize: '13px'
                    }}>
                      {statusConfig.text}
                    </Tag>
                  ),
                },
                ...(content.sourceUrl
                  ? [
                    {
                      key: 'sourceUrl',
                      label: 'Stream Origin',
                      span: 2,
                      children: (
                        <a href={content.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: colors.primary.solid, fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {content.sourceUrl} <ExternalLink size={16} />
                        </a>
                      ),
                    },
                  ]
                  : []),
                {
                  key: 'chunks',
                  label: 'Ingested Vectors',
                  children: <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 900, color: colors.text.primary }}>{content.chunksCount || 0}</span>
                    <Text style={{ color: colors.text.tertiary, fontWeight: 700, fontSize: '13px', textTransform: 'uppercase' }}>Sub-units</Text>
                  </div>,
                },
                {
                  key: 'created',
                  label: 'Temporal Injection',
                  children: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.text.secondary, fontWeight: 600 }}>
                      <Clock size={16} /> {new Date(content.createdAt).toLocaleString()}
                    </div>
                  ),
                },
              ]}
              labelStyle={{ color: colors.text.tertiary, fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            />
          </Card>

          {/* Neural Chunks Inspection */}
          <AnimatePresence>
            {content.chunks && content.chunks.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Database size={20} color={colors.primary.solid} />
                      <span style={{ fontWeight: 800, color: colors.text.primary }}>Neural Vector Inspection ({content.chunks.length})</span>
                    </div>
                  }
                  bordered={false}
                  style={cardStyle}
                  styles={{ body: { padding: '0' }, header: { borderBottom: `1px solid ${colors.gray[50]}`, padding: '0 40px' } }}
                >
                  <List
                    dataSource={content.chunks}
                    renderItem={(chunk: Chunk) => (
                      <List.Item style={{ padding: '40px', borderBottom: `1px solid ${colors.gray[50]}`, transition: 'all 0.3s ease' }} className="neural-chunk-item">
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <Tag bordered={false} style={{ background: colors.primary.subtle, color: colors.primary.solid, fontWeight: 900, borderRadius: '8px', padding: '4px 12px' }}>VECTOR #{chunk.chunkIndex + 1}</Tag>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.text.tertiary, fontSize: '12px', fontWeight: 700 }}>
                              <Zap size={14} /> {chunk.tokenCount} QUANTUM TOKENS
                            </div>
                          </div>
                          <div style={{ position: 'relative' }}>
                            <div style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: '4px',
                              background: colors.primary.solid,
                              borderRadius: '2px',
                              opacity: 0.3
                            }} />
                            <Paragraph
                              style={{
                                color: colors.text.secondary,
                                margin: 0,
                                fontSize: '16px',
                                lineHeight: '1.8',
                                fontWeight: 500,
                                paddingLeft: '24px',
                              }}
                              ellipsis={{ rows: 4, expandable: true, symbol: <span style={{ color: colors.primary.solid, fontWeight: 800, marginLeft: '8px' }}>Expand Details <ChevronRight size={14} style={{ verticalAlign: 'middle' }} /></span> }}
                            >
                              {chunk.text}
                            </Paragraph>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Col>

        {/* Operational Sidebar */}
        <Col xs={24} lg={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Quick Protocols */}
            <Card
              title={<span style={{ fontWeight: 800, color: colors.text.primary }}>Operational Protocols</span>}
              bordered={false}
              style={cardStyle}
              styles={{ body: { padding: '32px' }, header: { borderBottom: `1px solid ${colors.gray[50]}`, padding: '0 32px' } }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {content.status === 'FAILED' && (
                  <Button
                    type="primary"
                    icon={<RefreshCw size={18} style={{ marginRight: '8px' }} />}
                    onClick={handleRetrain}
                    loading={processing}
                    block
                    style={{ height: '44px', borderRadius: '8px', fontWeight: 600, background: colors.primary.solid, color: '#ffffff', border: 'none', boxShadow: shadows.md }}
                  >
                    Initiate Recalibration
                  </Button>
                )}
                <Button
                  danger
                  icon={<Trash2 size={18} style={{ marginRight: '8px' }} />}
                  onClick={handleDelete}
                  block
                  style={{ height: '44px', borderRadius: '8px', fontWeight: 600, border: `1px solid ${colors.gray[200]}`, background: '#FFFFFF' }}
                >
                  Purge from Matrix
                </Button>
              </Space>
            </Card>

            {/* Neural Summary Stats */}
            <Card
              title={<span style={{ fontWeight: 800, color: colors.text.primary }}>Nexus Status</span>}
              bordered={false}
              style={cardStyle}
              styles={{ body: { padding: '32px' }, header: { borderBottom: `1px solid ${colors.gray[50]}`, padding: '0 32px' } }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.text.tertiary, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px' }}>Vector Volume</Text>
                  <Text style={{ color: colors.text.primary, fontSize: '20px', fontWeight: 900 }}>{content.chunksCount || 0}</Text>
                </div>
                <Divider style={{ margin: 0, borderColor: colors.gray[50] }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.text.tertiary, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px' }}>Sync Identity</Text>
                  <Tag bordered={false} icon={statusConfig.icon} style={{ background: statusConfig.bg, color: statusConfig.color, fontWeight: 900, borderRadius: '8px', padding: '4px 12px' }}>
                    {statusConfig.text}
                  </Tag>
                </div>
                <Divider style={{ margin: 0, borderColor: colors.gray[50] }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.text.tertiary, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px' }}>Origin Temporal</Text>
                  <Text style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: 700 }}>
                    {new Date(content.createdAt).toLocaleDateString()}
                  </Text>
                </div>
              </div>
            </Card>

            {/* Security Assurance */}
            <div style={{ padding: '24px', background: `${colors.success.solid}05`, borderRadius: '24px', border: `1px dashed ${colors.success.solid}25`, display: 'flex', gap: '16px' }}>
              <ShieldCheck size={24} color={colors.success.solid} style={{ flexShrink: 0 }} />
              <div>
                <Text style={{ display: 'block', fontWeight: 800, color: colors.text.primary, fontSize: '14px', marginBottom: '4px' }}>Integrity Guaranteed</Text>
                <Text style={{ fontSize: '12px', color: colors.text.secondary, fontWeight: 500, lineHeight: 1.5 }}>This neural asset is fully encrypted and stored within your private intelligence enclave.</Text>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <style>{`
          .neural-chunk-item:hover {
              background: ${colors.gray[50]}55 !important;
          }
          .spin-anim { animation: spin 2s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ContentDetails;
