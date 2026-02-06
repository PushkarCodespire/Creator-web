// ===========================================
// CREATOR CONTENT PAGE - Enhanced
// Complete implementation per API documentation
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
  Statistic,
  Typography,
  Alert,
} from 'antd';
import {
  YoutubeOutlined,
  FileTextOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  PlusCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { contentApi } from '../../services/api';
import { connectSocket, getSocket } from '../../utils/socket';
import { Grid } from 'antd';
import { colors, spacing } from '../../styles/tokens';

const { TextArea } = Input;
const { useBreakpoint } = Grid;
const { Text } = Typography;

const CreatorContent = () => {
  const navigate = useNavigate();
  const [contents, setContents] = useState<any[]>([]);
  const [allContents, setAllContents] = useState<any[]>([]); // For filtering
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<'youtube' | 'manual' | 'faq' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [form] = Form.useForm();
  const [faqForm] = Form.useForm();
  const { token } = useSelector((state: RootState) => state.auth);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Filters
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    fetchContent();
  }, [pagination.current, pagination.pageSize]);

  // Subscribe to real-time processing updates
  useEffect(() => {
    const authToken = token || localStorage.getItem('token') || undefined;
    const socket = connectSocket(authToken);

    const handleUpdate = (update: any) => {
      const updateItem = (item: any) => ({
        ...item,
        status: update.status || item.status,
        _count: {
          ...(item._count || {}),
          chunks:
            typeof update.chunksCount === 'number'
              ? update.chunksCount
              : item._count?.chunks ?? 0,
        },
        errorMessage: update.errorMessage ?? item.errorMessage,
        processedAt: update.processedAt ?? item.processedAt,
        progressPercentage: update.progress?.percentage,
        progressMessage: update.message ?? item.progressMessage,
        progressStage: update.progress?.stage,
      });

      // Update existing items or add new one if it doesn't exist
      setContents((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === update.contentId);
        if (existingIndex >= 0) {
          // Update existing item
          return prev.map((item) =>
            item.id === update.contentId ? updateItem(item) : item
          );
        } else {
          // Add new item if it doesn't exist (optimistic update from WebSocket)
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
              title: 'Processing...', // Placeholder, will be updated on fetch
              type: 'MANUAL_TEXT', // Placeholder
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ];
        }
      });

      setAllContents((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === update.contentId);
        if (existingIndex >= 0) {
          // Update existing item
          return prev.map((item) =>
            item.id === update.contentId ? updateItem(item) : item
          );
        } else {
          // Add new item if it doesn't exist
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

      // Show notifications
      if (update.status === 'COMPLETED') {
        message.success(`Content processed! Created ${update.chunksCount} chunks.`);
        // Refresh to get full content details after a short delay
        setTimeout(() => {
          fetchContent();
        }, 500);
      } else if (update.status === 'FAILED') {
        message.error(`Processing failed: ${update.errorMessage || 'Unknown error'}`);
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
      message.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort contents
  const filteredAndSortedContents = useMemo(() => {
    let filtered = [...allContents];

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [allContents, statusFilter, typeFilter, sortBy]);

  // Validation helpers
  const validateYouTubeUrl = (_: any, value: string) => {
    if (!value) return Promise.resolve();
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/;
    if (!youtubeRegex.test(value)) {
      return Promise.reject(new Error('Please enter a valid YouTube URL'));
    }
    return Promise.resolve();
  };

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
  };

  const handleAddYouTube = async (values: any) => {
    setSubmitting(true);
    try {
      const response = await contentApi.addYouTube(values.url, values.title);
      const newContent = response.data.data;
      
      // Optimistically add to state immediately
      const optimisticContent = {
        ...newContent,
        _count: { chunks: 0 },
        progressPercentage: 0,
        progressMessage: 'Processing started...',
        progressStage: 'chunking',
      };
      
      setContents((prev) => [optimisticContent, ...prev]);
      setAllContents((prev) => [optimisticContent, ...prev]);
      
      message.success('YouTube video added! Processing will start shortly.');
      setModalType(null);
      form.resetFields();
      
      // Refresh to get accurate data (WebSocket will update in real-time)
      setTimeout(() => fetchContent(), 1000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to add video';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddManual = async (values: any) => {
    setSubmitting(true);
    try {
      const response = await contentApi.addManual(values.title, values.text);
      const newContent = response.data.data;
      
      // Optimistically add to state immediately
      const optimisticContent = {
        ...newContent,
        _count: { chunks: 0 },
        progressPercentage: 0,
        progressMessage: 'Processing started...',
        progressStage: 'chunking',
      };
      
      setContents((prev) => [optimisticContent, ...prev]);
      setAllContents((prev) => [optimisticContent, ...prev]);
      
      message.success('Content added! Processing will start shortly.');
      setModalType(null);
      form.resetFields();
      
      // Refresh to get accurate data (WebSocket will update in real-time)
      setTimeout(() => fetchContent(), 1000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to add content';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFAQ = async (values: any) => {
    setSubmitting(true);
    try {
      // Check for duplicate questions
      const questions = values.faqs.map((faq: any) => faq.question.toLowerCase().trim());
      const uniqueQuestions = new Set(questions);
      if (questions.length !== uniqueQuestions.size) {
        message.error('Duplicate questions are not allowed');
        setSubmitting(false);
        return;
      }

      const response = await contentApi.addFAQ(values.title, values.faqs);
      const newContent = response.data.data;
      
      // Optimistically add to state immediately
      const optimisticContent = {
        ...newContent,
        _count: { chunks: 0 },
        progressPercentage: 0,
        progressMessage: 'Processing started...',
        progressStage: 'chunking',
      };
      
      setContents((prev) => [optimisticContent, ...prev]);
      setAllContents((prev) => [optimisticContent, ...prev]);
      
      message.success('FAQ bundle added! Processing will start shortly.');
      setModalType(null);
      faqForm.resetFields();
      
      // Refresh to get accurate data (WebSocket will update in real-time)
      setTimeout(() => fetchContent(), 1000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to add FAQs';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await contentApi.delete(id);
      message.success('Content deleted successfully');
      fetchContent();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to delete content');
    }
  };

  const handleRetrain = async (id: string) => {
    try {
      await contentApi.retrain(id);
      message.success('Retraining started');
      fetchContent();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to retrain');
    }
  };

  const getStatusBadge = (record: any) => {
    const status = record.status;
    const progress = record.progressPercentage;

    if (status === 'COMPLETED') {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          COMPLETED
        </Tag>
      );
    }

    if (status === 'PROCESSING') {
      const tooltipContent = (
        <div>
          <div>Stage: {record.progressStage || 'Processing'}</div>
          {record.progressMessage && <div>{record.progressMessage}</div>}
          {progress !== undefined && <div>Progress: {progress}%</div>}
        </div>
      );

      return (
        <Tooltip title={tooltipContent}>
          <Tag color="processing" icon={<SyncOutlined spin />}>
            PROCESSING {progress !== undefined ? `· ${progress}%` : ''}
          </Tag>
        </Tooltip>
      );
    }

    if (status === 'FAILED') {
      return (
        <Tooltip title={record.errorMessage || 'Processing failed'}>
          <Tag color="error" icon={<CloseCircleOutlined />}>
            FAILED
          </Tag>
        </Tooltip>
      );
    }

    return <Tag>{status}</Tag>;
  };

  const getTypeBadge = (type: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode }> = {
      YOUTUBE_VIDEO: { color: 'red', icon: <YoutubeOutlined /> },
      MANUAL_TEXT: { color: 'blue', icon: <FileTextOutlined /> },
      FAQ: { color: 'purple', icon: <QuestionCircleOutlined /> },
    };

    const cfg = config[type] || { color: 'default', icon: <FileTextOutlined /> };
    return (
      <Tag color={cfg.color} icon={cfg.icon}>
        {type.replace('_', ' ')}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <Button
          type="link"
          onClick={() => navigate(`/creator-dashboard/content/${record.id}`)}
          style={{ padding: 0, color: '#FFFFFF', fontWeight: 600 }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getTypeBadge(type),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_: string, record: any) => getStatusBadge(record),
    },
    {
      title: 'Chunks',
      key: 'chunks',
      render: (r: any) => (
        <Text strong style={{ color: r._count?.chunks > 0 ? '#10B981' : '#94A3B8' }}>
          {r._count?.chunks || 0}
        </Text>
      ),
    },
    {
      title: 'Added',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => new Date(d).toLocaleDateString(),
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (r: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/creator-dashboard/content/${r.id}`)}
            />
          </Tooltip>
          {r.status === 'FAILED' && (
            <Tooltip title="Retry Processing">
              <Button
                icon={<ReloadOutlined />}
                size="small"
                onClick={() => handleRetrain(r.id)}
              >
                Retry
              </Button>
            </Tooltip>
          )}
          <Popconfirm
            title="Delete this content?"
            description="This will permanently delete the content and all associated chunks."
            onConfirm={() => handleDelete(r.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = useMemo(() => {
    return {
      total: allContents.length,
      completed: allContents.filter((c) => c.status === 'COMPLETED').length,
      processing: allContents.filter((c) => c.status === 'PROCESSING').length,
      failed: allContents.filter((c) => c.status === 'FAILED').length,
    };
  }, [allContents]);

  return (
    <div style={{ padding: isMobile ? '8px' : '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          marginBottom: isMobile ? '24px' : '32px',
          gap: '20px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: 900,
              margin: 0,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
            }}
          >
            AI Training Content
          </h1>
          <p
            style={{
              color: '#94A3B8',
              fontSize: isMobile ? '14px' : '18px',
              fontWeight: 500,
              marginTop: '4px',
            }}
          >
            Manage knowledge base for your AI clone
          </p>
        </div>
        <Space size="middle" wrap style={{ width: isMobile ? '100%' : 'auto' }}>
          <Button
            icon={<YoutubeOutlined />}
            onClick={() => setModalType('youtube')}
            style={{ borderRadius: '12px', height: '44px', fontWeight: 600, flex: isMobile ? 1 : 'none' }}
          >
            {isMobile ? 'YouTube' : 'Add YouTube'}
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => setModalType('manual')}
            style={{
              borderRadius: '12px',
              height: '44px',
              fontWeight: 600,
              flex: isMobile ? 1 : 'none',
            }}
          >
            {isMobile ? 'Knowledge' : 'Add Knowledge'}
          </Button>
          <Button
            icon={<QuestionCircleOutlined />}
            onClick={() => setModalType('faq')}
            style={{
              borderRadius: '12px',
              height: '44px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
              flex: isMobile ? 1 : 'none',
            }}
          >
            {isMobile ? 'FAQ' : 'Add FAQ'}
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        {[
          { label: 'Total Items', value: stats.total, icon: <FileTextOutlined />, color: '#6366F1' },
          {
            label: 'AI Ready',
            value: stats.completed,
            icon: <CheckCircleOutlined />,
            color: '#10B981',
          },
          {
            label: 'Processing',
            value: stats.processing,
            icon: <SyncOutlined spin={stats.processing > 0} />,
            color: '#3B82F6',
          },
          {
            label: 'Failed',
            value: stats.failed,
            icon: <CloseCircleOutlined />,
            color: '#EF4444',
          },
        ].map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(20px) saturate(180%)',
                padding: isMobile ? '16px' : '28px',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '12px' : '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: `${stat.color}10`,
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#94A3B8' }}>
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {stat.value}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Filters and Sort */}
      <Card
        style={{
          marginBottom: '24px',
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Space>
              <FilterOutlined style={{ color: '#94A3B8' }} />
              <Text strong style={{ color: '#94A3B8' }}>
                Status:
              </Text>
            </Space>
            <Select
              placeholder="All Statuses"
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%', marginTop: '8px' }}
              options={[
                { label: 'Processing', value: 'PROCESSING' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Failed', value: 'FAILED' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ color: '#94A3B8' }}>
              Type:
            </Text>
            <Select
              placeholder="All Types"
              allowClear
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: '100%', marginTop: '8px' }}
              options={[
                { label: 'YouTube Video', value: 'YOUTUBE_VIDEO' },
                { label: 'Manual Text', value: 'MANUAL_TEXT' },
                { label: 'FAQ', value: 'FAQ' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ color: '#94A3B8' }}>
              Sort:
            </Text>
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%', marginTop: '8px' }}
              options={[
                { label: 'Newest First', value: 'newest' },
                { label: 'Oldest First', value: 'oldest' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            {(statusFilter || typeFilter) && (
              <Button
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setStatusFilter(undefined);
                  setTypeFilter(undefined);
                }}
                style={{ marginTop: '32px' }}
              >
                Clear Filters
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* Content Table */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '28px',
          padding: isMobile ? '16px' : '32px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        <Table
          dataSource={filteredAndSortedContents}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize, total: pagination.total });
            },
          }}
          style={{ borderRadius: '16px', overflow: 'hidden' }}
          className="flagship-table"
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                <div>No content found</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  {statusFilter || typeFilter
                    ? 'Try adjusting your filters'
                    : 'Add your first content to train your AI'}
                </div>
              </div>
            ),
          }}
        />
        <style>{`
          .flagship-table {
            background: transparent !important;
          }
          .flagship-table .ant-table {
            background: transparent !important;
            color: #E2E8F0 !important;
          }
          .flagship-table .ant-table-thead > tr > th {
            background: rgba(255, 255, 255, 0.03) !important;
            color: #94A3B8 !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
            font-weight: 700 !important;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.05em;
          }
          .flagship-table .ant-table-tbody > tr > td {
            border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
            color: #E2E8F0 !important;
            padding: 20px 16px !important;
          }
          .flagship-table .ant-table-tbody > tr:hover > td {
            background: rgba(255, 255, 255, 0.02) !important;
          }
          .ant-pagination-item-link, .ant-pagination-item {
            background: rgba(255, 255, 255, 0.05) !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
          }
          .ant-pagination-item a {
            color: #94A3B8 !important;
          }
          .ant-pagination-item-active {
            border-color: #6366F1 !important;
            background: rgba(99, 102, 241, 0.1) !important;
          }
          .ant-pagination-item-active a {
            color: #818CF8 !important;
          }
          .ant-select-selector {
            background: rgba(255, 255, 255, 0.05) !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
            color: #FFFFFF !important;
          }
          .ant-select-selection-placeholder {
            color: #64748B !important;
          }
        `}</style>
      </div>

      {/* YouTube Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <YoutubeOutlined style={{ color: '#EF4444' }} />
            <span>Add YouTube Video</span>
          </div>
        }
        open={modalType === 'youtube'}
        onCancel={() => {
          setModalType(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAddYouTube}>
          <Form.Item
            name="url"
            label="YouTube URL"
            rules={[
              { required: true, message: 'Please enter the YouTube URL' },
              { validator: validateYouTubeUrl },
            ]}
            help="Supported formats: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/..."
          >
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              size="large"
              prefix={<YoutubeOutlined style={{ color: '#EF4444' }} />}
            />
          </Form.Item>
          <Form.Item
            name="title"
            label="Custom Title (Optional)"
            rules={[
              { max: 200, message: 'Title must be less than 200 characters' },
            ]}
          >
            <Input
              placeholder="Leave empty to use video title"
              size="large"
              showCount
              maxLength={200}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block size="large">
            Add Video
          </Button>
        </Form>
      </Modal>

      {/* Manual Text Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileTextOutlined style={{ color: colors.primary.solid }} />
            <span>Add Manual Content</span>
          </div>
        }
        open={modalType === 'manual'}
        onCancel={() => {
          setModalType(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleAddManual}>
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: 'Please enter a title' },
              { min: 5, message: 'Title must be at least 5 characters' },
              { max: 200, message: 'Title must be less than 200 characters' },
            ]}
          >
            <Input
              placeholder="E.g., My fitness philosophy"
              size="large"
              showCount
              maxLength={200}
            />
          </Form.Item>
          <Form.Item
            name="text"
            label="Content"
            rules={[
              { required: true, message: 'Please enter content' },
              { min: 100, message: 'Content must be at least 100 characters' },
              { max: 50000, message: 'Content must be less than 50,000 characters' },
              {
                validator: (_: any, value: string) => {
                  if (!value) return Promise.resolve();
                  const wordCount = countWords(value);
                  if (wordCount < 20) {
                    return Promise.reject(new Error('Content must contain at least 20 words'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            help={
              <div>
                <div>Minimum: 100 characters, 20 words</div>
                <div>Maximum: 50,000 characters</div>
              </div>
            }
          >
            <TextArea
              rows={10}
              placeholder="Enter your knowledge, FAQs, advice, or any content you want your AI to learn..."
              showCount
              maxLength={50000}
            />
          </Form.Item>
          <Form.Item shouldUpdate>
            {({ getFieldValue }) => {
              const text = getFieldValue('text') || '';
              const wordCount = countWords(text);
              return (
                <div style={{ marginBottom: '16px', color: '#94A3B8', fontSize: '12px' }}>
                  Word count: {wordCount} / 20 minimum
                </div>
              );
            }}
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block size="large">
            Add Content
          </Button>
        </Form>
      </Modal>

      {/* FAQ Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QuestionCircleOutlined style={{ color: colors.primary.solid }} />
            <span>Add FAQ Bundle</span>
          </div>
        }
        open={modalType === 'faq'}
        onCancel={() => {
          setModalType(null);
          faqForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={faqForm} layout="vertical" onFinish={handleAddFAQ}>
          <Form.Item
            name="title"
            label="FAQ Bundle Title"
            rules={[
              { required: true, message: 'Please enter a title' },
              { min: 5, message: 'Title must be at least 5 characters' },
              { max: 200, message: 'Title must be less than 200 characters' },
            ]}
          >
            <Input placeholder="E.g., General FAQs" size="large" showCount maxLength={200} />
          </Form.Item>
          <Form.List
            name="faqs"
            rules={[
              {
                validator: async (_, faqs) => {
                  if (!faqs || faqs.length < 3) {
                    return Promise.reject(new Error('At least 3 FAQ pairs are required'));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => (
                  <Card
                    key={field.key}
                    size="small"
                    style={{
                      marginBottom: 16,
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                    title={`FAQ ${index + 1}`}
                    extra={
                      fields.length > 3 ? (
                        <Button
                          type="link"
                          danger
                          onClick={() => remove(field.name)}
                          size="small"
                        >
                          Remove
                        </Button>
                      ) : null
                    }
                  >
                    <Form.Item
                      {...field}
                      name={[field.name, 'question']}
                      label="Question"
                      rules={[
                        { required: true, message: 'Please enter the question' },
                        { min: 10, message: 'Question must be at least 10 characters' },
                        { max: 500, message: 'Question must be less than 500 characters' },
                      ]}
                    >
                      <Input
                        placeholder="What do you help people with?"
                        showCount
                        maxLength={500}
                      />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'answer']}
                      label="Answer"
                      rules={[
                        { required: true, message: 'Please enter the answer' },
                        { min: 20, message: 'Answer must be at least 20 characters' },
                        { max: 2000, message: 'Answer must be less than 2000 characters' },
                      ]}
                    >
                      <TextArea
                        rows={4}
                        placeholder="Describe your answer in detail..."
                        showCount
                        maxLength={2000}
                      />
                    </Form.Item>
                  </Card>
                ))}
                <Form.ErrorList errors={errors} />
                <Button
                  icon={<PlusCircleOutlined />}
                  type="dashed"
                  onClick={() => add()}
                  block
                  style={{ marginBottom: 16 }}
                >
                  Add Another FAQ
                </Button>
                <Alert
                  message={`Minimum 3 FAQ pairs required. Currently: ${fields.length}`}
                  type={fields.length >= 3 ? 'success' : 'warning'}
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              </>
            )}
          </Form.List>
          <Button type="primary" htmlType="submit" loading={submitting} block size="large">
            Add FAQ Bundle
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default CreatorContent;
