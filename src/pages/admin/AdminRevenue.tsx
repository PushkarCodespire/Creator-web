// ===========================================
// ADMIN REVENUE DASHBOARD
// ===========================================

import { useEffect, useState } from 'react';
import { Row, Col, Statistic, Spin, Empty, Select, message, Tag, Typography, Progress, Space, List, Avatar } from 'antd';
import {
  TrendingUp,
  CreditCard,
  Users,
  Wallet,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { colors, spacing, typography, shadows } from '../../styles/tokens';
import CustomTable from '../../components/common/Table/CustomTable';
import CustomCard from '../../components/common/Card/CustomCard';
import CustomButton from '../../components/common/Button/CustomButton';

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
      render: (date: string) => <Text style={{ color: colors.text.secondary }}>{date}</Text>
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user: string) => <Text strong style={{ color: colors.text.primary }}>{user}</Text>
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
      render: (amount: number) => <Text style={{ color: colors.success.solid, fontWeight: 700 }}>INR {amount.toLocaleString()}</Text>
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
      render: (id: string) => <Text type="secondary" style={{ fontSize: '11px', color: colors.text.tertiary }}>{id}</Text>
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

  const formatWeeklyRange = (start?: string | Date, end?: string | Date) => {
    if (!start) return '';
    const startDate = new Date(start);
    if (Number.isNaN(startDate.getTime())) return String(start);

    let endDate = end ? new Date(end) : new Date(startDate);
    if (Number.isNaN(endDate.getTime())) {
      endDate = new Date(startDate);
    }
    if (!end) {
      endDate.setDate(endDate.getDate() + 6);
    }

    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });

    if (startMonth === endMonth) {
      return `${startDay}-${endDay} ${startMonth}`;
    }
    return `${startDay} ${startMonth}-${endDay} ${endMonth}`;
  };

  const getWeekLabel = (item: any) => {
    if (item?.rangeLabel) return item.rangeLabel;
    const start = item?.startDate || item?.weekStart || item?.date;
    const end = item?.endDate || item?.weekEnd;
    const label = formatWeeklyRange(start, end);
    return label || item?.date || '-';
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[6] }}>
        <div>
          <h1 style={{
            fontSize: typography.fontSize['4xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            letterSpacing: '-0.02em',
            marginBottom: spacing[1]
          }}>
            Financial Overview
          </h1>
          <p style={{ fontSize: typography.fontSize.lg, color: colors.text.secondary }}>
            Comprehensive tracking of platform earnings and subscriber health.
          </p>
        </div>
        <Select
          value={timeRange}
          onChange={setTimeRange}
          style={{ width: 180, height: '40px' }}
          placeholder="Select Timeline"
        >
          <Select.Option value="7days">Last 7 days</Select.Option>
          <Select.Option value="30days">Last 30 days</Select.Option>
          <Select.Option value="90days">Last 90 days</Select.Option>
          <Select.Option value="year">This year</Select.Option>
        </Select>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: spacing[6] }}>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Total Platform Revenue"
            value={totalRevenue}
            color={colors.primary.solid}
            prefix={<TrendingUp size={16} />}
            trend="+12.5%"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Subscription Earnings"
            value={Number(revenueData?.subscriptionRevenue || 0)}
            color={colors.success.solid}
            prefix={<CreditCard size={16} />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Deal Commissions"
            value={Number(revenueData?.dealCommissionRevenue || 0)}
            color={colors.warning.solid}
            prefix={<Wallet size={16} />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Active Subscribers"
            value={revenueData?.subscriptions?.byStatus?.ACTIVE || 0}
            color={colors.orange}
            prefix={<Users size={16} />}
            isCurrency={false}
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        {/* Performance Timeline (Replacing Area Chart) */}
        <Col xs={24} lg={12}>
          <CustomCard title="Weekly Earnings Timeline" style={{ height: '100%' }}>
            <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
              <List
                itemLayout="horizontal"
                dataSource={revenueData?.revenueTrend || []}
                renderItem={(item: any) => (
                  <List.Item
                    extra={
                      <div style={{ textAlign: 'right' }}>
                        <Title level={5} style={{ margin: 0, color: colors.text.primary }}>INR {item.revenue.toLocaleString()}</Title>
                        <Text style={{ fontSize: '12px', color: colors.text.tertiary }}>
                          {item.dealRevenue > 0 && `Deals: ₹${item.dealRevenue.toLocaleString()}`}
                        </Text>
                      </div>
                    }
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<Calendar size={16} />}
                          style={{ backgroundColor: colors.gray[100], color: colors.primary.solid, borderRadius: '12px' }}
                        />
                      }
                      title={<Text strong style={{ color: colors.text.primary }}>{getWeekLabel(item)}</Text>}
                      description={<Text style={{ color: colors.text.tertiary }}>Generated Earnings</Text>}
                    />
                  </List.Item>
                )}
              />
            </div>
          </CustomCard>
        </Col>

        {/* Revenue Distribution (Replacing Pie Chart) */}
        <Col xs={24} lg={12}>
          <CustomCard title="Revenue Source Distribution" style={{ height: '100%' }}>
            <div style={{ padding: spacing[4] }}>
              <div style={{ marginBottom: spacing[6] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                  <Space direction="horizontal">
                    <CreditCard size={14} style={{ color: colors.primary.solid }} />
                    <Text strong style={{ color: colors.text.secondary }}>Subscriptions</Text>
                  </Space>
                  <Text strong style={{ color: colors.text.primary }}>{revenueData?.revenueBreakdown?.subscriptions?.percentage}%</Text>
                </div>
                <Progress
                  percent={Number(revenueData?.revenueBreakdown?.subscriptions?.percentage || 0)}
                  strokeColor={colors.primary.gradient}
                  strokeWidth={14}
                  showInfo={false}
                />
                <Text style={{ fontSize: '13px', display: 'block', marginTop: spacing[1], color: colors.text.tertiary }}>
                  Total: <Text strong style={{ color: colors.text.secondary }}>INR {Number(revenueData?.revenueBreakdown?.subscriptions?.amount || 0).toLocaleString()}</Text>
                </Text>
              </div>

              <div style={{ marginBottom: spacing[6] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                  <Space direction="horizontal">
                    <Wallet size={14} style={{ color: colors.success.solid }} />
                    <Text strong style={{ color: colors.text.secondary }}>Deal Commissions</Text>
                  </Space>
                  <Text strong style={{ color: colors.text.primary }}>{revenueData?.revenueBreakdown?.dealCommission?.percentage}%</Text>
                </div>
                <Progress
                  percent={Number(revenueData?.revenueBreakdown?.dealCommission?.percentage || 0)}
                  strokeColor={colors.success.solid}
                  strokeWidth={14}
                  showInfo={false}
                />
                <Text style={{ fontSize: '13px', display: 'block', marginTop: spacing[1], color: colors.text.tertiary }}>
                  Total: <Text strong style={{ color: colors.text.secondary }}>INR {Number(revenueData?.revenueBreakdown?.dealCommission?.amount || 0).toLocaleString()}</Text>
                </Text>
              </div>

              <div style={{ background: colors.gray[50], padding: spacing[4], borderRadius: '12px', border: `1px solid ${colors.gray[200]}` }}>
                <h4 style={{ color: colors.text.primary, marginTop: 0, marginBottom: spacing[2] }}>Growth Insights</h4>
                <p style={{ color: colors.text.secondary, marginBottom: 0 }}>
                  Dominant Source: <Text strong style={{ color: colors.primary.solid }}>{Number(revenueData?.revenueBreakdown?.dealCommission?.percentage || 0) > 50 ? 'Deal Commissions' : 'Subscriptions'}</Text>
                  <br />
                  Platform Retention: <Text strong style={{ color: colors.success.solid }}>{Math.round(((revenueData?.subscriptions?.byStatus?.ACTIVE || 0) / (revenueData?.subscriptions?.totalSubscribers || 1)) * 100)}%</Text>
                </p>
              </div>
            </div>
          </CustomCard>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        {/* Subscriber Segmentation */}
        <Col xs={24} lg={12}>
          <CustomCard title="Subscriber Segmentation" style={{ height: '100%' }}>
            <Row align="middle" gutter={24} style={{ padding: '12px 0' }}>
              <Col span={10} style={{ textAlign: 'center', borderRight: `1px solid ${colors.gray[200]}` }}>
                <Title level={1} style={{ margin: 0, color: colors.text.primary, fontWeight: 800 }}>{revenueData?.subscriptions?.totalSubscribers || 0}</Title>
                <Text style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', fontWeight: 800, color: colors.gray[500] }}>Total User Base</Text>
              </Col>
              <Col span={14}>
                <Space direction="vertical" style={{ width: '100%', paddingLeft: '12px' }} size="large">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <Text strong style={{ color: colors.text.secondary, fontSize: '13px' }}>PREMIUM SUBSCRIBERS</Text>
                      <Text strong style={{ color: colors.text.primary }}>{revenueData?.subscriptions?.byPlan?.PREMIUM?.count || 0}</Text>
                    </div>
                    <Progress percent={Math.round(((revenueData?.subscriptions?.byPlan?.PREMIUM?.count || 0) / (revenueData?.subscriptions?.totalSubscribers || 1)) * 100)} strokeColor={colors.warning.solid} showInfo={false} strokeWidth={10} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <Text strong style={{ color: colors.text.secondary, fontSize: '13px' }}>FREE TIER USERS</Text>
                      <Text strong style={{ color: colors.text.primary }}>{revenueData?.subscriptions?.byPlan?.FREE?.count || 0}</Text>
                    </div>
                    <Progress percent={Math.round(((revenueData?.subscriptions?.byPlan?.FREE?.count || 0) / (revenueData?.subscriptions?.totalSubscribers || 1)) * 100)} strokeColor={colors.gray[800]} showInfo={false} strokeWidth={10} />
                  </div>
                </Space>
              </Col>
            </Row>
          </CustomCard>
        </Col>

        {/* Transaction Reliability Indicators */}
        <Col xs={24} lg={12}>
          <CustomCard title="Transaction Reliability" style={{ height: '100%' }}>
            <Row gutter={16}>
              <Col span={8} style={{ textAlign: 'center' }}>
                <CircleMetric
                  icon={<CheckCircle2 size={24} style={{ color: colors.success.solid }} />}
                  label="SUCCESS"
                  value={revenueData?.transactions?.byStatus?.COMPLETED || 0}
                  percent={Math.round(((revenueData?.transactions?.byStatus?.COMPLETED || 0) / (revenueData?.transactions?.totalCount || 1)) * 100)}
                  color={colors.success.solid}
                />
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <CircleMetric
                  icon={<RefreshCw size={24} style={{ color: colors.warning.solid }} />}
                  label="PENDING"
                  value={revenueData?.transactions?.byStatus?.PENDING || 0}
                  percent={Math.round(((revenueData?.transactions?.byStatus?.PENDING || 0) / (revenueData?.transactions?.totalCount || 1)) * 100)}
                  color={colors.warning.solid}
                />
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <CircleMetric
                  icon={<AlertCircle size={24} style={{ color: colors.error.solid }} />}
                  label="FAILED"
                  value={revenueData?.transactions?.byStatus?.FAILED || 0}
                  percent={Math.round(((revenueData?.transactions?.byStatus?.FAILED || 0) / (revenueData?.transactions?.totalCount || 1)) * 100)}
                  color={colors.error.solid}
                />
              </Col>
            </Row>
          </CustomCard>
        </Col>
      </Row>

      <CustomTable
        title={() => <Text strong style={{ color: colors.text.primary, fontSize: '16px' }}>Comprehensive Transaction Logs</Text>}
        dataSource={transactions}
        columns={transactionColumns}
        rowKey={(record) => record.id || record.paymentId}
        pagination={{
          pageSize: 5,
          showTotal: (total) => `Showing ${total} recent transactions`
        }}
        locale={{ emptyText: <Empty description="Zero transactions detected in this period" /> }}
      />
    </div>
  );
};

// Helper component for circle metrics
const CircleMetric = ({ icon, label, value, percent, color }: any) => (
  <div style={{ padding: '8px' }}>
    <Space direction="vertical" align="center" size={0}>
      <div style={{ fontSize: '24px', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>{icon}</div>
      <Text style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', color: colors.gray[500], textTransform: 'uppercase' }}>{label}</Text>
      <Title level={3} style={{ margin: '4px 0 12px 0', color: colors.text.primary, fontWeight: 800 }}>{value}</Title>
      <Progress
        type="circle"
        percent={percent}
        size={60}
        strokeColor={color}
        strokeWidth={10}
        format={(pct) => <span style={{ color: colors.text.primary, fontWeight: 700, fontSize: '12px' }}>{pct}%</span>}
      />
    </Space>
  </div>
);

const MetricCard = ({ title, value, color, prefix, trend, isCurrency = true }: any) => (
  <CustomCard style={{ height: '100%', borderLeft: `4px solid ${color}` }}>
    <Statistic
      title={<Text style={{ color: colors.gray[500], fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</Text>}
      value={value}
      prefix={<span style={{ color, marginRight: spacing[2], display: 'inline-flex', alignItems: 'center' }}>{prefix}</span>}
      valueStyle={{ color: colors.text.primary, fontWeight: 800, fontSize: '24px' }}
      formatter={(val) => isCurrency ? `INR ${Number(val).toLocaleString()}` : Number(val).toLocaleString()}
      suffix={trend && (
        <Tag color="success" style={{ marginLeft: spacing[2], border: 'none', borderRadius: '4px', verticalAlign: 'middle' }}>
          {trend}
        </Tag>
      )}
    />
  </CustomCard>
);

export default AdminRevenue;
