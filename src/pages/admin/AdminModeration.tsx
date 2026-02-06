// ===========================================
// ADMIN MODERATION PAGE
// ===========================================

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Select,
  Modal,
  Form,
  Input,
  Radio,
  InputNumber,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  message,
  Descriptions,
  Timeline,
  Tooltip
} from 'antd';
import {
  WarningOutlined,
  StopOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { adminApi } from '../../services/api';
import { format } from 'date-fns';
import '../../styles/AdminPanel.css';

const { Text } = Typography;
const { TextArea } = Input;

interface Report {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  description?: string;
  status: string;
  priority: string;
  createdAt: string;
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ReportDetails {
  report: Report;
  targetContext: any;
  moderationHistory: any[];
}

interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedToday: number;
  bannedUsers: number;
  suspendedUsers: number;
  reportsByReason: any[];
  actionsTaken: any[];
}

const AdminModeration = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportDetails | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [actionForm] = Form.useForm();

  useEffect(() => {
    loadReports();
    loadStats();
  }, [statusFilter, priorityFilter, typeFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (typeFilter) params.targetType = typeFilter;

      const response = await adminApi.getReports(params);
      setReports(response.data.data.reports || []);
    } catch (error: any) {
      message.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminApi.getModerationStats();
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Failed to load stats');
    }
  };

  const loadReportDetails = async (reportId: string) => {
    try {
      setLoading(true);
      const response = await adminApi.getReportDetails(reportId);
      setSelectedReport(response.data.data);
      setIsModalVisible(true);
    } catch (error: any) {
      message.error('Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (values: any) => {
    if (!selectedReport) return;

    try {
      setLoading(true);
      await adminApi.resolveReport(selectedReport.report.id, values);
      message.success('Report resolved successfully');
      setIsModalVisible(false);
      actionForm.resetFields();
      loadReports();
      loadStats();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to resolve report');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (!selectedReport) return;

    try {
      setLoading(true);
      await adminApi.dismissReport(selectedReport.report.id, { reason: 'No violation found' });
      message.success('Report dismissed');
      setIsModalVisible(false);
      loadReports();
      loadStats();
    } catch (error: any) {
      message.error('Failed to dismiss report');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityTag = (priority: string) => {
    const config: Record<string, { color: string }> = {
      LOW: { color: 'default' },
      MEDIUM: { color: 'blue' },
      HIGH: { color: 'orange' },
      URGENT: { color: 'red' }
    };
    return <Tag color={config[priority]?.color || 'default'} style={{ borderRadius: '4px' }}>{priority}</Tag>;
  };

  const getReasonTag = (reason: string) => {
    const colors: Record<string, string> = {
      SPAM: 'default',
      HARASSMENT: 'orange',
      HATE_SPEECH: 'red',
      SEXUAL_CONTENT: 'red',
      VIOLENCE: 'red',
      MISINFORMATION: 'orange',
      IMPERSONATION: 'purple',
      SCAM: 'orange',
      COPYRIGHT: 'blue',
      OTHER: 'default'
    };
    return <Tag color={colors[reason] || 'default'} style={{ borderRadius: '4px' }}>{reason.replace('_', ' ')}</Tag>;
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => <div style={{ color: '#475569', fontWeight: 500 }}>{format(new Date(date), 'MMM dd, HH:mm')}</div>
    },
    {
      title: 'Type',
      dataIndex: 'targetType',
      key: 'targetType',
      width: 100,
      render: (type: string) => <Tag style={{ borderRadius: '4px' }}>{type}</Tag>
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      render: (reason: string) => getReasonTag(reason)
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => getPriorityTag(priority)
    },
    {
      title: 'Reporter',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 150,
      render: (reporter: any) => <div style={{ fontWeight: 500, color: '#1f2a44' }}>{reporter ? reporter.name : 'Anonymous'}</div>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => <Text style={{ color: '#475569' }}>{desc || '-'}</Text>
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (record: Report) => (
        <Tooltip title="Review Report">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => loadReportDetails(record.id)}
          >
            Review
          </Button>
        </Tooltip>
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div>
          <h2 className="admin-hero-title">Reports & Moderation</h2>
          <p className="admin-hero-subtitle">Review user reports and manage content violations.</p>
        </div>
        <Tag className="admin-pill">Moderation Queue</Tag>
      </div>

      {/* Statistics */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card className="admin-card">
              <Statistic
                title="Pending Reports"
                value={stats.pendingReports}
                valueStyle={{ color: '#faad14', fontWeight: 700 }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="admin-card">
              <Statistic
                title="Resolved Today"
                value={stats.resolvedToday}
                valueStyle={{ color: '#52c41a', fontWeight: 700 }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="admin-card">
              <Statistic
                title="Suspended Users"
                value={stats.suspendedUsers}
                valueStyle={{ color: '#ff4d4f', fontWeight: 700 }}
                prefix={<StopOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="admin-card">
              <Statistic
                title="Banned Users"
                value={stats.bannedUsers}
                valueStyle={{ color: '#1E293B', fontWeight: 700 }}
                prefix={<DeleteOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-hero-subtitle">Showing {reports.length} reports</div>
        <Space wrap>
          <Select
            style={{ width: 150 }}
            placeholder="All Status"
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Select.Option value="">All Status</Select.Option>
            <Select.Option value="PENDING">Pending</Select.Option>
            <Select.Option value="IN_REVIEW">In Review</Select.Option>
            <Select.Option value="RESOLVED">Resolved</Select.Option>
            <Select.Option value="DISMISSED">Dismissed</Select.Option>
          </Select>

          <Select
            style={{ width: 150 }}
            placeholder="All Priorities"
            value={priorityFilter}
            onChange={setPriorityFilter}
            allowClear
          >
            <Select.Option value="">All Priorities</Select.Option>
            <Select.Option value="LOW">Low</Select.Option>
            <Select.Option value="MEDIUM">Medium</Select.Option>
            <Select.Option value="HIGH">High</Select.Option>
            <Select.Option value="URGENT">Urgent</Select.Option>
          </Select>

          <Select
            style={{ width: 150 }}
            placeholder="All Types"
            value={typeFilter}
            onChange={setTypeFilter}
            allowClear
          >
            <Select.Option value="">All Types</Select.Option>
            <Select.Option value="MESSAGE">Message</Select.Option>
            <Select.Option value="USER">User</Select.Option>
            <Select.Option value="CREATOR">Creator</Select.Option>
            <Select.Option value="CONVERSATION">Conversation</Select.Option>
          </Select>

          <Button
            className="admin-cta-secondary"
            icon={<ReloadOutlined />}
            onClick={loadReports}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Reports Table */}
      <Card className="admin-card admin-table">
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showTotal: (total) => `Total ${total} reports`
          }}
          locale={{ emptyText: 'No reports found' }}
        />
      </Card>

      {/* Report Details Modal */}
      <Modal
        title="Report Details"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          actionForm.resetFields();
        }}
        width={900}
        footer={null}
      >
        {selectedReport && (
          <div>
            {/* Report Info */}
            <Descriptions bordered column={2} size="small" style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="Type">{selectedReport.report.targetType}</Descriptions.Item>
              <Descriptions.Item label="Reason">{getReasonTag(selectedReport.report.reason)}</Descriptions.Item>
              <Descriptions.Item label="Priority">{getPriorityTag(selectedReport.report.priority)}</Descriptions.Item>
              <Descriptions.Item label="Date">
                {format(new Date(selectedReport.report.createdAt), 'MMM dd, yyyy HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Reporter" span={2}>
                {selectedReport.report.reporter ?
                  `${selectedReport.report.reporter.name} (${selectedReport.report.reporter.email})` :
                  'Anonymous'}
              </Descriptions.Item>
              {selectedReport.report.description && (
                <Descriptions.Item label="Description" span={2}>
                  {selectedReport.report.description}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Target Context */}
            {selectedReport.targetContext && (
              <Card title="Target Content" size="small" style={{ marginBottom: '24px' }}>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                  {JSON.stringify(selectedReport.targetContext, null, 2)}
                </pre>
              </Card>
            )}

            {/* Moderation History */}
            {selectedReport.moderationHistory.length > 0 && (
              <Card title="Moderation History" size="small" style={{ marginBottom: '24px' }}>
                <Timeline>
                  {selectedReport.moderationHistory.map((log: any) => (
                    <Timeline.Item key={log.id} color={log.action.includes('BAN') ? 'red' : 'blue'}>
                      <Text strong>{log.action.replace('_', ' ')}</Text>
                      <br />
                      <Text type="secondary">{log.reason}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        by {log.moderator?.name || 'System'} - {format(new Date(log.createdAt), 'MMM dd, HH:mm')}
                      </Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}

            {/* Action Form */}
            <Form
              form={actionForm}
              layout="vertical"
              onFinish={handleResolve}
            >
              <Form.Item
                label="Action"
                name="action"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="NO_ACTION">No Action</Radio>
                    <Radio value="WARNING_SENT">Send Warning</Radio>
                    <Radio value="CONTENT_HIDDEN">Hide Content</Radio>
                    <Radio value="USER_SUSPENDED">Suspend User</Radio>
                    <Radio value="USER_BANNED">Ban User</Radio>
                    <Radio value="CREATOR_SUSPENDED">Suspend Creator</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.action !== currentValues.action}
              >
                {({ getFieldValue }) =>
                  getFieldValue('action') === 'USER_SUSPENDED' ? (
                    <Form.Item
                      label="Suspension Days"
                      name="suspensionDays"
                      rules={[{ required: true, message: 'Please enter suspension duration' }]}
                    >
                      <InputNumber min={1} max={365} placeholder="Days" style={{ width: '100%' }} />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>

              <Form.Item
                label="Review Notes"
                name="reviewNotes"
                rules={[{ required: true, message: 'Please provide review notes' }]}
              >
                <TextArea rows={4} placeholder="Explain the reasoning for this action..." />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button type="primary" className="admin-cta" htmlType="submit" loading={loading} style={{ height: '40px', padding: '0 24px' }}>
                    Resolve Report
                  </Button>
                  <Button className="admin-cta-secondary" onClick={handleDismiss} loading={loading} style={{ height: '40px' }}>
                    Dismiss (No Violation)
                  </Button>
                  <Button onClick={() => setIsModalVisible(false)} style={{ borderRadius: '999px', height: '40px' }}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminModeration;
