import React, { useEffect, useState } from 'react';
import {
  Modal,
  Tabs,
  Form,
  Input,
  Select,
  Button,
  Tag,
  Divider,
  Space,
  Statistic,
  Row,
  Col,
  message,
  Spin,
  Card,
  Switch,
  Table,
  Popconfirm,
  Timeline,
  Typography
} from 'antd';
import {
  User,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Ban,
  Clock,
  Edit3,
  PlayCircle,
  Trash2,
  History,
  AlertTriangle,
  ExternalLink,
  Shield,
  Info,
  Youtube,
  Instagram,
  Twitter,
  Globe,
  MoreVertical
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { colors, spacing, shadows, borderRadius, typography } from '../../styles/tokens';
import CustomModal from '../../components/common/Modal/CustomModal';
import CustomCard from '../../components/common/Card/CustomCard';

const { Text, Title, Paragraph } = Typography;

interface CreatorDetailModalProps {
  creatorId: string | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const { TextArea } = Input;

const CreatorDetailModal: React.FC<CreatorDetailModalProps> = ({
  creatorId,
  visible,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [creator, setCreator] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [form] = Form.useForm();

  // Content moderation state
  const [contents, setContents] = useState<any[]>([]);
  const [contentsLoading, setContentsLoading] = useState(false);
  const [contentPagination, setContentPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [contentStatusFilter, setContentStatusFilter] = useState<string | undefined>(undefined);

  // Content status modal
  const [contentStatusModalVisible, setContentStatusModalVisible] = useState(false);
  const [statusForm] = Form.useForm();
  const [activeContentId, setActiveContentId] = useState<string | null>(null);

  // Reject creator modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectForm] = Form.useForm();

  useEffect(() => {
    if (visible && creatorId) {
      fetchData();
      fetchContents(1);
    } else {
      setCreator(null);
      setAnalytics(null);
      setContents([]);
      setActiveTab('overview');
      form.resetFields();
      statusForm.resetFields();
      rejectForm.resetFields();
      setContentStatusFilter(undefined);
      setContentPagination({ current: 1, pageSize: 10, total: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, creatorId]);

  const fetchData = async () => {
    if (!creatorId) return;
    try {
      setLoading(true);
      const res = await adminApi.getCreator(creatorId);
      const data = res.data.data;
      setCreator(data.creator);
      setAnalytics(data.analytics);

      if (data.creator?.userId) {
        try {
          const historyRes = await adminApi.getUserModerationHistory(data.creator.userId);
          setHistory(historyRes.data.data);
        } catch (e) { console.error('Failed to load history', e); }
      }

      form.setFieldsValue({
        displayName: data.creator.displayName,
        bio: data.creator.bio,
        tagline: data.creator.tagline,
        category: data.creator.category,
        tags: data.creator.tags || [],
        youtubeUrl: data.creator.youtubeUrl,
        instagramUrl: data.creator.instagramUrl,
        twitterUrl: data.creator.twitterUrl,
        websiteUrl: data.creator.websiteUrl,
        isVerified: data.creator.isVerified,
        isActive: data.creator.isActive,
      });
    } catch (err) {
      message.error('Failed to load creator details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const fetchContents = async (page?: number) => {
    if (!creatorId) return;
    try {
      setContentsLoading(true);
      const res = await adminApi.getCreatorContents(creatorId, {
        page: page || contentPagination.current,
        limit: contentPagination.pageSize,
        status: contentStatusFilter,
      });
      const data = res.data.data;
      setContents(data.contents || []);
      setContentPagination((prev) => ({
        ...prev,
        current: data.pagination?.page || page || 1,
        total: data.pagination?.total || 0,
      }));
    } catch (err) {
      message.error('Failed to load creator content');
    } finally {
      setContentsLoading(false);
    }
  };

  const handleUpdateProfile = async (values: any) => {
    if (!creatorId) return;
    try {
      setLoading(true);
      await adminApi.updateCreator(creatorId, {
        displayName: values.displayName,
        bio: values.bio,
        tagline: values.tagline,
        category: values.category,
        tags: values.tags,
        youtubeUrl: values.youtubeUrl,
        instagramUrl: values.instagramUrl,
        twitterUrl: values.twitterUrl,
        websiteUrl: values.websiteUrl,
        isVerified: values.isVerified,
        isActive: values.isActive,
      });
      message.success('Creator updated successfully');
      await fetchData();
      onSuccess();
      onClose();
    } catch (err) {
      message.error('Failed to update creator');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!creatorId || !creator) return;
    try {
      setLoading(true);
      const nextActive = !creator.isActive;
      await adminApi.setCreatorActive(creatorId, nextActive);
      message.success(`Creator ${nextActive ? 'activated' : 'deactivated'}`);
      await fetchData();
      onSuccess();
    } catch (err) {
      message.error('Failed to update active status');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!creatorId) return;
    try {
      setLoading(true);
      await adminApi.verifyCreator(creatorId);
      message.success('Creator verified');
      await fetchData();
      onSuccess();
      onClose();
    } catch (err) {
      message.error('Failed to verify creator');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (values: any) => {
    if (!creatorId) return;
    try {
      setLoading(true);
      await adminApi.rejectCreator(creatorId, { reason: values.reason });
      message.success('Creator application rejected');
      setRejectModalVisible(false);
      rejectForm.resetFields();
      await fetchData();
      onSuccess();
      onClose();
    } catch (err) {
      message.error('Failed to reject creator');
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (content: any) => {
    setActiveContentId(content.id);
    statusForm.setFieldsValue({
      status: content.status,
      errorMessage: content.errorMessage || '',
    });
    setContentStatusModalVisible(true);
  };

  const handleUpdateContentStatus = async (values: any) => {
    if (!activeContentId) return;
    try {
      setLoading(true);
      await adminApi.updateContentStatus(activeContentId, {
        status: values.status,
        errorMessage: values.errorMessage || undefined,
      });
      message.success('Content status updated');
      setContentStatusModalVisible(false);
      statusForm.resetFields();
      await fetchContents();
    } catch (err) {
      message.error('Failed to update content status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      setLoading(true);
      await adminApi.deleteContent(contentId);
      message.success('Content deleted');
      await fetchContents();
    } catch (err) {
      message.error('Failed to delete content');
    } finally {
      setLoading(false);
    }
  };

  const renderHistory = () => (
    <div style={{ paddingTop: '16px' }}>
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <CustomCard
            title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><History size={16} /> Audit Trail</div>}
            size="small"
            style={{ borderRadius: '12px', border: `1px solid ${colors.gray[100]}` }}
            headStyle={{ background: colors.gray[50] }}
          >
            {history?.moderationLogs?.length > 0 ? (
              <div style={{ maxHeight: 400, overflowY: 'auto', padding: '8px' }}>
                <Timeline style={{ marginTop: '16px' }}>
                  {history.moderationLogs.map((log: any) => (
                    <Timeline.Item key={log.id} color={log.action.includes('BAN') ? colors.error.solid : colors.primary.solid}>
                      <div style={{ fontWeight: 700, color: colors.text.primary, fontSize: '13px' }}>
                        {log.action.replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: '11px', color: colors.text.tertiary, fontWeight: 600, marginTop: '2px' }}>
                        {new Date(log.createdAt).toLocaleString()} • {log.moderator?.name || 'AI System'}
                      </div>
                      {log.reason && <div style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '6px', borderLeft: `2px solid ${colors.gray[100]}`, paddingLeft: '8px' }}>{log.reason}</div>}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: colors.text.tertiary, padding: 32 }}>
                <Info size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
                <br />No moderation logs found
              </div>
            )}
          </CustomCard>
        </Col>
        <Col span={12}>
          <CustomCard
            title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={16} /> Incident Reports</div>}
            size="small"
            style={{ borderRadius: '12px', border: `1px solid ${colors.gray[100]}` }}
            headStyle={{ background: colors.gray[50] }}
          >
            {history?.reportsAgainst?.length > 0 ? (
              <div style={{ maxHeight: 400, overflowY: 'auto', padding: '8px' }}>
                {history.reportsAgainst.map((report: any) => (
                  <div key={report.id} style={{ marginBottom: 16, borderBottom: `1px solid ${colors.gray[50]}`, paddingBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <Text strong style={{ color: colors.text.primary, fontSize: '13px' }}>{report.reason}</Text>
                      <Tag color={report.status === 'RESOLVED' ? 'success' : 'warning'} style={{ borderRadius: '4px', fontWeight: 600, fontSize: '10px' }}>{report.status}</Tag>
                    </div>
                    <div style={{ fontSize: '11px', color: colors.text.tertiary, fontWeight: 500 }}>
                      <Clock size={10} style={{ marginRight: '4px' }} /> {new Date(report.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: colors.text.tertiary, padding: 32 }}>
                <CheckCircle2 size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
                <br />No reports found against this creator
              </div>
            )}
          </CustomCard>
        </Col>
      </Row>
    </div>
  );

  const renderOverview = () => (
    <div style={{ paddingTop: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <CustomCard style={{ background: '#f8fafc', border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title={<Text style={{ fontSize: '11px', fontWeight: 700, color: colors.text.tertiary }}>TOTAL CONTENTS</Text>}
                  value={analytics?.contentCount || 0}
                  prefix={<PlayCircle size={18} color={colors.primary.solid} style={{ marginRight: '8px' }} />}
                  valueStyle={{ color: colors.text.primary, fontWeight: 800 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={<Text style={{ fontSize: '11px', fontWeight: 700, color: colors.text.tertiary }}>CONVERSATIONS</Text>}
                  value={analytics?.conversationCount || 0}
                  prefix={<Mail size={18} color={colors.primary.solid} style={{ marginRight: '8px' }} />}
                  valueStyle={{ color: colors.text.primary, fontWeight: 800 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={<Text style={{ fontSize: '11px', fontWeight: 700, color: colors.text.tertiary }}>TOTAL MESSAGES</Text>}
                  value={analytics?.messageCount || 0}
                  prefix={<ShieldCheck size={18} color={colors.success.solid} style={{ marginRight: '8px' }} />}
                  valueStyle={{ color: colors.text.primary, fontWeight: 800 }}
                />
              </Col>
            </Row>
          </CustomCard>
        </Col>

        <Col span={24}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateProfile}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="displayName"
                  label={<span style={{ fontWeight: 600, color: colors.text.secondary }}>Display Name</span>}
                  rules={[{ required: true }]}
                >
                  <Input prefix={<User size={16} style={{ color: colors.primary.solid }} />} style={{ height: '44px', borderRadius: '10px', color: colors.text.primary, fontWeight: 600 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label={<span style={{ fontWeight: 600, color: colors.text.secondary }}>Category</span>}
                  rules={[{ required: true }]}
                >
                  <Input style={{ height: '44px', borderRadius: '10px', color: colors.text.primary, fontWeight: 600 }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="tagline" label={<span style={{ fontWeight: 600, color: colors.text.secondary }}>Tagline</span>}>
                  <Input style={{ height: '44px', borderRadius: '10px', color: colors.text.primary, fontWeight: 600 }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="bio" label={<span style={{ fontWeight: 600, color: colors.text.secondary }}>Biography</span>}>
                  <TextArea rows={3} style={{ borderRadius: '12px', color: colors.text.primary, fontWeight: 500, padding: '12px' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="tags" label={<span style={{ fontWeight: 600, color: colors.text.secondary }}>Search Tags</span>}>
                  <Select mode="tags" placeholder="Add tags" style={{ borderRadius: '10px' }} />
                </Form.Item>
              </Col>
            </Row>

            <Divider style={{ margin: '24px 0' }} />

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="youtubeUrl" label={<span style={{ fontWeight: 600, color: colors.text.secondary }}>YouTube Channel URL</span>}>
                  <Input prefix={<Youtube size={16} color="#FF0000" />} style={{ height: '44px', borderRadius: '10px', color: colors.text.primary }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="instagramUrl" label={<span style={{ fontWeight: 600, color: colors.text.secondary }}>Instagram Profile</span>}>
                  <Input prefix={<Instagram size={16} color="#E4405F" />} style={{ height: '44px', borderRadius: '10px', color: colors.text.primary }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="twitterUrl" label={<span style={{ fontWeight: 600, color: colors.text.secondary }}>X / Twitter handle</span>}>
                  <Input prefix={<Twitter size={16} color="#1DA1F2" />} style={{ height: '44px', borderRadius: '10px', color: colors.text.primary }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="websiteUrl" label={<span style={{ fontWeight: 600, color: colors.text.secondary }}>Official Website</span>}>
                  <Input prefix={<Globe size={16} color={colors.primary.solid} />} style={{ height: '44px', borderRadius: '10px', color: colors.text.primary }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="isVerified"
                  label={<span style={{ fontWeight: 600, color: colors.text.secondary }}>Identity Verified</span>}
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Verified" unCheckedChildren="Unverified" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label={<span style={{ fontWeight: 600, color: colors.text.secondary }}>Account Status</span>}
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Space size="middle">
                <Button
                  icon={<CheckCircle2 size={16} />}
                  type="default"
                  onClick={handleVerify}
                  disabled={creator?.isVerified}
                  style={{ borderRadius: '8px', height: '40px', fontWeight: 600 }}
                >
                  Verify Creator
                </Button>
                <Button
                  icon={creator?.isActive ? <Ban size={16} /> : <Clock size={16} />}
                  onClick={handleToggleActive}
                  style={{ borderRadius: '8px', height: '40px', fontWeight: 600 }}
                >
                  {creator?.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Popconfirm title="Reject this application?" onConfirm={() => {
                  rejectForm.resetFields();
                  setRejectModalVisible(true);
                }}>
                  <Button
                    danger
                    icon={<Trash2 size={16} />}
                    disabled={creator?.isVerified}
                    style={{ borderRadius: '8px', height: '40px', fontWeight: 600 }}
                  >
                    Reject Application
                  </Button>
                </Popconfirm>
              </Space>

              <Button
                type="primary"
                htmlType="submit"
                icon={<Edit3 size={16} />}
                loading={loading}
                style={{
                  height: '42px',
                  padding: '0 24px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  background: colors.primary.gradient,
                  border: 'none',
                  boxShadow: shadows.md
                }}
              >
                Update Profile
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </div>
  );

  const contentColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <span style={{ fontWeight: 500 }}>{title}</span>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue" style={{ borderRadius: 4 }}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color: 'processing' | 'success' | 'error' | 'warning' | 'default' = 'default';
        if (status === 'COMPLETED') color = 'success';
        else if (status === 'FAILED') color = 'error';
        else if (status === 'PROCESSING') color = 'processing';
        else if (status === 'PENDING') color = 'warning';

        return (
          <Tag color={color} style={{ borderRadius: 4 }}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => (d ? new Date(d).toLocaleString() : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button
            size="middle"
            icon={<Edit3 size={14} />}
            onClick={() => openStatusModal(record)}
            style={{ borderRadius: '6px' }}
          >
            Update
          </Button>
          <Popconfirm
            title="Delete this content material?"
            onConfirm={() => handleDeleteContent(record.id)}
          >
            <Button size="middle" danger icon={<Trash2 size={14} />} style={{ borderRadius: '6px' }}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderContentModeration = () => (
    <div style={{ paddingTop: 16 }}>
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Filter by status"
          allowClear
          style={{ width: 200 }}
          value={contentStatusFilter}
          onChange={(val) => {
            setContentStatusFilter(val);
            setContentPagination((prev) => ({ ...prev, current: 1 }));
            fetchContents(1);
          }}
        >
          <Select.Option value="PENDING">Pending</Select.Option>
          <Select.Option value="PROCESSING">Processing</Select.Option>
          <Select.Option value="COMPLETED">Completed</Select.Option>
          <Select.Option value="FAILED">Failed</Select.Option>
        </Select>
      </Space>

      <Card size="small">
        <Table
          dataSource={contents}
          columns={contentColumns}
          rowKey="id"
          loading={contentsLoading}
          pagination={{
            current: contentPagination.current,
            pageSize: contentPagination.pageSize,
            total: contentPagination.total,
            showSizeChanger: false,
            onChange: (page) => {
              setContentPagination((prev) => ({ ...prev, current: page }));
              fetchContents(page);
            },
          }}
        />
      </Card>
    </div>
  );

  return (
    <>
      <CustomModal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
            <div style={{ padding: '8px', background: colors.primary.subtle, borderRadius: '10px', display: 'flex' }}>
              <User size={20} color={colors.primary.solid} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: colors.text.primary }}>
                {creator?.displayName || creator?.user?.name || 'Loading creator...'}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {creator?.isVerified ? (
                  <Tag color="success" icon={<CheckCircle2 size={10} />} style={{ margin: 0, borderRadius: '4px', fontWeight: 700, fontSize: '10px' }}>
                    VERIFIED
                  </Tag>
                ) : (
                  <Tag style={{ margin: 0, borderRadius: '4px', fontWeight: 700, fontSize: '10px' }}>UNVERIFIED</Tag>
                )}
                {creator?.isActive ? (
                  <Tag color="success" style={{ margin: 0, borderRadius: '4px', fontWeight: 700, fontSize: '10px' }}>ACTIVE</Tag>
                ) : (
                  <Tag color="error" style={{ margin: 0, borderRadius: '4px', fontWeight: 700, fontSize: '10px' }}>INACTIVE</Tag>
                )}
              </div>
            </div>
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width={900}
      >
        {loading && !creator ? (
          <div style={{ textAlign: 'center', padding: 100 }}>
            <Spin size="large" tip="Loading creator data..." />
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'overview',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} />
                    Overview
                  </span>
                ),
                children: renderOverview(),
              },
              {
                key: 'content',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PlayCircle size={16} />
                    Content Portfolio
                  </span>
                ),
                children: renderContentModeration(),
              },
              {
                key: 'history',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <History size={16} />
                    Compliance Logs
                  </span>
                ),
                children: renderHistory(),
              },
            ]}
          />
        )}
      </CustomModal>

      {/* Content status update modal */}
      <CustomModal
        title="Update Pipeline Status"
        icon={<Edit3 size={18} />}
        open={contentStatusModalVisible}
        onCancel={() => setContentStatusModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setContentStatusModalVisible(false)} style={{ borderRadius: '8px' }}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={() => statusForm.submit()} loading={loading} style={{ borderRadius: '8px', background: colors.primary.gradient, border: 'none' }}>Update Status</Button>
        ]}
        width={500}
      >
        <div style={{ padding: '8px' }}>
          <Form
            form={statusForm}
            layout="vertical"
            onFinish={handleUpdateContentStatus}
          >
            <Form.Item
              name="status"
              label={<span style={{ fontWeight: 600, color: colors.text.secondary }}>Pipeline Stage</span>}
              rules={[{ required: true, message: 'Please select a status' }]}
            >
              <Select style={{ height: '40px', borderRadius: '8px' }}>
                <Select.Option value="PENDING">Pending Approval</Select.Option>
                <Select.Option value="PROCESSING">Currently Processing</Select.Option>
                <Select.Option value="COMPLETED">Successfully Ingested</Select.Option>
                <Select.Option value="FAILED">Processing Failed</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="errorMessage"
              label={<span style={{ fontWeight: 600, color: colors.text.secondary }}>Status Notes / Error Message</span>}
            >
              <TextArea rows={3} placeholder="Provide additional context or error details..." style={{ borderRadius: '10px' }} />
            </Form.Item>
          </Form>
        </div>
      </CustomModal>

      {/* Reject creator modal */}
      <CustomModal
        title="Application Rejection"
        icon={<Ban size={18} color={colors.error.solid} />}
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setRejectModalVisible(false)} style={{ borderRadius: '8px' }}>Withdraw</Button>,
          <Button key="submit" type="primary" danger onClick={() => rejectForm.submit()} loading={loading} style={{ borderRadius: '8px' }}>Confirm Rejection</Button>
        ]}
        width={500}
      >
        <div style={{ padding: '8px' }}>
          <div style={{ marginBottom: '20px', color: colors.text.secondary }}>
            Rejecting application for <Text strong style={{ color: colors.text.primary }}>{creator?.displayName || creator?.user?.name}</Text>. This will notify the user.
          </div>
          <Form
            form={rejectForm}
            layout="vertical"
            onFinish={handleReject}
          >
            <Form.Item
              name="reason"
              label={<span style={{ fontWeight: 600, color: colors.text.secondary }}>Rational for Rejection</span>}
              rules={[{ required: true, message: 'Please provide a reason' }]}
            >
              <TextArea rows={4} placeholder="Explain why this creator application is being rejected..." style={{ borderRadius: '12px' }} />
            </Form.Item>
          </Form>
        </div>
      </CustomModal>
    </>
  );
};

export default CreatorDetailModal;

