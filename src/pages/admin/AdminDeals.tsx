// ===========================================
// ADMIN DEALS MANAGEMENT
// ===========================================

import { useEffect, useState } from 'react';
import { Table, Tag, Card, Select, Spin, Empty, Space, Statistic, Row, Col, Typography, Progress, List, Avatar, Divider, message } from 'antd';
import {
  DollarOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  ShopOutlined,
  CrownOutlined,
  TrophyOutlined,
  HistoryOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  FieldTimeOutlined,
  PercentageOutlined
} from '@ant-design/icons';
import { adminApi } from '../../services/api';
import '../../styles/AdminPanel.css';

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
          <Text style={{ fontSize: '12px', color: '#475569' }}>Started: {new Date(record.startDate).toLocaleDateString()}</Text>
          {record.completedAt && <Text style={{ fontSize: '12px', color: '#10B981' }}>Done: {new Date(record.completedAt).toLocaleDateString()}</Text>}
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
        <div>
          <h2 className="admin-hero-title">Deal Ecosystem</h2>
          <p className="admin-hero-subtitle">Visualizing platform collaborations, performance metrics, and growth.</p>
        </div>
        <Select
          placeholder="Filter Status"
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          style={{ width: 160 }}
          className="admin-pill-select"
          allowClear
        >
          <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
          <Select.Option value="COMPLETED">Completed</Select.Option>
          <Select.Option value="CANCELLED">Cancelled</Select.Option>
          <Select.Option value="DISPUTED">Disputed</Select.Option>
        </Select>
      </div>

      {/* Primary Metrics Layer */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Total Deal Volume"
            value={`INR ${Number(metrics.totalDealValue || 0).toLocaleString()}`}
            icon={<DollarOutlined />}
            color="#6366F1"
            subtitle="Gross contract value"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Platform Revenue"
            value={`INR ${Number(metrics.totalPlatformRevenue || 0).toLocaleString()}`}
            icon={<ThunderboltOutlined />}
            color="#10B981"
            subtitle="Commission earnings"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Average Deal Size"
            value={`INR ${Number(metrics.averageDealSize || 0).toLocaleString()}`}
            icon={<LineChartOutlined />}
            color="#F59E0B"
            subtitle="Per collaboration"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Deal Success Rate"
            value={`${metrics.successRate || 0}%`}
            icon={<PercentageOutlined />}
            color="#EC4899"
            subtitle="Completion frequency"
          />
        </Col>
      </Row>

      {/* Engagement Analytics layer */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }} align="stretch">
        <Col xs={24} lg={16}>
          <Card className="admin-card" title={<Text strong style={{ color: '#0F172A' }}>Engagement Deep-Dive</Text>} style={{ height: '100%' }}>
            <Row gutter={48}>
              <Col span={12}>
                <Divider orientation="left"><Text strong style={{ color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>PARTICIPATION</Text></Divider>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic title="Active Companies" value={analytics.activeCompanies} prefix={<ShopOutlined />} valueStyle={{ color: '#0F172A', fontWeight: 800 }} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="Active Creators" value={analytics.activeCreators} prefix={<TeamOutlined />} valueStyle={{ color: '#0F172A', fontWeight: 800 }} />
                  </Col>
                </Row>
              </Col>
              <Col span={12} style={{ borderLeft: '1px solid #E2E8F0' }}>
                <Divider orientation="left"><Text strong style={{ color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>VELOCITY</Text></Divider>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <Text style={{ color: '#475569' }}>Avg Completion Time</Text>
                  <Text strong style={{ color: '#0F172A' }}>{metrics.averageCompletionDays} Days</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#475569' }}>Avg Deals / Company</Text>
                  <Text strong style={{ color: '#0F172A' }}>{analytics.avgDealsPerCompany}</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="admin-card" title={<Text strong style={{ color: '#0F172A' }}>Status Integrity</Text>} style={{ height: '100%' }}>
            <div style={{ padding: '4px 0' }}>
              <StatusRow label="COMPLETED" count={statusDist.COMPLETED?.count} pct={statusDist.COMPLETED?.percentage} color="#10B981" />
              <StatusRow label="IN PROGRESS" count={statusDist.IN_PROGRESS?.count} pct={statusDist.IN_PROGRESS?.percentage} color="#6366F1" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                <Text style={{ fontSize: '12px', color: '#64748B' }}>Cancelled/Disputed</Text>
                <Text strong style={{ fontSize: '12px', color: '#EF4444' }}>{Number(statusDist.CANCELLED?.count || 0) + Number(statusDist.DISPUTED?.count || 0)} Deals</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Trends layer */}
      <Card className="admin-card" title={<Text strong style={{ color: '#0F172A' }}>Monthly Growth Timeline</Text>} style={{ marginBottom: '24px' }}>
        <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '8px' }}>
          <List
            itemLayout="horizontal"
            dataSource={trends}
            renderItem={(item: any) => (
              <List.Item extra={<Text strong style={{ color: '#0F172A', fontSize: '18px' }}>INR {Number(item.revenue).toLocaleString()}</Text>}>
                <List.Item.Meta
                  avatar={<Avatar icon={<HistoryOutlined />} style={{ background: '#F1F5F9', color: '#6366F1', borderRadius: '10px' }} />}
                  title={<Text strong style={{ color: '#0F172A' }}>{item.month}</Text>}
                  description={<Text style={{ color: '#64748B' }}>{item.completed} Deals Finalized • {item.created} Initiated this month</Text>}
                />
              </List.Item>
            )}
          />
        </div>
      </Card>

      {/* Top Performers Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }} align="stretch">
        <Col xs={24} lg={8}>
          <Card className="admin-card" title={<Text strong style={{ color: '#0F172A' }}>Top Companies</Text>} style={{ height: '100%' }}>
            <List
              dataSource={topPerformers.companies || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<ShopOutlined />} style={{ background: '#ECFDF5', color: '#10B981' }} />}
                    title={<Text strong style={{ color: '#0F172A' }}>{item.name}</Text>}
                    description={<Text style={{ color: '#64748B', fontSize: '12px' }}>{item.dealCount} Deals • INR {Number(item.totalValue).toLocaleString()}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="admin-card" title={<Text strong style={{ color: '#0F172A' }}>Top creators (Earnings)</Text>} style={{ height: '100%' }}>
            <List
              dataSource={topPerformers.creatorsByEarnings || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<CrownOutlined />} style={{ background: '#FFFBEB', color: '#D97706' }} />}
                    title={<Text strong style={{ color: '#0F172A' }}>{item.name}</Text>}
                    description={<Text style={{ color: '#64748B', fontSize: '12px' }}>INR {Number(item.earnings).toLocaleString()} Earnings</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="admin-card" title={<Text strong style={{ color: '#0F172A' }}>Top creators (Deals)</Text>} style={{ height: '100%' }}>
            <List
              dataSource={topPerformers.creatorsByDeals || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<TrophyOutlined />} style={{ background: '#EEF2FF', color: '#6366F1' }} />}
                    title={<Text strong style={{ color: '#0F172A' }}>{item.name}</Text>}
                    description={<Text style={{ color: '#64748B', fontSize: '12px' }}>{item.dealCount} Deals • INR {Number(item.totalEarnings).toLocaleString()}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Transaction Logs */}
      <Card className="admin-card admin-table" title={<Text strong style={{ color: '#0F172A' }}>System-Wide Deal Logs</Text>}>
        <Table
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
      </Card>
    </div>
  );
};

// --- Sub-components ---

const MetricCard = ({ title, value, icon, color, subtitle }: any) => (
  <Card className="admin-card" style={{ height: '100%', borderLeft: `6px solid ${color}` }}>
    <Statistic
      title={<Text style={{ color: '#64748B', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</Text>}
      value={value}
      prefix={<span style={{ color, marginRight: '10px' }}>{icon}</span>}
      valueStyle={{ color: '#0F172A', fontWeight: 800, fontSize: '24px' }}
    />
    <Text style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>{subtitle}</Text>
  </Card>
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
