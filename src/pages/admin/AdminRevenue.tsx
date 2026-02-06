// ===========================================
// ADMIN REVENUE DASHBOARD
// ===========================================

import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, Empty, Select, message, Tag, Typography, Progress, Space, List, Avatar } from 'antd';
import { RiseOutlined, CreditCardOutlined, UserOutlined, AccountBookOutlined, WalletOutlined, CheckCircleOutlined, SyncOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { adminApi } from '../../services/api';
import '../../styles/AdminPanel.css';

const { Text, Title, Paragraph } = Typography;

const AdminRevenue = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getRevenue();
      setRevenueData(response.data.data);
      setTransactions(response.data.data.transactions?.recent || []);
    } catch (err) {
      console.error('Failed to fetch revenue data:', err);
      message.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => <Text style={{ color: '#475569' }}>{date}</Text>
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user: string) => <Text strong style={{ color: '#0F172A' }}>{user}</Text>
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan: string) => <Tag color={plan === 'PREMIUM' ? 'gold' : 'blue'} style={{ fontWeight: 600 }}>{plan}</Tag>
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <Text style={{ color: '#10B981', fontWeight: 700 }}>INR {amount.toLocaleString()}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'COMPLETED' ? 'success' : 'error'} style={{ fontWeight: 600 }}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Payment ID',
      dataIndex: 'paymentId',
      key: 'paymentId',
      render: (id: string) => <Text type="secondary" style={{ fontSize: '11px', color: '#64748B' }}>{id}</Text>
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading revenue analytics..." />
      </div>
    );
  }

  const totalRevenue = Number(revenueData?.totalRevenue || 0);

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div>
          <h2 className="admin-hero-title">Financial Overview</h2>
          <p className="admin-hero-subtitle">Comprehensive tracking of platform earnings and subscriber health.</p>
        </div>
        <Select
          value={timeRange}
          onChange={setTimeRange}
          style={{ width: 160 }}
          className="admin-pill-select"
        >
          <Select.Option value="7days">Last 7 days</Select.Option>
          <Select.Option value="30days">Last 30 days</Select.Option>
          <Select.Option value="90days">Last 90 days</Select.Option>
          <Select.Option value="year">This year</Select.Option>
        </Select>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="admin-card">
            <Statistic
              title="Total Platform Revenue"
              value={totalRevenue}
              valueStyle={{ fontWeight: 800, color: '#0F172A', fontSize: '24px' }}
              formatter={(value) => `INR ${Number(value).toLocaleString()}`}
              suffix={
                <Tag color="success" style={{ marginLeft: '12px', verticalAlign: 'middle', border: 'none', borderRadius: '6px' }}>
                  <RiseOutlined /> 12.5%
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="admin-card">
            <Statistic
              title="Subscription Earnings"
              value={Number(revenueData?.subscriptionRevenue || 0)}
              valueStyle={{ fontWeight: 800, color: '#6366F1', fontSize: '24px' }}
              formatter={(value) => `INR ${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="admin-card">
            <Statistic
              title="Deal Commissions"
              value={Number(revenueData?.dealCommissionRevenue || 0)}
              valueStyle={{ fontWeight: 800, color: '#10B981', fontSize: '24px' }}
              formatter={(value) => `INR ${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="admin-card">
            <Statistic
              title="Active Subscribers"
              value={revenueData?.subscriptions?.byStatus?.ACTIVE || 0}
              prefix={<UserOutlined style={{ color: '#F59E0B' }} />}
              valueStyle={{ fontWeight: 800, color: '#F59E0B', fontSize: '24px' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        {/* Performance Timeline (Replacing Area Chart) */}
        <Col xs={24} lg={12}>
          <Card className="admin-card" title={<Text strong style={{ color: '#0F172A' }}>Daily Earnings Timeline</Text>}>
            <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
              <List
                itemLayout="horizontal"
                dataSource={revenueData?.revenueTrend || []}
                renderItem={(item: any) => (
                  <List.Item
                    extra={
                      <div style={{ textAlign: 'right' }}>
                        <Title level={5} style={{ margin: 0, color: '#0F172A' }}>INR {item.revenue.toLocaleString()}</Title>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {item.dealRevenue > 0 && `Deals: ₹${item.dealRevenue.toLocaleString()}`}
                        </Text>
                      </div>
                    }
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<AccountBookOutlined />}
                          style={{ backgroundColor: '#f1f5f9', color: '#6366F1', borderRadius: '12px' }}
                        />
                      }
                      title={<Text strong style={{ color: '#0F172A' }}>{item.date}</Text>}
                      description={<Text type="secondary">Generated Earnings</Text>}
                    />
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>

        {/* Revenue Distribution (Replacing Pie Chart) */}
        <Col xs={24} lg={12}>
          <Card className="admin-card" title={<Text strong style={{ color: '#0F172A' }}>revenue Source Distribution</Text>}>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Space direction="horizontal">
                    <WalletOutlined style={{ color: '#6366F1' }} />
                    <Text strong style={{ color: '#475569' }}>Subscriptions</Text>
                  </Space>
                  <Text strong style={{ color: '#0F172A' }}>{revenueData?.revenueBreakdown?.subscriptions?.percentage}%</Text>
                </div>
                <Progress
                  percent={Number(revenueData?.revenueBreakdown?.subscriptions?.percentage || 0)}
                  strokeColor="#6366F1"
                  strokeWidth={14}
                  showInfo={false}
                />
                <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginTop: '6px' }}>
                  Total: <Text strong style={{ color: '#475569' }}>INR {Number(revenueData?.revenueBreakdown?.subscriptions?.amount || 0).toLocaleString()}</Text>
                </Text>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Space direction="horizontal">
                    <AccountBookOutlined style={{ color: '#10B981' }} />
                    <Text strong style={{ color: '#475569' }}>Deal Commissions</Text>
                  </Space>
                  <Text strong style={{ color: '#0F172A' }}>{revenueData?.revenueBreakdown?.dealCommission?.percentage}%</Text>
                </div>
                <Progress
                  percent={Number(revenueData?.revenueBreakdown?.dealCommission?.percentage || 0)}
                  strokeColor="#10B981"
                  strokeWidth={14}
                  showInfo={false}
                />
                <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginTop: '6px' }}>
                  Total: <Text strong style={{ color: '#475569' }}>INR {Number(revenueData?.revenueBreakdown?.dealCommission?.amount || 0).toLocaleString()}</Text>
                </Text>
              </div>

              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <Title level={5} style={{ color: '#0F172A', marginTop: 0 }}>Growth Insights</Title>
                <Paragraph style={{ color: '#475569', marginBottom: 0 }}>
                  Dominant Source: <Text strong style={{ color: '#6366F1' }}>{Number(revenueData?.revenueBreakdown?.dealCommission?.percentage || 0) > 50 ? 'Deal Commissions' : 'Subscriptions'}</Text>
                  <br />
                  Platform Retention: <Text strong style={{ color: '#10B981' }}>{Math.round(((revenueData?.subscriptions?.byStatus?.ACTIVE || 0) / (revenueData?.subscriptions?.totalSubscribers || 1)) * 100)}%</Text>
                </Paragraph>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        {/* Subscriber Segmentation */}
        <Col xs={24} lg={12}>
          <Card className="admin-card" title={<Text strong style={{ color: '#0F172A' }}>Subscriber Segmentation</Text>}>
            <Row align="middle" gutter={24} style={{ padding: '12px 0' }}>
              <Col span={10} style={{ textAlign: 'center', borderRight: '1px solid #E2E8F0' }}>
                <Title level={1} style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>{revenueData?.subscriptions?.totalSubscribers || 0}</Title>
                <Text style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', fontWeight: 800, color: '#64748B' }}>Total User Base</Text>
              </Col>
              <Col span={14}>
                <Space direction="vertical" style={{ width: '100%', paddingLeft: '12px' }} size="large">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <Text strong style={{ color: '#475569', fontSize: '13px' }}>PREMIUM SUBSCRIBERS</Text>
                      <Text strong style={{ color: '#0F172A' }}>{revenueData?.subscriptions?.byPlan?.PREMIUM?.count || 0}</Text>
                    </div>
                    <Progress percent={Math.round(((revenueData?.subscriptions?.byPlan?.PREMIUM?.count || 0) / (revenueData?.subscriptions?.totalSubscribers || 1)) * 100)} strokeColor="#F59E0B" showInfo={false} strokeWidth={10} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <Text strong style={{ color: '#475569', fontSize: '13px' }}>FREE TIER USERS</Text>
                      <Text strong style={{ color: '#0F172A' }}>{revenueData?.subscriptions?.byPlan?.FREE?.count || 0}</Text>
                    </div>
                    <Progress percent={Math.round(((revenueData?.subscriptions?.byPlan?.FREE?.count || 0) / (revenueData?.subscriptions?.totalSubscribers || 1)) * 100)} strokeColor="#1E293B" showInfo={false} strokeWidth={10} />
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Transaction Reliability Indicators */}
        <Col xs={24} lg={12}>
          <Card className="admin-card" title={<Text strong style={{ color: '#0F172A' }}>Transaction Reliability</Text>}>
            <Row gutter={16}>
              <Col span={8} style={{ textAlign: 'center' }}>
                <CircleMetric
                  icon={<CheckCircleOutlined style={{ color: '#10B981' }} />}
                  label="SUCCESS"
                  value={revenueData?.transactions?.byStatus?.COMPLETED || 0}
                  percent={Math.round(((revenueData?.transactions?.byStatus?.COMPLETED || 0) / (revenueData?.transactions?.totalCount || 1)) * 100)}
                  color="#10B981"
                />
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <CircleMetric
                  icon={<SyncOutlined spin style={{ color: '#F59E0B' }} />}
                  label="PENDING"
                  value={revenueData?.transactions?.byStatus?.PENDING || 0}
                  percent={Math.round(((revenueData?.transactions?.byStatus?.PENDING || 0) / (revenueData?.transactions?.totalCount || 1)) * 100)}
                  color="#F59E0B"
                />
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <CircleMetric
                  icon={<CloseCircleOutlined style={{ color: '#EF4444' }} />}
                  label="FAILED"
                  value={revenueData?.transactions?.byStatus?.FAILED || 0}
                  percent={Math.round(((revenueData?.transactions?.byStatus?.FAILED || 0) / (revenueData?.transactions?.totalCount || 1)) * 100)}
                  color="#EF4444"
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card className="admin-card admin-table" title={<Text strong style={{ color: '#0F172A' }}>Comprehensive Transaction Logs</Text>}>
        <Table
          dataSource={transactions}
          columns={transactionColumns}
          rowKey={(record) => record.id || record.paymentId}
          pagination={{
            pageSize: 5,
            showTotal: (total) => `Showing ${total} recent transactions`
          }}
          locale={{ emptyText: <Empty description="Zero transactions detected in this period" /> }}
        />
      </Card>
    </div>
  );
};

// Helper component for circle metrics
const CircleMetric = ({ icon, label, value, percent, color }: any) => (
  <div style={{ padding: '8px' }}>
    <Space direction="vertical" align="center" size={0}>
      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{icon}</div>
      <Text style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', color: '#64748B' }}>{label}</Text>
      <Title level={3} style={{ margin: '4px 0 12px 0', color: '#0F172A', fontWeight: 800 }}>{value}</Title>
      <Progress
        type="circle"
        percent={percent}
        size={50}
        strokeColor={color}
        strokeWidth={12}
        format={(pct) => <span style={{ color: '#0F172A', fontWeight: 700, fontSize: '12px' }}>{pct}%</span>}
      />
    </Space>
  </div>
);

export default AdminRevenue;
