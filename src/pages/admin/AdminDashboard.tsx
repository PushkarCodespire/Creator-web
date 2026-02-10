// ===========================================
// ADMIN DASHBOARD
// ===========================================

import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, Tag, Typography, Button, Space, List, Avatar, Divider, Progress, Tabs } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  MessageOutlined,
  DollarOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import DashboardContentLoader from '../../components/common/DashboardContentLoader';
import '../../styles/AdminPanel.css';

const { Text, Title } = Typography;

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminApi.getStats();
      setDashboardData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboardData) {
    return <DashboardContentLoader />;
  }

  const overview = dashboardData?.overview || {};
  const growth = dashboardData?.growth?.weekly || [];
  const topPerformers = dashboardData?.topPerformers || {};
  const engagement = dashboardData?.engagement || {};
  const recentActivity = dashboardData?.recentActivity || {};
  const kpis = dashboardData?.kpis || {};

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div>
          <h2 className="admin-hero-title">Platform Intelligence</h2>
          <p className="admin-hero-subtitle">Analytics, engagement, and operational oversight in real-time.</p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Total Users"
            value={overview.totalUsers}
            icon={<UserOutlined />}
            color="#6366F1"
            onClick={() => navigate('/admin/users')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Creators"
            value={overview.totalCreators}
            icon={<TeamOutlined />}
            color="#10B981"
            onClick={() => navigate('/admin/creators')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Partner Companies"
            value={overview.totalCompanies}
            icon={<ShopOutlined />}
            color="#F59E0B"
            onClick={() => navigate('/admin/companies')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Total Revenue"
            value={`₹${(overview.totalRevenue || dashboardData?.revenue?.total || 0).toLocaleString()}`}
            icon={<DollarOutlined />}
            color="#8B5CF6"
            onClick={() => navigate('/admin/revenue')}
          />
        </Col>
      </Row>

      {/* Engagement & KPI Layer */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }} align="stretch">
        <Col xs={24} lg={16}>
          <Card className="admin-card" title={<Text strong style={{ color: '#0F172A' }}>Strategic KPIs</Text>} style={{ height: '100%' }}>
            <Row gutter={48}>
              <Col span={8}>
                <Statistic
                  title="Platform Health"
                  value={kpis.platformHealthScore}
                  suffix="/ 100"
                  valueStyle={{ color: '#10B981', fontWeight: 800 }}
                />
                <Progress percent={kpis.platformHealthScore} strokeColor="#10B981" size="small" showInfo={false} />
              </Col>
              <Col span={8} style={{ borderLeft: '1px solid #E2E8F0' }}>
                <Statistic
                  title="Creator Engagement"
                  value={engagement.creatorEngagementRate}
                  suffix="%"
                  valueStyle={{ color: '#6366F1', fontWeight: 800 }}
                />
                <Text type="secondary" style={{ fontSize: '11px' }}>{engagement.totalEngagedCreators} creators active</Text>
              </Col>
              <Col span={8} style={{ borderLeft: '1px solid #E2E8F0' }}>
                <Statistic
                  title="Avg Deal Value"
                  value={kpis.avgDealValue}
                  prefix="₹"
                  valueStyle={{ color: '#F59E0B', fontWeight: 800 }}
                />
                <Text type="secondary" style={{ fontSize: '11px' }}>Across all segments</Text>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="admin-card admin-card-promo" style={{ height: '100%', border: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' }}>
            <Space direction="vertical" size="middle">
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px', width: 'fit-content' }}>
                <ThunderboltOutlined style={{ color: '#fff', fontSize: '24px' }} />
              </div>
              <Title level={4} style={{ color: '#ffffff', margin: 0 }}>Active Deals Monitoring</Title>
              <Text style={{ color: '#ffffff', fontWeight: 600, opacity: 0.9 }}>Instant access to all ongoing platform collaborations and status tracking.</Text>
              <Button type="primary" size="large" onClick={() => navigate('/admin/deals')} style={{ background: '#ffffff', color: '#6366F1', border: 'none', fontWeight: 800 }}>
                Manage {overview.activeDeals || 0} Deals <ArrowRightOutlined />
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Top Performers Grid */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }} align="stretch">
        <Col xs={24} md={8}>
          <Card className="admin-card" title={<Text strong style={{ color: '#0F172A' }}>Top Creators</Text>} style={{ height: '100%' }}>
            <List
              dataSource={topPerformers.creators || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: '#F1F5F9', color: '#6366F1' }}>{item.name[0]}</Avatar>}
                    title={<Text strong style={{ color: '#0F172A' }}>{item.name}</Text>}
                    description={<Text style={{ fontSize: '12px', color: '#10B981' }}>₹{Number(item.earnings).toLocaleString()}</Text>}
                  />
                  <Tag color="blue">{item.dealCount} Deals</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="admin-card" title={<Text strong style={{ color: '#0F172A' }}>Market Leaders</Text>} style={{ height: '100%' }}>
            <List
              dataSource={topPerformers.companies || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<ShopOutlined />} style={{ backgroundColor: '#F1F5F9', color: '#F59E0B' }} />}
                    title={<Text strong style={{ color: '#0F172A' }}>{item.name}</Text>}
                    description={<Text style={{ fontSize: '12px', color: '#64748B' }}>{item.dealCount} Active Collaborations</Text>}
                  />
                  <Text strong style={{ color: '#0F172A' }}>₹{Number(item.totalValue).toLocaleString()}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="admin-card" title={<Text strong style={{ color: '#0F172A' }}>Top Engaged Users</Text>} style={{ height: '100%' }}>
            <List
              dataSource={topPerformers.activeUsers || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: '#F1F5F9', color: '#EC4899' }}>{item.name[0]}</Avatar>}
                    title={<Text strong style={{ color: '#0F172A' }}>{item.name}</Text>}
                    description={<Text style={{ fontSize: '12px', color: '#64748B' }}>{item.email}</Text>}
                  />
                  <Badge count={item.messageCount} color="#6366F1" />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Growth Trends & Activity Layer */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }} align="stretch">
        <Col xs={24} lg={12}>
          <Card className="admin-card" title={<Text strong style={{ color: '#0F172A' }}>Platform Growth Velocity</Text>} style={{ height: '100%' }}>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <List
                itemLayout="horizontal"
                dataSource={Array.from(growth).reverse()}
                renderItem={(item: any) => (
                  <List.Item extra={<Tag color="success">+{item.deals} Deals</Tag>}>
                    <List.Item.Meta
                      avatar={<Avatar icon={<RiseOutlined />} style={{ background: '#ECFDF5', color: '#10B981' }} />}
                      title={<Text strong style={{ color: '#0F172A' }}>{item.week} Performance</Text>}
                      description={<Text style={{ color: '#64748B' }}>{item.users} users • {item.creators} creators • {item.companies} partners</Text>}
                    />
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="admin-card" title={<Text strong style={{ color: '#0F172A' }}>System Activity Audit</Text>} style={{ height: '100%' }}>
            <Tabs defaultActiveKey="1" items={[
              {
                key: '1',
                label: 'Recent Deals',
                children: (
                  <List
                    size="small"
                    dataSource={recentActivity.deals || []}
                    renderItem={(item: any) => (
                      <List.Item>
                        <Space direction="vertical" size={0}>
                          <Text strong style={{ color: '#0F172A' }}>{item.company} & {item.creator}</Text>
                          <Text style={{ fontSize: '11px', color: '#94A3B8' }}>{new Date(item.createdAt).toLocaleString()}</Text>
                        </Space>
                        <Text strong style={{ color: '#10B981' }}>₹{Number(item.amount).toLocaleString()}</Text>
                      </List.Item>
                    )}
                  />
                )
              },
              {
                key: '2',
                label: 'New Signups',
                children: (
                  <List
                    size="small"
                    dataSource={recentActivity.users || []}
                    renderItem={(item: any) => (
                      <List.Item>
                        <Space direction="vertical" size={0}>
                          <Text strong style={{ color: '#0F172A' }}>{item.name}</Text>
                          <Text style={{ fontSize: '11px', color: '#94A3B8' }}>{item.email} • {item.role}</Text>
                        </Space>
                        <Tag style={{ borderRadius: '4px' }}>{new Date(item.createdAt).toLocaleDateString()}</Tag>
                      </List.Item>
                    )}
                  />
                )
              },
              {
                key: '3',
                label: 'Verifications',
                children: (
                  <List
                    size="small"
                    dataSource={recentActivity.verifications || []}
                    renderItem={(item: any) => (
                      <List.Item>
                        <Space align="center">
                          <CheckCircleOutlined style={{ color: '#10B981' }} />
                          <Text strong style={{ color: '#0F172A' }}>{item.displayName}</Text>
                        </Space>
                        <Text style={{ fontSize: '11px', color: '#64748B' }}>Verified on {new Date(item.verifiedAt).toLocaleDateString()}</Text>
                      </List.Item>
                    )}
                  />
                )
              }
            ]} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// --- Helper Components ---

const MetricCard = ({ title, value, icon, color, onClick }: any) => (
  <Card
    className="admin-card admin-stat-card-clickable"
    onClick={onClick}
    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
    hoverable
  >
    <Statistic
      title={<Text style={{ color: '#64748B', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</Text>}
      value={value}
      prefix={<span style={{ color, marginRight: '10px' }}>{icon}</span>}
      valueStyle={{ color: '#0F172A', fontWeight: 800, fontSize: '24px' }}
    />
    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', color: '#6366F1', fontSize: '11px', fontWeight: 600 }}>
      View Detailed Report <ArrowRightOutlined style={{ marginLeft: '4px', fontSize: '10px' }} />
    </div>
  </Card>
);

const Badge = ({ count, color }: any) => (
  <span style={{
    backgroundColor: color,
    borderRadius: '10px',
    padding: '2px 8px',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 700
  }}>{count} MSGS</span>
);

export default AdminDashboard;
