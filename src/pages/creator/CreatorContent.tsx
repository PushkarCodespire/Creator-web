// ===========================================
// CREATOR CONTENT PAGE - Premium Light Theme
// ===========================================

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Row,
  Col,
  Tooltip,
  Select,
  Progress,
  Typography,
  Alert,
  Grid,
  InputNumber,
  Divider,
} from 'antd';
import {
  Youtube,
  FileText,
  Trash2,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  PlusCircle,
  Eye,
  Filter,
  XCircle,
  ArrowUp,
  ArrowDown,
  Zap,
  Sparkles,
  Search,
  ChevronRight,
  Database,
  CloudLightning,
  Info,
  Link
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { contentApi } from '../../services/api';
import { connectSocket, getSocket } from '../../utils/socket';
import { colors, spacing, shadows, borderRadius } from '../../styles/tokens';
import { motion, AnimatePresence } from 'framer-motion';

const { TextArea } = Input;
const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

const CreatorContent = () => {
  const navigate = useNavigate();
  const [contents, setContents] = useState<any[]>([]);
  const [allContents, setAllContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<'youtube' | 'manual' | 'faq' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [form] = Form.useForm();
  const [faqForm] = Form.useForm();
  const { token } = useSelector((state: RootState) => state.auth);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    fetchContent();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    const authToken = token || localStorage.getItem('token') || undefined;
    const socket = connectSocket(authToken);

    const handleUpdate = (update: any) => {
      const updateItem = (item: any) => ({
        ...item,
        status: update.status || item.status,
        _count: {
          ...(item._count || {}),
          chunks: typeof update.chunksCount === 'number' ? update.chunksCount : item._count?.chunks ?? 0,
        },
        errorMessage: update.errorMessage ?? item.errorMessage,
        processedAt: update.processedAt ?? item.processedAt,
        progressPercentage: update.progress?.percentage,
        progressMessage: update.message ?? item.progressMessage,
        progressStage: update.progress?.stage,
      });

      setContents((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === update.contentId);
        if (existingIndex >= 0) {
          return prev.map((item) => item.id === update.contentId ? updateItem(item) : item);
        } else {
          return [
            {
              id: update.contentId,
              status: update.status || 'PROCESSING',
              _count: { chunks: update.chunksCount || 0 },
              errorMessage: update.errorMessage,
              processedAt: update.processedAt,
              progressPercentage: update.progress?.percentage,
              progressMessage: update.message,
              progressStage: update.progress?.stage,
              title: 'Processing...',
              type: 'MANUAL_TEXT',
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ];
        }
      });

      setAllContents((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === update.contentId);
        if (existingIndex >= 0) {
          return prev.map((item) => item.id === update.contentId ? updateItem(item) : item);
        } else {
          return [
            {
              id: update.contentId,
              status: update.status || 'PROCESSING',
              _count: { chunks: update.chunksCount || 0 },
              errorMessage: update.errorMessage,
              processedAt: update.processedAt,
              progressPercentage: update.progress?.percentage,
              progressMessage: update.message,
              progressStage: update.progress?.stage,
              title: 'Processing...',
              type: 'MANUAL_TEXT',
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ];
        }
      });

      if (update.status === 'COMPLETED') {
        message.success(`Neural pattern established! Created ${update.chunksCount} chunks.`);
        setTimeout(() => fetchContent(), 500);
      } else if (update.status === 'FAILED') {
        message.error(`Neural capture failed: ${update.errorMessage || 'Unknown interference'}`);
      }
    };

    socket.on('content_processing_update', handleUpdate);
    return () => {
      const current = getSocket();
      current?.off('content_processing_update', handleUpdate);
    };
  }, [token]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await contentApi.getAll({ page: pagination.current, limit: pagination.pageSize });
      const fetchedContents = response.data.data.contents || [];
      setAllContents(fetchedContents);
      setContents(fetchedContents);
      setPagination((prev) => ({
        ...prev,
        total: response.data.data.pagination?.total || 0,
      }));
    } catch (err) {
      console.error('Failed to fetch content:', err);
      message.error('Failed to synchronize neural assets');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedContents = useMemo(() => {
    let filtered = [...allContents];
    if (statusFilter) filtered = filtered.filter((item) => item.status === statusFilter);
    if (typeFilter) filtered = filtered.filter((item) => item.type === typeFilter);
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return filtered;
  }, [allContents, statusFilter, typeFilter, sortBy]);

  const handleAddYouTube = async (values: any) => {
    setSubmitting(true);
    try {
      const response = await contentApi.addYouTube(values.url, values.title);
      message.success('YouTube vector added! Neural processing active.');
      setModalType(null);
      form.resetFields();
      setTimeout(() => fetchContent(), 1000);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to ingest video');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddManual = async (values: any) => {
    setSubmitting(true);
    try {
      await contentApi.addManual(values.title, values.text);
      message.success('Knowledge point added! Neural sync in progress.');
      setModalType(null);
      form.resetFields();
      setTimeout(() => fetchContent(), 1000);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to add knowledge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFAQ = async (values: any) => {
    setSubmitting(true);
    try {
      const questions = values.faqs.map((faq: any) => faq.question.toLowerCase().trim());
      const uniqueQuestions = new Set(questions);
      if (questions.length !== uniqueQuestions.size) {
        message.warning('Neural redundancy: Duplicate questions detected');
        setSubmitting(false);
        return;
      }
      await contentApi.addFAQ(values.title, values.faqs);
      message.success('FAQ bundle added! Knowledge matrix updating.');
      setModalType(null);
      faqForm.resetFields();
      setTimeout(() => fetchContent(), 1000);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to add FAQs');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await contentApi.delete(id);
      message.success('Neural asset purged successfully');
      fetchContent();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to purge asset');
    }
  };

  const getStatusBadge = (record: any) => {
    const status = record.status;
    if (status === 'COMPLETED') {
      return (
        <Tag bordered={false} icon={<CheckCircle2 size={12} style={{ marginRight: '6px' }} />} style={{
          background: colors.success.subtle,
          color: colors.success.solid,
          fontWeight: 800,
          borderRadius: '6px',
          fontSize: '11px',
          padding: '2px 10px'
        }}>
          COMPLETED
        </Tag>
      );
    }
    if (status === 'PROCESSING') {
      return (
        <Tag bordered={false} icon={<RefreshCw size={12} className="spin-anim" style={{ marginRight: '6px' }} />} style={{
          background: colors.primary.subtle,
          color: colors.primary.solid,
          fontWeight: 800,
          borderRadius: '6px',
          fontSize: '11px',
          padding: '2px 10px'
        }}>
          {record.progressPercentage ? `${record.progressPercentage}%` : 'SYNCING'}
        </Tag>
      );
    }
    if (status === 'FAILED') {
      return (
        <Tag bordered={false} icon={<XCircle size={12} style={{ marginRight: '6px' }} />} style={{
          background: colors.error.subtle,
          color: colors.error.solid,
          fontWeight: 800,
          borderRadius: '6px',
          fontSize: '11px',
          padding: '2px 10px'
        }}>
          FAILED
        </Tag>
      );
    }
    return <Tag bordered={false} style={{ fontWeight: 800, borderRadius: '6px' }}>{status}</Tag>;
  };

  const getTypeBadge = (type: string) => {
    const config: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
      YOUTUBE_VIDEO: { color: '#ef4444', bg: '#fef2f2', icon: <Youtube size={12} /> },
      MANUAL_TEXT: { color: colors.primary.solid, bg: colors.primary.subtle, icon: <FileText size={12} /> },
      FAQ: { color: '#8b5cf6', bg: '#f5f3ff', icon: <HelpCircle size={12} /> },
    };
    const cfg = config[type] || { color: colors.gray[500], bg: colors.gray[50], icon: <FileText size={12} /> };
    return (
      <Tag bordered={false} icon={cfg.icon} style={{
        background: cfg.bg,
        color: cfg.color,
        fontWeight: 800,
        borderRadius: '6px',
        fontSize: '10px',
        padding: '2px 8px',
        textTransform: 'uppercase'
      }}>
        {type.replace('_', ' ')}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Neural Asset',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: colors.gray[50],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${colors.gray[100]}`
          }}>
            {record.type === 'YOUTUBE_VIDEO' ? <Youtube size={18} color="#ef4444" /> :
              record.type === 'FAQ' ? <HelpCircle size={18} color="#8b5cf6" /> :
                <FileText size={18} color={colors.primary.solid} />}
          </div>
          <div>
            <Button
              type="link"
              onClick={() => navigate(`/creator-dashboard/content/${record.id}`)}
              style={{ padding: 0, color: colors.text.primary, fontWeight: 800, fontSize: '15px' }}
            >
              {text}
            </Button>
            <div style={{ fontSize: '11px', color: colors.text.tertiary, fontWeight: 600 }}>ID: {record.id.substring(0, 8)}...</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Class',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getTypeBadge(type),
    },
    {
      title: 'Current State',
      dataIndex: 'status',
      key: 'status',
      render: (_: string, record: any) => getStatusBadge(record),
    },
    {
      title: 'Intelligence Chunks',
      key: 'chunks',
      render: (r: any) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: '18px', color: r._count?.chunks > 0 ? colors.primary.solid : colors.text.tertiary }}>
            {r._count?.chunks || 0}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: colors.text.tertiary, letterSpacing: '0.05em' }}>Vectors</div>
        </div>
      ),
    },
    {
      title: 'Added Temporal',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => <Text style={{ color: colors.text.secondary, fontWeight: 700, fontSize: '13px' }}>{new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>,
    },
    {
      title: 'Nexus Actions',
      key: 'actions',
      render: (r: any) => (
        <Space size="middle">
          <Tooltip title="Neural Inspection">
            <Button
              icon={<Eye size={18} />}
              size="middle"
              onClick={() => navigate(`/creator-dashboard/content/${r.id}`)}
              style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          </Tooltip>
          <Popconfirm
            title="Purge Asset?"
            description="Permanently disconnect this intelligence stream from the matrix."
            onConfirm={() => handleDelete(r.id)}
            okText="Purge"
            cancelText="Abort"
            okButtonProps={{ danger: true, style: { borderRadius: '8px' } }}
            cancelButtonProps={{ style: { borderRadius: '8px' } }}
          >
            <Tooltip title="Purge">
              <Button icon={<Trash2 size={18} />} size="middle" danger style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: isMobile ? spacing[3] : spacing[8], background: colors.background, minHeight: '100vh' }}>
      {/* Header Nexus */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: spacing[10] }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '32px' }}>
          <div>
            <Title level={isMobile ? 3 : 1} style={{ color: colors.text.primary, margin: 0, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Intelligence <span style={{ color: colors.primary.solid }}>Nexus</span>
            </Title>
            <Text style={{ color: colors.text.secondary, fontSize: isMobile ? '14px' : '16px', fontWeight: 500, marginTop: '12px', display: 'block' }}>
              Managing {allContents.length} neural knowledge vectors for AI replication
            </Text>
          </div>
          <Space size="large" wrap style={{ width: isMobile ? '100%' : 'auto' }}>
            <Button
              icon={<Youtube size={16} />}
              onClick={() => setModalType('youtube')}
              style={{
                borderRadius: '6px',
                height: '44px',
                fontWeight: 500,
                fontSize: '14px',
                padding: '0 20px',
                flex: isMobile ? 1 : 'none',
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                color: '#1268ff',
                border: '1px solid #1268ff',
                boxShadow: shadows.sm
              }}
            >
              Connect YouTube
            </Button>
            <Button
              icon={<FileText size={16} />}
              onClick={() => setModalType('manual')}
              style={{
                borderRadius: '6px',
                height: '44px',
                fontWeight: 500,
                fontSize: '14px',
                padding: '0 20px',
                flex: isMobile ? 1 : 'none',
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                color: '#1268ff',
                border: '1px solid #1268ff',
                boxShadow: shadows.sm
              }}
            >
              Add Knowledge
            </Button>
            <Button
              type="primary"
              icon={<PlusCircle size={16} />}
              onClick={() => setModalType('faq')}
              style={{
                borderRadius: '6px',
                height: '44px',
                fontWeight: 500,
                fontSize: '14px',
                padding: '0 24px',
                flex: isMobile ? 1 : 'none',
                display: 'flex',
                alignItems: 'center',
                background: '#1268ff',
                color: '#ffffff',
                border: 'none',
                boxShadow: shadows.md
              }}
            >
              Sync FAQ
            </Button>
          </Space>
        </div>
      </motion.div>

      {/* Operational Stats Grid */}
      <Row gutter={[24, 24]} style={{ marginBottom: spacing[10] }}>
        {[
          { label: 'Neural Assets', value: allContents.length, icon: <Database size={20} />, color: colors.primary.solid, bg: colors.primary.subtle },
          { label: 'Calibrated', value: allContents.filter(c => c.status === 'COMPLETED').length, icon: <CheckCircle2 size={20} />, color: colors.success.solid, bg: colors.success.subtle },
          { label: 'Active Sync', value: allContents.filter(c => c.status === 'PROCESSING').length, icon: <CloudLightning size={20} />, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Interference', value: allContents.filter(c => c.status === 'FAILED').length, icon: <XCircle size={20} />, color: colors.error.solid, bg: colors.error.subtle },
        ].map((item, index) => (
          <Col xs={12} lg={6} key={index}>
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '32px',
              border: `1px solid ${colors.gray[100]}`,
              boxShadow: shadows.md,
              display: 'flex',
              alignItems: 'center',
              gap: '24px'
            }}>
              <div style={{
                padding: '16px',
                borderRadius: '16px',
                background: item.bg,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: colors.text.primary, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: '8px' }}>{item.value}</div>
                <div style={{ color: colors.text.tertiary, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}>{item.label}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Main Asset Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: '28px',
        boxShadow: shadows.lg,
        border: `1px solid ${colors.gray[100]}`,
        overflow: 'hidden'
      }}>
        <div style={{
          padding: isMobile ? '24px' : '40px',
          borderBottom: `1px solid ${colors.gray[100]}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          background: '#ffffff'
        }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '20px', color: colors.text.primary, letterSpacing: '-0.01em' }}>Protocol Registry</h3>
            <Text style={{ fontSize: '13px', color: colors.text.tertiary, fontWeight: 500 }}>Active knowledge streams for neural extraction</Text>
          </div>
          <Space wrap size="middle">
            <Select
              placeholder="All Neural Types"
              style={{ width: 180, height: '40px' }}
              allowClear
              onChange={setTypeFilter}
              className="premium-select"
              options={[
                { value: 'YOUTUBE_VIDEO', label: 'YouTube Stream' },
                { value: 'MANUAL_TEXT', label: 'Knowledge Base' },
                { value: 'FAQ', label: 'FAQ Matrix' },
              ]}
              dropdownStyle={{ borderRadius: '8px' }}
            />
            <Select
              placeholder="Operational Status"
              style={{ width: 180, height: '40px' }}
              allowClear
              onChange={setStatusFilter}
              className="premium-select"
              options={[
                { value: 'COMPLETED', label: 'Calibrated' },
                { value: 'PROCESSING', label: 'Syncing' },
                { value: 'FAILED', label: 'Offline' },
              ]}
              dropdownStyle={{ borderRadius: '8px' }}
            />
            <Button
              icon={sortBy === 'newest' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
              onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
              style={{
                borderRadius: '8px',
                height: '40px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                color: colors.text.primary,
                border: `1px solid ${colors.gray[200]}`
              }}
            >
              {sortBy === 'newest' ? 'Recent Flux' : 'Legacy Assets'}
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredAndSortedContents}
          loading={loading}
          pagination={{
            ...pagination,
            style: { padding: '24px 40px' },
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50']
          }}
          className="flagship-table"
          rowKey="id"
          locale={{
            emptyText: <div style={{ padding: '80px 0', textAlign: 'center' }}>
              <Database size={64} style={{ color: colors.gray[200], marginBottom: '24px' }} />
              <Text style={{ color: colors.text.tertiary, fontWeight: 600, fontSize: '18px', display: 'block' }}>Zero intelligence vectors detected.</Text>
              <Text style={{ color: colors.text.tertiary, fontSize: '14px', marginTop: '8px' }}>Start by connecting your first knowledge stream.</Text>
            </div>
          }}
        />
      </div>

      {/* YouTube Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '12px' }}><Youtube size={24} color="#ef4444" /></div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: colors.text.primary, letterSpacing: '-0.01em' }}>Ingest YouTube Feed</div>
              <div style={{ fontSize: '12px', color: colors.text.tertiary, fontWeight: 500 }}>Vectorize video knowledge for neural training</div>
            </div>
          </div>
        }
        open={modalType === 'youtube'}
        onCancel={() => { setModalType(null); form.resetFields(); }}
        footer={null}
        destroyOnClose
        centered
        width={540}
        className="premium-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleAddYouTube} requiredMark={false} style={{ marginTop: '24px' }}>
          <Form.Item
            name="url"
            label={<span style={{ fontWeight: 700, color: colors.text.secondary, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Video Stream URL</span>}
            rules={[{ required: true, message: 'URL required' }, { pattern: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/, message: 'Invalid stream format' }]}
          >
            <Input
              prefix={<Link size={18} style={{ color: colors.text.tertiary, marginRight: '8px' }} />}
              placeholder="https://youtube.com/watch?v=..."
              style={{ borderRadius: '12px', height: '52px', background: colors.gray[50], border: `1px solid ${colors.gray[200]}`, fontWeight: 600 }}
            />
          </Form.Item>
          <Form.Item
            name="title"
            label={<span style={{ fontWeight: 700, color: colors.text.secondary, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Process Title (Optional)</span>}
          >
            <Input
              placeholder="Auto-extract if empty"
              maxLength={200}
              showCount
              style={{ borderRadius: '12px', height: '52px', background: colors.gray[50], border: `1px solid ${colors.gray[200]}`, fontWeight: 600 }}
            />
          </Form.Item>
          <div style={{ padding: '20px', background: colors.primary.subtle, borderRadius: '16px', border: `1px solid ${colors.primary.solid}15`, marginBottom: '32px', display: 'flex', gap: '12px' }}>
            <Info size={18} color={colors.primary.solid} style={{ marginTop: '2px' }} />
            <Text style={{ fontSize: '12px', color: colors.text.secondary, lineHeight: 1.6 }}>Neural processing extracts transcripts and visual metadata for accurate persona replication. Captions must be present on the stream.</Text>
          </div>
          <Button type="primary" htmlType="submit" loading={submitting} block style={{ height: '60px', borderRadius: '16px', fontWeight: 800, background: colors.primary.gradient, border: 'none', boxShadow: shadows.lg }}>
            Initiate Neural Capture
          </Button>
        </Form>
      </Modal>

      {/* Manual Content Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: colors.primary.subtle, padding: '10px', borderRadius: '12px' }}><FileText size={24} color={colors.primary.solid} /></div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: colors.text.primary, letterSpacing: '-0.01em' }}>Neural Instruction</div>
              <div style={{ fontSize: '12px', color: colors.text.tertiary, fontWeight: 500 }}>Manual injection of persona narratives and knowledge</div>
            </div>
          </div>
        }
        open={modalType === 'manual'}
        onCancel={() => { setModalType(null); form.resetFields(); }}
        footer={null}
        destroyOnClose
        centered
        width={720}
        className="premium-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleAddManual} requiredMark={false} style={{ marginTop: '24px' }}>
          <Form.Item
            name="title"
            label={<span style={{ fontWeight: 700, color: colors.text.secondary, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Instruction Segment Title</span>}
            rules={[{ required: true, message: 'Title required' }]}
          >
            <Input placeholder="e.g. CORE PHILOSOPHY MATRIX" style={{ borderRadius: '12px', height: '52px', background: colors.gray[50], border: `1px solid ${colors.gray[200]}`, fontWeight: 800 }} />
          </Form.Item>
          <Form.Item
            name="text"
            label={<span style={{ fontWeight: 700, color: colors.text.secondary, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Neural Data Payload</span>}
            rules={[{ required: true, message: 'Data payload required' }, { min: 100, message: 'Minimum 100 characters for neural accuracy' }]}
          >
            <TextArea rows={12} placeholder="Inject full knowledge context here..." style={{ borderRadius: '16px', background: colors.gray[50], border: `1px solid ${colors.gray[200]}`, padding: '20px', fontWeight: 600 }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block style={{ height: '60px', borderRadius: '16px', fontWeight: 800, background: colors.primary.gradient, border: 'none', boxShadow: shadows.lg }}>
            Synchronize Knowledge Vector
          </Button>
        </Form>
      </Modal>

      {/* FAQ Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#f5f3ff', padding: '10px', borderRadius: '12px' }}><HelpCircle size={24} color="#8b5cf6" /></div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: colors.text.primary, letterSpacing: '-0.01em' }}>FAQ Matrix Sync</div>
              <div style={{ fontSize: '12px', color: colors.text.tertiary, fontWeight: 500 }}>Hard-coded resonance points for absolute accuracy</div>
            </div>
          </div>
        }
        open={modalType === 'faq'}
        onCancel={() => { setModalType(null); faqForm.resetFields(); }}
        footer={null}
        destroyOnClose
        centered
        width={720}
        className="premium-modal"
      >
        <Form form={faqForm} layout="vertical" onFinish={handleAddFAQ} requiredMark={false} style={{ marginTop: '24px' }}>
          <Form.Item
            name="title"
            label={<span style={{ fontWeight: 700, color: colors.text.secondary, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>FAQ Bundle Identifier</span>}
            rules={[{ required: true, message: 'Identifier required' }]}
          >
            <Input placeholder="e.g. PRIMARY RESPONSE PROTOCOLS" style={{ borderRadius: '12px', height: '52px', background: colors.gray[50], border: `1px solid ${colors.gray[200]}`, fontWeight: 800 }} />
          </Form.Item>

          <Divider style={{ margin: '32px 0' }}><Tag style={{ borderRadius: '20px', fontWeight: 800, padding: '4px 16px' }}>RESPONSE VECTORS</Tag></Divider>

          <Form.List name="faqs" initialValue={[{ question: '', answer: '' }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ background: colors.gray[50], padding: '24px', borderRadius: '20px', marginBottom: '16px', border: `1px solid ${colors.gray[100]}`, position: 'relative' }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'question']}
                      label={<span style={{ fontWeight: 800, color: colors.text.primary, fontSize: '12px' }}>Interrogative Query</span>}
                      rules={[{ required: true, message: 'Query required' }]}
                    >
                      <Input placeholder="What do users ask?" style={{ borderRadius: '10px' }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'answer']}
                      label={<span style={{ fontWeight: 800, color: colors.text.primary, fontSize: '12px' }}>Synchronized Response</span>}
                      rules={[{ required: true, message: 'Response required' }]}
                    >
                      <TextArea rows={3} placeholder="Provide the absolute neural response..." style={{ borderRadius: '10px' }} />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<Trash2 size={16} />}
                        onClick={() => remove(name)}
                        style={{ position: 'absolute', top: '16px', right: '16px' }}
                      />
                    )}
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusCircle size={18} style={{ marginRight: '8px' }} />}
                  style={{ height: '52px', borderRadius: '12px', fontWeight: 700, border: `2px dashed ${colors.gray[200]}`, color: colors.text.secondary }}
                >
                  Append Response Vector
                </Button>
              </>
            )}
          </Form.List>

          <Button type="primary" htmlType="submit" loading={submitting} block style={{ height: '60px', borderRadius: '16px', fontWeight: 800, marginTop: '40px', background: colors.primary.gradient, border: 'none', boxShadow: shadows.lg }}>
            Synchronize FAQ Matrix
          </Button>
        </Form>
      </Modal>

      <style>{`
          .flagship-table .ant-table { background: #ffffff !important; }
          .flagship-table .ant-table-thead > tr > th {
            background: ${colors.gray[50]} !important;
            color: ${colors.text.tertiary} !important;
            border-bottom: 1px solid ${colors.gray[100]} !important;
            font-weight: 700 !important;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.1em;
            padding: 20px !important;
          }
          .flagship-table .ant-table-tbody > tr > td { 
            border-bottom: 1px solid ${colors.gray[100]} !important; 
            padding: 20px !important;
            background: #ffffff !important;
            color: ${colors.text.primary} !important;
          }
          .flagship-table .ant-table-tbody > tr:hover > td { background: ${colors.gray[50]} !important; }
          .flagship-table .ant-table-placeholder .ant-table-cell { background: #ffffff !important; border-bottom: none !important; }
          
          .premium-modal .ant-modal-content { border-radius: 12px !important; padding: 24px !important; border: 1px solid ${colors.gray[200]} !important; background: #FFFFFF !important; box-shadow: ${shadows.xl} !important; }
          .premium-modal .ant-modal-header { border-bottom: none !important; margin-bottom: 24px !important; background: transparent !important; }
          .premium-modal .ant-modal-title { color: ${colors.text.primary} !important; }
          
          .ant-pagination-item-active { border-color: ${colors.primary.solid} !important; background: ${colors.primary.solid} !important; }
          .ant-pagination-item-active a { color: #FFFFFF !important; }

          /* Enhanced Select Styling for Visibility */
          .ant-select-selector {
            background: #ffffff !important;
            border: 1px solid ${colors.gray[200]} !important;
            color: ${colors.text.primary} !important;
            border-radius: 8px !important;
          }

          .ant-select-selection-placeholder {
            color: ${colors.text.tertiary} !important;
            font-weight: 400 !important;
          }

          .ant-select-selection-item {
            color: ${colors.text.primary} !important;
            font-weight: 500 !important;
          }

          .ant-select-dropdown {
            background: #ffffff !important;
            border: 1px solid ${colors.gray[100]} !important;
            box-shadow: ${shadows.lg} !important;
            padding: 4px !important;
          }

          .ant-select-item {
            color: ${colors.text.primary} !important;
            border-radius: 6px !important;
            margin: 2px 0 !important;
          }

          .ant-select-item-option-active {
            background: ${colors.gray[50]} !important;
          }

          .ant-select-item-option-selected {
            background: ${colors.primary.subtle} !important;
            color: ${colors.primary.solid} !important;
            font-weight: 600 !important;
          }
          
          .spin-anim { animation: spin 2s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CreatorContent;
