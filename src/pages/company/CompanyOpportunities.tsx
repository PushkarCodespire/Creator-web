import { useEffect, useState } from 'react';
import { Card, Button, Table, Tag, Modal, Form, Input, InputNumber, Select, message, Typography, Row, Col, Space, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { opportunityApi, companyApi } from '../../services/api';
import { colors, shadows } from '../../styles/tokens';
import { motion } from 'framer-motion';
import { logger } from '../../utils/logger';

const { Title, Text } = Typography;
const { TextArea } = Input;

type ModalMode = 'create' | 'edit';

interface OpportunityItem {
  id: string;
  title: string;
  description: string;
  type: string;
  category?: string;
  budget?: number;
  budgetType?: string;
  minFollowers?: number;
  requirements?: string;
  status: string;
  _count?: { applications: number };
}

const CompanyOpportunities = () => {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [editingOpportunity, setEditingOpportunity] = useState<OpportunityItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await companyApi.getDashboard();
      setOpportunities(response.data.data?.opportunities || []);
    } catch (err: unknown) {
      logger.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingOpportunity(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (opportunity: OpportunityItem) => {
    setModalMode('edit');
    setEditingOpportunity(opportunity);
    form.setFieldsValue({
      title: opportunity.title,
      description: opportunity.description,
      type: opportunity.type,
      category: opportunity.category,
      budget: opportunity.budget ? Number(opportunity.budget) : undefined,
      budgetType: opportunity.budgetType,
      minFollowers: opportunity.minFollowers,
      requirements: opportunity.requirements
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingOpportunity(null);
    form.resetFields();
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      if (modalMode === 'edit' && editingOpportunity) {
        // Strip `type` — backend ignores it anyway, but no point sending it
        const { type: _type, ...editable } = values;
        await opportunityApi.update(editingOpportunity.id, editable);
        message.success('Opportunity updated');
      } else {
        await opportunityApi.create(values);
        message.success('Opportunity created!');
      }
      closeModal();
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string | { message?: string } } } };
      const errMsg = typeof e.response?.data?.error === 'object'
        ? (e.response?.data?.error as { message?: string })?.message
        : e.response?.data?.error;
      message.error(
        errMsg || `Failed to ${modalMode === 'edit' ? 'update' : 'create'}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (opportunity: OpportunityItem) => {
    setCancellingId(opportunity.id);
    try {
      const res = await opportunityApi.cancel(opportunity.id);
      const count = res.data?.data?.autoRejectedCount ?? 0;
      message.success(
        count > 0
          ? `Opportunity cancelled. ${count} pending application${count === 1 ? '' : 's'} auto-rejected.`
          : 'Opportunity cancelled.'
      );
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string | { message?: string } } } };
      const errMsg = typeof e.response?.data?.error === 'object'
        ? (e.response?.data?.error as { message?: string })?.message
        : e.response?.data?.error;
      message.error(errMsg || 'Failed to cancel opportunity');
    } finally {
      setCancellingId(null);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: OpportunityItem) => (
        <div>
          <Text style={{ fontWeight: 700, color: colors.text.primary, fontSize: '15px' }}>{text}</Text>
          {record.description && (
            <Text style={{ display: 'block', color: colors.text.tertiary, fontSize: '12px', fontWeight: 400, marginTop: '2px' }}>
              {record.description}
            </Text>
          )}
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (t: string) => t ? <Tag style={{ borderRadius: '6px', fontWeight: 600 }}>{t}</Tag> : <Text style={{ color: colors.text.tertiary }}>—</Text>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (c: string) => c ? <Text style={{ fontWeight: 500 }}>{c}</Text> : <Text style={{ color: colors.text.tertiary }}>—</Text>
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      render: (b: number | null | undefined, record: OpportunityItem) => {
        // Prisma Decimal serializes as a string; coerce before formatting.
        const n = b !== null ? Number(b) : null;
        return (
          <div>
            {n && !Number.isNaN(n)
              ? <Text style={{ fontWeight: 700, color: colors.primary.solid, fontSize: '15px' }}>₹{n.toLocaleString('en-IN')}</Text>
              : <Text style={{ color: colors.text.tertiary, fontWeight: 500 }}>Negotiable</Text>}
            {record.budgetType && (
              <Tag style={{ display: 'block', marginTop: '2px', width: 'fit-content', borderRadius: '4px', fontSize: '11px' }}>{record.budgetType}</Tag>
            )}
          </div>
        );
      }
    },
    {
      title: 'Applications',
      key: 'apps',
      render: (_: unknown, r: OpportunityItem) => (
        <Tag color="purple" style={{ borderRadius: '6px', fontWeight: 800, padding: '2px 10px' }}>
          {r._count?.applications || 0}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={s === 'OPEN' ? 'success' : 'default'} style={{ borderRadius: '6px', fontWeight: 700 }}>
          {s}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: OpportunityItem) => {
        const isOpen = record.status === 'OPEN';
        const applicantCount = record._count?.applications || 0;
        return (
          <Space size={6}>
            <Tooltip title="View details">
              <Button
                size="small"
                type="text"
                shape="circle"
                icon={<EyeOutlined />}
                style={{ color: colors.primary.solid }}
                onClick={() => window.location.href = `/company-dashboard/opportunities/${record.id}`}
              />
            </Tooltip>
            {isOpen && (
              <Tooltip title="Edit">
                <Button
                  size="small"
                  type="text"
                  shape="circle"
                  icon={<EditOutlined />}
                  style={{ color: colors.text.secondary }}
                  onClick={() => openEditModal(record)}
                />
              </Tooltip>
            )}
            {isOpen && (
              <Popconfirm
                title="Cancel this opportunity?"
                description={
                  applicantCount > 0
                    ? `${applicantCount} pending application${applicantCount === 1 ? '' : 's'} will be auto-rejected and notified.`
                    : 'This will mark the opportunity as cancelled. It cannot be undone.'
                }
                icon={<ExclamationCircleOutlined style={{ color: '#EF4444' }} />}
                okText="Yes, cancel"
                okButtonProps={{ danger: true, loading: cancellingId === record.id }}
                cancelText="Keep it"
                onConfirm={() => handleCancel(record)}
              >
                <Tooltip title="Cancel opportunity">
                  <Button
                    size="small"
                    type="text"
                    shape="circle"
                    icon={<DeleteOutlined />}
                    style={{ color: '#EF4444' }}
                    loading={cancellingId === record.id}
                  />
                </Tooltip>
              </Popconfirm>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '32px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={2} style={{ color: colors.text.primary, marginBottom: '4px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            My Opportunities
          </Title>
          <Text style={{ color: colors.text.tertiary, fontSize: '16px', fontWeight: 500 }}>Manage your creator collaboration opportunities</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
          size="large"
          style={{
            background: colors.primary.solid,
            border: 'none',
            borderRadius: '12px',
            height: '48px',
            padding: '0 24px',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(18, 104, 255, 0.2)'
          }}
        >
          Create Opportunity
        </Button>
      </div>

      <Card
        bordered={false}
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: `1px solid ${colors.gray[100]}`,
          boxShadow: shadows.md,
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '0' }}
      >
        <Table
          dataSource={opportunities}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          rowClassName="premium-table-row"
        />
      </Card>

      <style>{`
        .ant-table {
          background: #ffffff !important;
        }
        .ant-table-thead > tr > th {
          background: ${colors.gray[50]} !important;
          color: ${colors.text.tertiary} !important;
          border-bottom: 2px solid ${colors.gray[100]} !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 11px !important;
          letter-spacing: 0.05em !important;
          padding: 16px 24px !important;
        }
        .premium-table-row:hover > td {
          background: ${colors.gray[50]} !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${colors.gray[50]} !important;
          color: ${colors.text.primary} !important;
          padding: 20px 24px !important;
          font-weight: 500 !important;
        }
        .ant-pagination-item {
            border-radius: 8px !important;
            border-color: ${colors.gray[200]} !important;
        }
        .ant-pagination-item-active {
            border-color: ${colors.primary.solid} !important;
            background: ${colors.primary.subtle} !important;
        }
        .ant-pagination-item a {
            color: ${colors.text.tertiary} !important;
            font-weight: 700 !important;
        }
        .ant-pagination-item-active a {
             color: ${colors.primary.solid} !important;
        }
        .ant-modal-content {
          border-radius: 24px !important;
          padding: 0 !important;
          background: #ffffff !important;
          overflow: hidden !important;
          box-shadow: ${shadows.xl} !important;
        }
        .ant-modal-header {
          margin-bottom: 0 !important;
          padding: 32px 32px 16px 32px !important;
          background: #ffffff !important;
          border-bottom: none !important;
        }
        .ant-modal-footer {
            padding: 0 32px 32px 32px !important;
            border-top: none !important;
        }
        .ant-modal-title {
          font-size: 24px !important;
          font-weight: 800 !important;
          color: ${colors.text.primary} !important;
          letter-spacing: -0.02em !important;
        }
        .ant-modal-close {
            top: 24px !important;
            right: 24px !important;
            color: ${colors.text.tertiary} !important;
        }
        .ant-form-item-label label {
          font-weight: 700 !important;
          color: ${colors.text.primary} !important;
          font-size: 13px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        .ant-input, .ant-input-number, .ant-select-selector, .ant-input-number-input {
          border-radius: 12px !important;
          border: 1px solid ${colors.gray[200]} !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          background: #ffffff !important;
          color: ${colors.text.primary} !important;
        }
        .ant-input, .ant-select-selector {
            padding: 8px 12px !important;
        }
        .ant-input:hover, .ant-input-number:hover, .ant-select-selector:hover {
            border-color: ${colors.primary.solid} !important;
        }
        .ant-input:focus, .ant-input-number:focus, .ant-select-selector:focus {
            border-color: ${colors.primary.solid} !important;
            box-shadow: 0 0 0 4px ${colors.primary.subtle} !important;
        }
      `}</style>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {modalMode === 'edit' ? <EditOutlined style={{ color: colors.primary.solid }} /> : <PlusOutlined style={{ color: colors.primary.solid }} />}
            {modalMode === 'edit' ? 'Edit Opportunity' : 'Create Opportunity'}
          </div>
        }
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={600}
        centered
        destroyOnClose
      >
        <div style={{ padding: '0 32px 32px 32px' }}>
          <Text style={{ display: 'block', color: colors.text.tertiary, marginBottom: modalMode === 'edit' && (editingOpportunity?._count?.applications || 0) > 0 ? '16px' : '32px', fontSize: '15px', fontWeight: 500 }}>
            {modalMode === 'edit'
              ? 'Update your campaign details. The opportunity type cannot be changed after creation.'
              : 'Define your campaign requirements and find the perfect creator to collaborate with.'}
          </Text>
          {modalMode === 'edit' && (editingOpportunity?._count?.applications || 0) > 0 && (
            <div
              style={{
                padding: '12px 14px',
                marginBottom: '24px',
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.10)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                color: '#92400E',
                fontSize: 13,
                lineHeight: 1.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8
              }}
            >
              <ExclamationCircleOutlined style={{ marginTop: 2 }} />
              <span>
                <strong>{editingOpportunity?._count?.applications}</strong> creator{editingOpportunity?._count?.applications === 1 ? ' has' : 's have'} already applied. Changes to budget, requirements, or deadline will apply to their applications too.
              </span>
            </div>
          )}
          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <Form.Item
              name="title"
              label={<span>📝 Opportunity Title</span>}
              rules={[{ required: true, message: 'Please enter a title' }]}
            >
              <Input size="large" placeholder="E.g., Brand Ambassador for Product Launch" />
            </Form.Item>

            <Form.Item
              name="description"
              label={<span>📖 Campaign Description</span>}
              rules={[{ required: true, message: 'Please enter a description' }]}
            >
              <TextArea rows={4} placeholder="Describe your campaign goals, requirements, and what you expect from the creator..." />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label={<span>🏷️ Type{modalMode === 'edit' && <Text style={{ fontSize: 10, fontWeight: 600, color: colors.text.tertiary, marginLeft: 6 }}>(cannot be changed)</Text>}</span>}
                  rules={modalMode === 'edit' ? [] : [{ required: true, message: 'Select collaboration type' }]}
                >
                  <Select size="large" placeholder="Select type" disabled={modalMode === 'edit'}>
                    <Select.Option value="SPONSORED_POST">Sponsored Post</Select.Option>
                    <Select.Option value="BRAND_AMBASSADOR">Brand Ambassador</Select.Option>
                    <Select.Option value="PRODUCT_REVIEW">Product Review</Select.Option>
                    <Select.Option value="AFFILIATE">Affiliate</Select.Option>
                    <Select.Option value="COLLABORATION">Collaboration</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label={<span>🎯 Category</span>}
                  rules={[{ required: true, message: 'Select a category' }]}
                >
                  <Select size="large" placeholder="Select category">
                    <Select.Option value="Fitness">Fitness</Select.Option>
                    <Select.Option value="Business">Business</Select.Option>
                    <Select.Option value="Technology">Technology</Select.Option>
                    <Select.Option value="Lifestyle">Lifestyle</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="budget"
              label={<span>💰 Budget (INR)</span>}
              extra={<Text style={{ fontSize: '12px', color: colors.text.tertiary }}>Leave blank for negotiable budget</Text>}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                size="large"
                placeholder="Enter amount"
                formatter={value => value ? `₹ ${new Intl.NumberFormat('en-IN').format(Number(value))}` : '₹ '}
                parser={value => (value ? value.replace(/₹\s?|(,*)/g, '') : '') as unknown as 0}
              />
            </Form.Item>

            <Row gutter={12} style={{ marginTop: '24px' }}>
              <Col span={8}>
                <Button
                  block
                  size="large"
                  onClick={closeModal}
                  style={{ borderRadius: '14px', fontWeight: 700, height: '56px' }}
                >
                  Cancel
                </Button>
              </Col>
              <Col span={16}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  block
                  size="large"
                  style={{
                    borderRadius: '14px',
                    fontWeight: 800,
                    height: '56px',
                    background: colors.primary.gradient,
                    border: 'none',
                    fontSize: '16px',
                    boxShadow: '0 8px 24px rgba(18, 104, 255, 0.25)'
                  }}
                >
                  {modalMode === 'edit' ? 'Save Changes' : 'Post Opportunity'}
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
    </motion.div>
  );
};

export default CompanyOpportunities;
