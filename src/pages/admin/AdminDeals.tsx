// ===========================================
// ADMIN DEALS MANAGEMENT
// ===========================================

import { useEffect, useState } from 'react';
import { Tag, Select, Spin, Space, Statistic, Row, Col, Typography, Progress, List, Avatar, Divider, message } from 'antd';
import { CircleDollarSign, RefreshCw, Users, Building, Crown, Trophy, History, Zap, Percent, ArrowRight, TrendingUp as LineChart } from 'lucide-react';
import { adminApi } from '../../services/api';
import { colors, spacing, shadows } from '../../styles/tokens';
import { logger } from '../../utils/logger';
import CustomTable from '../../components/common/Table/CustomTable';
import CustomCard from '../../components/common/Card/CustomCard';
import CustomButton from '../../components/common/Button/CustomButton';

const { Text, Title, Paragraph } = Typography;

const AdminDeals = () => {
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dealsData, setDealsData] = useState<Record<string, any> | null>(null);
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
      logger.error('Failed to fetch deals:', err);
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
      render: (record: { company?: { companyName: string }; creator?: { displayName: string } }) => (
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
      render: (record: { startDate: string; completedAt?: string }) => (
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
      <div className="admin-hero">
        <h1 className="admin-hero-title">Deal Ecosystem</h1>
        <p className="admin-hero-subtitle">Visualizing platform collaborations, performance metrics, and growth.</p>
      </div>

      <div className="admin-toolbar">
        <div style={{ color: colors.text.tertiary, fontWeight: 600 }}>
          Manage and track all brand collaborations
        </div>
        <Space wrap>
          <Select
            placeholder="Filter Status"
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            style={{ width: 180 }}
            allowClear
            options={[
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Cancelled', value: 'CANCELLED' },
              { label: 'Disputed', value: 'DISPUTED' }
            ]}
          />
          <CustomButton
            variant="secondary"
            onClick={() => {
              setStatusFilter(undefined);
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            style={{ height: '44px' }}
          >
            <RefreshCw size={16} /> Reset
          </CustomButton>
        </Space>
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
          <CustomCard title={<span style={{ color: colors.text.primary }}>Engagement Deep-Dive</span>} style={{ height: '100%' }}>
            <Row gutter={48}>
              <Col span={12}>
                <Divider orientation="left"><Text strong style={{ color: colors.gray[500], fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Participation</Text></Divider>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic title={<span style={{ color: colors.text.tertiary }}>Active Companies</span>} value={analytics.activeCompanies} prefix={<Building size={16} />} valueStyle={{ color: colors.text.primary, fontWeight: 800 }} />
                  </Col>
                  <Col span={12}>
                    <Statistic title={<span style={{ color: colors.text.tertiary }}>Active Creators</span>} value={analytics.activeCreators} prefix={<Users size={16} />} valueStyle={{ color: colors.text.primary, fontWeight: 800 }} />
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
          <CustomCard title={<span style={{ color: colors.text.primary }}>Status Integrity</span>} style={{ height: '100%' }}>
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
            renderItem={(item: { month: string; revenue: number; completed: number; created: number }) => (
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
              renderItem={(item: { name: string; dealCount: number; totalValue: number }) => (
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
              renderItem={(item: { name: string; earnings: number }) => (
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
              renderItem={(item: { name: string; dealCount: number; totalEarnings: number }) => (
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
        dataSource={dealsData?.deals || []}
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

const MetricCard = ({ title, value, icon, color, subtitle }: { title: string; value: string; icon: React.ReactNode; color: string; subtitle?: string }) => (
  <CustomCard hoverable style={{ height: '100%', borderRadius: '16px', border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div style={{
        background: `${color}15`,
        color: color,
        padding: '10px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div style={{ background: colors.success.subtle, color: colors.success.solid, fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px' }}>
        ACTIVE
      </div>
    </div>
    <Statistic
      title={<Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</Text>}
      value={value}
      valueStyle={{ color: colors.text.primary, fontWeight: 900, fontSize: '28px' }}
    />
    <div style={{
      marginTop: spacing[4],
      paddingTop: spacing[4],
      borderTop: `1px solid ${colors.gray[50]}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <Text style={{ fontSize: '12px', color: colors.text.tertiary, fontWeight: 600 }}>{subtitle || 'Deal Intelligence'}</Text>
      <ArrowRight size={14} style={{ color: colors.primary.solid }} />
    </div>
  </CustomCard>
);

const StatusRow = ({ label, count, pct, color }: { label: string; count?: number; pct?: number; color: string }) => (
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
