// ===========================================
// ADMIN MODERATION PAGE
// ===========================================

import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Select, Form, Input, Radio, InputNumber, Space, Typography, Row, Col, Statistic, message, Descriptions, Timeline, Tooltip, Divider } from 'antd';
import { Shield, Ban, CheckCircle2, Clock, RotateCw, Eye, Info } from 'lucide-react';
import { adminApi } from '../../services/api';
import { format } from 'date-fns';
import { colors, spacing, shadows } from '../../styles/tokens';
import CustomModal from '../../components/common/Modal/CustomModal';
import CustomButton from '../../components/common/Button/CustomButton';
import '../../styles/AdminPanel.css';
import { logger } from '../../utils/logger';

const { Text, Title, Paragraph } = Typography;
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
  targetContext: Record<string, unknown>;
  moderationHistory: { id: string; action: string; reason?: string; moderator?: { name: string }; createdAt: string }[];
}

interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedToday: number;
  bannedUsers: number;
  suspendedUsers: number;
  reportsByReason: { reason: string; count: number }[];
  actionsTaken: { action: string; count: number }[];
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
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (typeFilter) params.targetType = typeFilter;

      const response = await adminApi.getReports(params);
      setReports(response.data.data.reports || []);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
      message.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminApi.getModerationStats();
      setStats(response.data.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
      logger.error('Failed to load stats');
    }
  };

  const loadReportDetails = async (reportId: string) => {
    try {
      setLoading(true);
      const response = await adminApi.getReportDetails(reportId);
      setSelectedReport(response.data.data);
      setIsModalVisible(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
      message.error('Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (values: Record<string, unknown>) => {
    if (!selectedReport) return;

    try {
      setLoading(true);
      await adminApi.resolveReport(selectedReport.report.id, values as unknown as { action: string; reviewNotes: string; suspensionDays?: number });
      message.success('Report resolved successfully');
      setIsModalVisible(false);
      actionForm.resetFields();
      loadReports();
      loadStats();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || 'Failed to resolve report');
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
      message.error('Failed to dismiss report');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityTag = (priority: string) => {
    const config: Record<string, string> = {
      LOW: 'admin-tag-neutral',
      MEDIUM: 'admin-tag-primary',
      HIGH: 'admin-tag-warning',
      URGENT: 'admin-tag-error'
    };
    return <Tag className={config[priority] || 'admin-tag-neutral'}>{priority}</Tag>;
  };

  const getReasonTag = (reason: string) => {
    const classMap: Record<string, string> = {
      SPAM: 'admin-tag-neutral',
      HARASSMENT: 'admin-tag-warning',
      HATE_SPEECH: 'admin-tag-error',
      SEXUAL_CONTENT: 'admin-tag-error',
      VIOLENCE: 'admin-tag-error',
      MISINFORMATION: 'admin-tag-warning',
      IMPERSONATION: 'admin-tag-primary',
      SCAM: 'admin-tag-warning',
      COPYRIGHT: 'admin-tag-primary',
      OTHER: 'admin-tag-neutral'
    };
    return <Tag className={classMap[reason] || 'admin-tag-neutral'}>{reason.replace('_', ' ')}</Tag>;
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => <div style={{ color: colors.text.secondary, fontWeight: 500 }}>{format(new Date(date), 'MMM dd, HH:mm')}</div>
    },
    {
      title: 'Type',
      dataIndex: 'targetType',
      key: 'targetType',
      width: 100,
      render: (type: string) => <Tag className="admin-tag-neutral">{type}</Tag>
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
      render: (reporter: { name: string } | null) => <div style={{ fontWeight: 500, color: colors.text.primary }}>{reporter ? reporter.name : 'Anonymous'}</div>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => <Text style={{ color: colors.text.secondary }}>{desc || '-'}</Text>
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (record: Report) => (
        <Tooltip title="Review Report">
          <CustomButton
            variant="ghost"
            size="small"
            onClick={() => loadReportDetails(record.id)}
          >
            <Eye size={16} /> Review
          </CustomButton>
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
      </div>

      {/* Statistics */}
      {stats && (
        <Row gutter={[24, 24]} style={{ marginBottom: spacing[8] }}>
          <Col xs={24} sm={12} md={6}>
            <Card className="admin-card">
              <Statistic
                title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: colors.text.tertiary }}>
                  <Clock size={16} color={colors.warning.solid} /> PENDING
                </div>}
                value={stats.pendingReports}
                valueStyle={{ color: colors.text.primary, fontWeight: 900, fontSize: '28px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="admin-card">
              <Statistic
                title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: colors.text.tertiary }}>
                  <CheckCircle2 size={16} color={colors.success.solid} /> RESOLVED
                </div>}
                value={stats.resolvedToday}
                valueStyle={{ color: colors.text.primary, fontWeight: 900, fontSize: '28px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="admin-card">
              <Statistic
                title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: colors.text.tertiary }}>
                  <RotateCw size={16} color={colors.primary.solid} /> ACTIVE TASKS
                </div>}
                value={stats.suspendedUsers}
                valueStyle={{ color: colors.text.primary, fontWeight: 900, fontSize: '28px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="admin-card">
              <Statistic
                title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: colors.text.tertiary }}>
                  <Ban size={16} color={colors.error.solid} /> BANNED
                </div>}
                value={stats.bannedUsers}
                valueStyle={{ color: colors.text.primary, fontWeight: 900, fontSize: '28px' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div style={{ color: colors.text.tertiary, fontWeight: 600 }}>
          Showing {reports.length} moderation reports
        </div>
        <Space wrap>
          <Select
            style={{ width: 140 }}
            placeholder="All Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Status', value: '' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'In Review', value: 'IN_REVIEW' },
              { label: 'Resolved', value: 'RESOLVED' },
              { label: 'Dismissed', value: 'DISMISSED' }
            ]}
          />

          <Select
            style={{ width: 140 }}
            placeholder="All Priorities"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { label: 'All Priorities', value: '' },
              { label: 'Low', value: 'LOW' },
              { label: 'Medium', value: 'MEDIUM' },
              { label: 'High', value: 'HIGH' },
              { label: 'Urgent', value: 'URGENT' }
            ]}
          />

          <Select
            style={{ width: 140 }}
            placeholder="All Types"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { label: 'All Types', value: '' },
              { label: 'Message', value: 'MESSAGE' },
              { label: 'User', value: 'USER' },
              { label: 'Creator', value: 'CREATOR' },
              { label: 'Conversation', value: 'CONVERSATION' }
            ]}
          />

          <CustomButton
            variant="secondary"
            onClick={loadReports}
            style={{ height: '44px' }}
          >
            <RotateCw size={16} /> Refresh
          </CustomButton>
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
      <CustomModal
        title="Report Details"
        icon={<Shield size={20} />}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          actionForm.resetFields();
        }}
        width={900}
        footer={null}
      >
        {selectedReport && (
          <div style={{ padding: '0 8px' }}>
            {/* Report Info */}
            <div style={{ marginBottom: '32px' }}>
              <Title level={4} style={{ color: colors.text.primary, marginBottom: '20px', fontWeight: 800 }}>Incident Summary</Title>
              <Descriptions
                bordered
                column={2}
                size="middle"
                style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden' }}
                labelStyle={{ background: colors.gray[50], fontWeight: 700, color: colors.text.secondary, width: '160px' }}
                contentStyle={{ background: '#ffffff', color: colors.text.primary, fontWeight: 500 }}
              >
                <Descriptions.Item label="Target Type">{selectedReport.report.targetType}</Descriptions.Item>
                <Descriptions.Item label="Reason">{getReasonTag(selectedReport.report.reason)}</Descriptions.Item>
                <Descriptions.Item label="Priority">{getPriorityTag(selectedReport.report.priority)}</Descriptions.Item>
                <Descriptions.Item label="Timestamp">
                  {format(new Date(selectedReport.report.createdAt), 'MMM dd, yyyy HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Reporter" span={2}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.primary.solid }}></div>
                    {selectedReport.report.reporter ?
                      `${selectedReport.report.reporter.name} (${selectedReport.report.reporter.email})` :
                      'Anonymous User'}
                  </div>
                </Descriptions.Item>
                {selectedReport.report.description && (
                  <Descriptions.Item label="Narrative" span={2}>
                    <Text style={{ color: colors.text.primary, lineHeight: 1.6 }}>{selectedReport.report.description}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>

            <Row gutter={24}>
              <Col span={14}>
                {/* Target Context */}
                {selectedReport.targetContext && (
                  <Card
                    title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.text.primary }}><Eye size={16} /> Evidence Material</div>}
                    size="small"
                    style={{ marginBottom: '24px', borderRadius: '12px', border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}
                    styles={{ header: { background: colors.gray[50], borderBottom: `1px solid ${colors.gray[100]}` } }}
                  >
                    <pre style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      background: colors.gray[50],
                      padding: '16px',
                      borderRadius: '12px',
                      color: colors.text.primary,
                      fontSize: '12px',
                      border: `1px solid ${colors.gray[100]}`,
                      maxHeight: '300px',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(selectedReport.targetContext, null, 2)}
                    </pre>
                  </Card>
                )}
              </Col>

              <Col span={10}>
                {/* Moderation History */}
                <Card
                  title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.text.primary }}><Clock size={16} /> Audit Trail</div>}
                  size="small"
                  style={{ marginBottom: '24px', borderRadius: '12px', border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}
                  styles={{ header: { background: colors.gray[50], borderBottom: `1px solid ${colors.gray[100]}` } }}
                >
                  {selectedReport.moderationHistory.length > 0 ? (
                    <Timeline style={{ marginTop: '16px' }}>
                      {selectedReport.moderationHistory.map((log: { id: string; action: string; reason?: string; moderator?: { name: string }; createdAt: string }) => (
                        <Timeline.Item key={log.id} color={log.action.includes('BAN') ? colors.error.solid : colors.primary.solid}>
                          <Text strong style={{ color: colors.text.primary, fontSize: '13px' }}>{log.action.replace('_', ' ')}</Text>
                          <br />
                          <Text style={{ color: colors.text.secondary, fontSize: '12px' }}>{log.reason}</Text>
                          <br />
                          <Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 600 }}>
                            {format(new Date(log.createdAt), 'MMM dd, HH:mm')} by {log.moderator?.name || 'System'}
                          </Text>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center' }}>
                      <Info size={32} color={colors.gray[200]} style={{ marginBottom: '8px' }} />
                      <Text style={{ color: colors.text.tertiary, display: 'block', fontSize: '13px' }}>No previous actions</Text>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>

            <Divider style={{ margin: '32px 0' }} />

            {/* Action Form */}
            <Title level={5} style={{ color: colors.text.primary, marginBottom: '20px', fontWeight: 800 }}>Decision Matrix</Title>
            <Form
              form={actionForm}
              layout="vertical"
              onFinish={handleResolve}
              requiredMark={false}
            >
              <Form.Item
                label={<span style={{ fontWeight: 700, color: colors.text.secondary }}>REQUIRED ACTION</span>}
                name="action"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Radio.Group style={{ width: '100%' }}>
                  <Row gutter={[16, 16]}>
                    {[
                      { value: 'NO_ACTION', label: 'No Violation' },
                      { value: 'WARNING_SENT', label: 'Issue Warning' },
                      { value: 'CONTENT_HIDDEN', label: 'Purge Content' },
                      { value: 'USER_SUSPENDED', label: 'Suspend User' },
                      { value: 'USER_BANNED', label: 'Permanent Ban' }
                    ].map(opt => (
                      <Col span={8} key={opt.value}>
                        <Radio.Button value={opt.value} style={{ width: '100%', textAlign: 'center', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontWeight: 600 }}>
                          {opt.label}
                        </Radio.Button>
                      </Col>
                    ))}
                  </Row>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.action !== currentValues.action}
              >
                {({ getFieldValue }) =>
                  getFieldValue('action') === 'USER_SUSPENDED' ? (
                    <Form.Item
                      label={<span style={{ fontWeight: 700, color: colors.text.secondary }}>SUSPENSION DURATION (DAYS)</span>}
                      name="suspensionDays"
                      rules={[{ required: true, message: 'Please enter suspension duration' }]}
                      initialValue={7}
                    >
                      <InputNumber min={1} max={365} placeholder="Days" style={{ width: '100%', height: '44px', borderRadius: '10px', paddingTop: '6px' }} />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 700, color: colors.text.secondary }}>DECISION RATIONALE</span>}
                name="reviewNotes"
                rules={[{ required: true, message: 'Please provide review notes' }]}
              >
                <TextArea rows={4} placeholder="Document the reasoning for this administrative action..." style={{ borderRadius: '12px', padding: '16px' }} />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
                <Space size="middle" style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button onClick={() => setIsModalVisible(false)} style={{ borderRadius: '10px', height: '48px', padding: '0 24px', fontWeight: 600 }}>
                    Cancel Review
                  </Button>
                  <Button
                    className="admin-cta-secondary"
                    onClick={handleDismiss}
                    loading={loading}
                    style={{ height: '48px', padding: '0 24px', fontWeight: 600, border: `1.5px solid ${colors.gray[300]}` }}
                  >
                    Dismiss Report
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{
                      height: '48px',
                      padding: '0 32px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      background: colors.primary.gradient,
                      border: 'none',
                      boxShadow: shadows.md
                    }}
                  >
                    Execute Decision
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default AdminModeration;
