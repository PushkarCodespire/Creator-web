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
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ClockCircleOutlined,
  EditOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  HistoryOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { adminApi } from '../../services/api';

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
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Moderation Logs" size="small">
            {history?.moderationLogs?.length > 0 ? (
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                <ul style={{ paddingLeft: 20 }}>
                  {history.moderationLogs.map((log: any) => (
                    <li key={log.id} style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 600, color: log.action.includes('BAN') ? 'red' : 'blue' }}>
                        {log.action.replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {new Date(log.createdAt).toLocaleString()} by {log.moderator?.name || 'AI System'}
                      </div>
                      {log.reason && <div style={{ fontSize: '13px', fontStyle: 'italic' }}>"{log.reason}"</div>}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>No moderation logs found</div>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Reports Against Creator" size="small">
            {history?.reportsAgainst?.length > 0 ? (
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {history.reportsAgainst.map((report: any) => (
                  <div key={report.id} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600 }}>{report.reason}</span>
                      <Tag color={report.status === 'RESOLVED' ? 'green' : 'gold'}>{report.status}</Tag>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {new Date(report.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>No reports found</div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderOverview = () => (
    <div style={{ paddingTop: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card size="small" className="admin-card-light">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Total Contents"
                  value={analytics?.contentCount || 0}
                  prefix={<PlayCircleOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Conversations"
                  value={analytics?.conversationCount || 0}
                  prefix={<MailOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Messages"
                  value={analytics?.messageCount || 0}
                  prefix={<SafetyCertificateOutlined />}
                />
              </Col>
            </Row>
          </Card>
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
                  label="Display Name"
                  rules={[{ required: true }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="tagline" label="Tagline">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="bio" label="Bio">
                  <TextArea rows={3} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="tags" label="Tags">
                  <Select mode="tags" placeholder="Add tags" />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="youtubeUrl" label="YouTube URL">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="instagramUrl" label="Instagram URL">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="twitterUrl" label="Twitter URL">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="websiteUrl" label="Website URL">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="isVerified"
                  label="Verified"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Verified" unCheckedChildren="Unverified" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label="Active"
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
              <Space>
                <Button
                  icon={<CheckCircleOutlined />}
                  type="default"
                  onClick={handleVerify}
                  disabled={creator?.isVerified}
                >
                  Verify Creator
                </Button>
                <Button
                  icon={creator?.isActive ? <StopOutlined /> : <ClockCircleOutlined />}
                  onClick={handleToggleActive}
                >
                  {creator?.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  danger
                  icon={<StopOutlined />}
                  onClick={() => {
                    rejectForm.resetFields();
                    setRejectModalVisible(true);
                  }}
                  disabled={creator?.isVerified}
                >
                  Reject Application
                </Button>
              </Space>

              <Button
                type="primary"
                htmlType="submit"
                icon={<EditOutlined />}
                loading={loading}
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
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => openStatusModal(record)}
          >
            Update Status
          </Button>
          <Popconfirm
            title="Delete this content?"
            onConfirm={() => handleDeleteContent(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
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
      <Modal
        title={
          <Space>
            <UserOutlined />
            <span>
              Creator Details: {creator?.displayName || creator?.user?.name || 'Loading...'}
            </span>
            {creator?.isVerified ? (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                VERIFIED
              </Tag>
            ) : (
              <Tag>UNVERIFIED</Tag>
            )}
            {creator?.isActive ? (
              <Tag color="green">ACTIVE</Tag>
            ) : (
              <Tag color="red">INACTIVE</Tag>
            )}
          </Space>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        className="admin-modal"
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
                  <span>
                    <UserOutlined />
                    Overview
                  </span>
                ),
                children: renderOverview(),
              },
              {
                key: 'content',
                label: (
                  <span>
                    <PlayCircleOutlined />
                    Content
                  </span>
                ),
                children: renderContentModeration(),
              },
              {
                key: 'history',
                label: (
                  <span>
                    <HistoryOutlined />
                    Moderation Logs
                  </span>
                ),
                children: renderHistory(),
              },
            ]}
          />
        )}
      </Modal>

      {/* Content status update modal */}
      <Modal
        title="Update Content Status"
        open={contentStatusModalVisible}
        onCancel={() => setContentStatusModalVisible(false)}
        onOk={() => statusForm.submit()}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form
          form={statusForm}
          layout="vertical"
          onFinish={handleUpdateContentStatus}
        >
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select>
              <Select.Option value="PENDING">Pending</Select.Option>
              <Select.Option value="PROCESSING">Processing</Select.Option>
              <Select.Option value="COMPLETED">Completed</Select.Option>
              <Select.Option value="FAILED">Failed</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="errorMessage"
            label="Error Message (for failed status)"
          >
            <TextArea rows={3} placeholder="Reason if marking as FAILED (optional for other statuses)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject creator modal */}
      <Modal
        title={`Reject Creator: ${creator?.displayName || creator?.user?.name || ''}`}
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={() => rejectForm.submit()}
        confirmLoading={loading}
        okButtonProps={{ danger: true }}
        okText="Reject Application"
        destroyOnClose
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleReject}
        >
          <Form.Item
            name="reason"
            label="Rejection Reason"
            rules={[{ required: true, message: 'Please provide a reason' }]}
          >
            <TextArea rows={4} placeholder="Explain why this creator application is being rejected..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreatorDetailModal;

