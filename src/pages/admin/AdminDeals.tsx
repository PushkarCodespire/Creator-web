// ===========================================
// ADMIN DEALS MANAGEMENT
// ===========================================

import { useEffect, useState } from 'react';
import { Table, Tag, Card, Select, Spin, Empty, Space, Statistic, Row, Col, Typography, Progress, List, Avatar, Divider, message } from 'antd';
import {
  CircleDollarSign,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Users,
  Building,
  Crown,
  Trophy,
  History,
  TrendingUp,
  Zap,
  Clock,
  Percent,
  ChevronRight,
  TrendingUp as LineChart
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { colors, spacing, typography, shadows } from '../../styles/tokens';
import CustomTable from '../../components/common/Table/CustomTable';
import CustomCard from '../../components/common/Card/CustomCard';
import CustomButton from '../../components/common/Button/CustomButton';

const { Text, Title, Paragraph } = Typography;

const AdminDeals = () => {
  const [loading, setLoading] = useState(true);
  const [dealsData, setDealsData] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchDeals();
  }, [statusFilter, pagination.current, pagination.pageSize]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDeals({
        status: statusFilter,
        page: pagination.current,
        limit: pagination.pageSize
      });

      const data = response.data.data;
      setDealsData(data);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0
      }));
    } catch (err) {
      console.error('Failed to fetch deals:', err);
      message.error('Failed to load deals data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'blue';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      case 'DISPUTED': return 'orange';
      default: return 'default';
    }
  };

  const dealColumns = [
    {
      title: 'Deal Details',
      key: 'details',
      render: (record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#0F172A' }}>{record.company?.companyName}</Text>
          <Text type="secondary" style={{ fontSize: '11px', color: '#64748B' }}>{record.creator?.displayName}</Text>
        </Space>
      )
    },
    {
      title: 'Value',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string) => <Text strong style={{ color: '#10B981' }}>INR {Number(amount).toLocaleString()}</Text>
    },
    {
      title: 'Platform Fee',
      dataIndex: 'platformFee',
      key: 'platformFee',
      render: (fee: string) => <Text style={{ color: '#6366F1' }}>INR {Number(fee).toLocaleString()}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ borderRadius: '6px', fontWeight: 600 }}>
          {status.replace('_', ' ')}
        </Tag>
      )
    },
    {
      title: 'Timeline',
      key: 'timeline',
      render: (record: any) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '12px', color: colors.text.tertiary }}>Started: {new Date(record.startDate).toLocaleDateString()}</Text>
          {record.completedAt && <Text style={{ fontSize: '12px', color: colors.success.solid }}>Done: {new Date(record.completedAt).toLocaleDateString()}</Text>}
        </Space>
      )
    }
  ];

  if (loading && !dealsData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--admin-bg)' }}>
        <Spin size="large" tip="Processing ecosystem data..." />
      </div>
    );
  }

  const metrics = dealsData?.metrics || {};
  const statusDist = dealsData?.statusDistribution || {};
  const topPerformers = dealsData?.topPerformers || {};
  const analytics = dealsData?.analytics || {};
  const trends = dealsData?.trends?.monthly || [];

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
            Deal Ecosystem
          </h1>
          <p style={{ fontSize: typography.fontSize.lg, color: colors.text.secondary }}>
            Visualizing platform collaborations, performance metrics, and growth.
          </p>
        </div>
        <Select
          placeholder="Filter Status"
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          style={{ width: 180, height: '40px' }}
          allowClear
        >
          <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
          <Select.Option value="COMPLETED">Completed</Select.Option>
          <Select.Option value="CANCELLED">Cancelled</Select.Option>
          <Select.Option value="DISPUTED">Disputed</Select.Option>
        </Select>
      </div>

      {/* Primary Metrics Layer */}
      <Row gutter={[24, 24]} style={{ marginBottom: spacing[6] }}>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Total Deal Volume"
            value={`INR ${Number(metrics.totalDealValue || 0).toLocaleString()}`}
            icon={<CircleDollarSign size={20} />}
            color={colors.primary.solid}
            subtitle="Gross contract value"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Platform Revenue"
            value={`INR ${Number(metrics.totalPlatformRevenue || 0).toLocaleString()}`}
            icon={<Zap size={20} />}
            color={colors.success.solid}
            subtitle="Commission earnings"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Average Deal Size"
            value={`INR ${Number(metrics.averageDealSize || 0).toLocaleString()}`}
            icon={<LineChart size={20} />}
            color={colors.warning.solid}
            subtitle="Per collaboration"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Deal Success Rate"
            value={`${metrics.successRate || 0}%`}
            icon={<Percent size={20} />}
            color={colors.orange}
            subtitle="Completion frequency"
          />
        </Col>
      </Row>

      {/* Engagement Analytics layer */}
      <Row gutter={[24, 24]} style={{ marginBottom: spacing[6] }} align="stretch">
        <Col xs={24} lg={16}>
          <CustomCard title="Engagement Deep-Dive" style={{ height: '100%' }}>
            <Row gutter={48}>
              <Col span={12}>
                <Divider orientation="left"><Text strong style={{ color: colors.gray[500], fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Participation</Text></Divider>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic title="Active Companies" value={analytics.activeCompanies} prefix={<Building size={16} />} valueStyle={{ color: colors.text.primary, fontWeight: 800 }} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="Active Creators" value={analytics.activeCreators} prefix={<Users size={16} />} valueStyle={{ color: colors.text.primary, fontWeight: 800 }} />
                  </Col>
                </Row>
              </Col>
              <Col span={12} style={{ borderLeft: `1px solid ${colors.gray[200]}` }}>
                <Divider orientation="left"><Text strong style={{ color: colors.gray[500], fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Velocity</Text></Divider>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <Text style={{ color: colors.text.tertiary }}>Avg Completion Time</Text>
                  <Text strong style={{ color: colors.text.primary }}>{metrics.averageCompletionDays} Days</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.text.tertiary }}>Avg Deals / Company</Text>
                  <Text strong style={{ color: colors.text.primary }}>{analytics.avgDealsPerCompany}</Text>
                </div>
              </Col>
            </Row>
          </CustomCard>
        </Col>
        <Col xs={24} lg={8}>
          <CustomCard title="Status Integrity" style={{ height: '100%' }}>
            <div style={{ padding: '4px 0' }}>
              <StatusRow label="COMPLETED" count={statusDist.COMPLETED?.count} pct={statusDist.COMPLETED?.percentage} color={colors.success.solid} />
              <StatusRow label="IN PROGRESS" count={statusDist.IN_PROGRESS?.count} pct={statusDist.IN_PROGRESS?.percentage} color={colors.primary.solid} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                <Text style={{ fontSize: '12px', color: colors.text.tertiary }}>Cancelled/Disputed</Text>
                <Text strong style={{ fontSize: '12px', color: colors.error.solid }}>{Number(statusDist.CANCELLED?.count || 0) + Number(statusDist.DISPUTED?.count || 0)} Deals</Text>
              </div>
            </div>
          </CustomCard>
        </Col>
      </Row>

      {/* Trends layer */}
      <CustomCard title="Monthly Growth Timeline" style={{ marginBottom: spacing[6] }}>
        <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '8px' }}>
          <List
            itemLayout="horizontal"
            dataSource={trends}
            renderItem={(item: any) => (
              <List.Item extra={<Text strong style={{ color: colors.text.primary, fontSize: '18px' }}>INR {Number(item.revenue).toLocaleString()}</Text>}>
                <List.Item.Meta
                  avatar={<Avatar icon={<History size={16} />} style={{ background: colors.gray[100], color: colors.primary.solid, borderRadius: '10px' }} />}
                  title={<Text strong style={{ color: colors.text.primary }}>{item.month}</Text>}
                  description={<Text style={{ color: colors.text.tertiary }}>{item.completed} Deals Finalized • {item.created} Initiated this month</Text>}
                />
              </List.Item>
            )}
          />
        </div>
      </CustomCard>

      {/* Top Performers Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: spacing[6] }} align="stretch">
        <Col xs={24} lg={8}>
          <CustomCard title="Top Companies" style={{ height: '100%' }}>
            <List
              dataSource={topPerformers.companies || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<Building size={16} />} style={{ background: colors.success.subtle, color: colors.success.solid }} />}
                    title={<Text strong style={{ color: colors.text.primary }}>{item.name}</Text>}
                    description={<Text style={{ color: colors.text.tertiary, fontSize: '12px' }}>{item.dealCount} Deals • INR {Number(item.totalValue).toLocaleString()}</Text>}
                  />
                </List.Item>
              )}
            />
          </CustomCard>
        </Col>
        <Col xs={24} lg={8}>
          <CustomCard title="Top Creators (Earnings)" style={{ height: '100%' }}>
            <List
              dataSource={topPerformers.creatorsByEarnings || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<Crown size={16} />} style={{ background: '#FFFBEB', color: '#D97706' }} />}
                    title={<Text strong style={{ color: colors.text.primary }}>{item.name}</Text>}
                    description={<Text style={{ color: colors.text.tertiary, fontSize: '12px' }}>INR {Number(item.earnings).toLocaleString()} Earnings</Text>}
                  />
                </List.Item>
              )}
            />
          </CustomCard>
        </Col>
        <Col xs={24} lg={8}>
          <CustomCard title="Top Creators (Deals)" style={{ height: '100%' }}>
            <List
              dataSource={topPerformers.creatorsByDeals || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<Trophy size={16} />} style={{ background: '#EEF2FF', color: colors.primary.solid }} />}
                    title={<Text strong style={{ color: colors.text.primary }}>{item.name}</Text>}
                    description={<Text style={{ color: colors.text.tertiary, fontSize: '12px' }}>{item.dealCount} Deals • INR {Number(item.totalEarnings).toLocaleString()}</Text>}
                  />
                </List.Item>
              )}
            />
          </CustomCard>
        </Col>
      </Row>

      {/* Transaction Logs */}
      <CustomTable
        title={() => <Text strong style={{ color: colors.text.primary, fontSize: '16px' }}>System-Wide Deal Logs</Text>}
        dataSource={dealsData.deals || []}
        columns={dealColumns}
        rowKey="id"
        pagination={{
          ...pagination,
          pageSizeOptions: ['5', '10', '20'],
          showSizeChanger: true,
          showTotal: (total) => `Audit revealing ${total} deal records`
        }}
        scroll={{ x: 800 }}
        onChange={(newPagination) => {
          setPagination({
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 10,
            total: pagination.total
          });
        }}
      />
    </div>
  );
};

// --- Sub-components ---

const MetricCard = ({ title, value, icon, color, subtitle }: any) => (
  <CustomCard style={{ height: '100%', borderLeft: `4px solid ${color}` }}>
    <Statistic
      title={<Text style={{ color: colors.gray[500], fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</Text>}
      value={value}
      prefix={<span style={{ color, marginRight: spacing[2], display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      valueStyle={{ color: colors.text.primary, fontWeight: 800, fontSize: '28px' }}
    />
    <Text style={{ fontSize: '12px', color: colors.text.tertiary, fontWeight: 600 }}>{subtitle}</Text>
  </CustomCard>
);

const StatusRow = ({ label, count, pct, color }: any) => (
  <div style={{ marginBottom: '18px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
      <Text strong style={{ color: '#475569', fontSize: '12px' }}>{label}</Text>
      <Text strong style={{ color: '#0F172A' }}>{count || 0} ({pct || 0}%)</Text>
    </div>
    <Progress
      percent={Number(pct)}
      strokeColor={color}
      showInfo={false}
      strokeWidth={12}
      trailColor="#F1F5F9"
    />
  </div>
);

export default AdminDeals;
