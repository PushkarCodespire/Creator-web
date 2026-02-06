// ===========================================
// COMPANY OPPORTUNITIES PAGE
// ===========================================

import { useEffect, useState } from 'react';
import { Card, Button, Table, Tag, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { opportunityApi, companyApi } from '../../services/api';

const { TextArea } = Input;

const CompanyOpportunities = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await companyApi.getDashboard();
      setOpportunities(response.data.data?.opportunities || []);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      await opportunityApi.create(values);
      message.success('Opportunity created!');
      setModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{text}</span>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (t: string) => <Tag color="blue" style={{ border: 'none', background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA' }}>{(t || '').replace('_', ' ')}</Tag>
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      render: (b: number) => b ? <span style={{ fontFamily: 'monospace', color: '#A5F3FC' }}>₹{b.toLocaleString()}</span> : <span style={{ color: '#94A3B8' }}>Negotiable</span>
    },
    {
      title: 'Applications',
      key: 'apps',
      render: (r: any) => (
        <Tag color="purple" style={{ border: 'none', background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA' }}>
          {r._count?.applications || 0}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={s === 'OPEN' ? 'success' : 'default'} style={{ border: 'none' }}>
          {s}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button size="small" type="link" style={{ color: '#6366F1' }} onClick={() => window.location.href = `/company-dashboard/opportunities/${record.id}`}>
          View
        </Button>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: '#F8FAFC' }}>
            My Opportunities
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '16px', margin: 0 }}>Manage your creator collaboration opportunities</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
          size="large"
          style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}
        >
          Create Opportunity
        </Button>
      </div>

      <Card
        bordered={false}
        style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px' }}
        bodyStyle={{ padding: '0' }}
      >
        <Table
          dataSource={opportunities}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          rowClassName="premium-table-row"
          style={{ background: 'transparent' }}
        />
      </Card>

      <style>{`
        .ant-table {
          background: transparent !important;
          color: #F8FAFC !important;
        }
        .ant-table-thead > tr > th {
          background: rgba(30, 41, 59, 1) !important;
          color: #94A3B8 !important;
          border-bottom: 1px solid #334155 !important;
        }
        .premium-table-row:hover > td {
          background: rgba(51, 65, 85, 0.5) !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #334155 !important;
          color: #F8FAFC !important;
          padding: 16px 24px !important;
        }
        .ant-table-wrapper .ant-pagination-item {
            background-color: transparent !important;
            border-color: #334155 !important;
        }
        .ant-table-wrapper .ant-pagination-item-active {
            border-color: #6366F1 !important;
            background: rgba(99, 102, 241, 0.1) !important;
        }
        .ant-table-wrapper .ant-pagination-item a {
            color: #94A3B8 !important;
        }
        .ant-table-wrapper .ant-pagination-item-active a {
             color: #6366F1 !important;
        }
      `}</style>

      <Modal title="Create Opportunity" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="E.g., Brand Ambassador for Product Launch" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Describe what you're looking for..." />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="SPONSORED_POST">Sponsored Post</Select.Option>
              <Select.Option value="BRAND_AMBASSADOR">Brand Ambassador</Select.Option>
              <Select.Option value="PRODUCT_REVIEW">Product Review</Select.Option>
              <Select.Option value="AFFILIATE">Affiliate</Select.Option>
              <Select.Option value="COLLABORATION">Collaboration</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="budget" label="Budget (₹)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select placeholder="Target creator category">
              <Select.Option value="Fitness">Fitness</Select.Option>
              <Select.Option value="Business">Business</Select.Option>
              <Select.Option value="Technology">Technology</Select.Option>
              <Select.Option value="Lifestyle">Lifestyle</Select.Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block>Create</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default CompanyOpportunities;
