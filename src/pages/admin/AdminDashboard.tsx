// ===========================================
// ADMIN DASHBOARD
// ===========================================

import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, Tag, Typography, Button, Space, List, Avatar, Divider, Progress, Tabs } from 'antd';
import {
  Users,
  User,
  MessageSquare,
  CircleDollarSign,
  Store,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Zap,
  LayoutDashboard
} from 'lucide-react';
import { colors, spacing, shadows, typography } from '../../styles/tokens';
import CustomCard from '../../components/common/Card/CustomCard';
import CustomButton from '../../components/common/Button/CustomButton';
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
      <div style={{ marginBottom: spacing[6] }}>
        <h1 style={{
          fontSize: typography.fontSize['4xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          letterSpacing: '-0.02em',
          marginBottom: spacing[1]
        }}>
          Platform Intelligence
        </h1>
        <p style={{ fontSize: typography.fontSize.lg, color: colors.text.secondary }}>
          Analytics, engagement, and operational oversight in real-time.
        </p>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: spacing[6] }}>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Total Users"
            value={overview.totalUsers}
            icon={<User size={20} />}
            color={colors.primary.solid}
            onClick={() => navigate('/admin/users')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Creators"
            value={overview.totalCreators}
            icon={<Users size={20} />}
            color={colors.success.solid}
            onClick={() => navigate('/admin/creators')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Partner Companies"
            value={overview.totalCompanies}
            icon={<Store size={20} />}
            color={colors.warning.solid}
            onClick={() => navigate('/admin/companies')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Total Revenue"
            value={`₹${(overview.totalRevenue || dashboardData?.revenue?.total || 0).toLocaleString()}`}
            icon={<CircleDollarSign size={20} />}
            color={colors.purple || '#8B5CF6'}
            onClick={() => navigate('/admin/revenue')}
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: spacing[6] }} align="stretch">
        <Col xs={24} lg={16}>
          <CustomCard title="Strategic KPIs" style={{ height: '100%' }}>
            <Row gutter={48}>
              <Col span={8}>
                <Statistic
                  title="Platform Health"
                  value={kpis.platformHealthScore}
                  suffix="/ 100"
                  valueStyle={{ color: colors.success.solid, fontWeight: 800 }}
                />
                <Progress percent={kpis.platformHealthScore} strokeColor={colors.success.solid} size="small" showInfo={false} />
              </Col>
              <Col span={8} style={{ borderLeft: `1px solid ${colors.gray[200]}` }}>
                <Statistic
                  title="Creator Engagement"
                  value={engagement.creatorEngagementRate}
                  suffix="%"
                  valueStyle={{ color: colors.primary.solid, fontWeight: 800 }}
                />
                <Text type="secondary" style={{ fontSize: '11px' }}>{engagement.totalEngagedCreators} creators active</Text>
              </Col>
              <Col span={8} style={{ borderLeft: `1px solid ${colors.gray[200]}` }}>
                <Statistic
                  title="Avg Deal Value"
                  value={kpis.avgDealValue}
                  prefix="₹"
                  valueStyle={{ color: colors.warning.solid, fontWeight: 800 }}
                />
                <Text type="secondary" style={{ fontSize: '11px' }}>Across all segments</Text>
              </Col>
            </Row>
          </CustomCard>
        </Col>
        <Col xs={24} lg={8}>
          <CustomCard style={{ height: '100%', border: 'none', background: colors.primary.gradient }}>
            <Space direction="vertical" size="middle">
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: spacing[3], borderRadius: '12px', width: 'fit-content' }}>
                <Zap size={24} color="#fff" />
              </div>
              <h3 style={{ color: '#ffffff', margin: 0, fontSize: typography.fontSize.xl, fontWeight: 700 }}>Active Deals Monitoring</h3>
              <p style={{ color: '#ffffff', fontWeight: 500, opacity: 0.9 }}>Instant access to all ongoing platform collaborations and status tracking.</p>
              <CustomButton
                variant="secondary"
                size="large"
                onClick={() => navigate('/admin/deals')}
                style={{ width: '100%', background: '#ffffff', color: colors.primary.solid, fontWeight: 800 }}
              >
                Manage {overview.activeDeals || 0} Deals <ArrowRight size={16} />
              </CustomButton>
            </Space>
          </CustomCard>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: spacing[6] }} align="stretch">
        <Col xs={24} md={8}>
          <CustomCard title="Top Creators" style={{ height: '100%' }}>
            <List
              dataSource={topPerformers.creators || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: colors.gray[100], color: colors.primary.solid }}>{item.name[0]}</Avatar>}
                    title={<Text strong style={{ color: colors.text.primary }}>{item.name}</Text>}
                    description={<Text style={{ fontSize: '12px', color: colors.success.solid }}>₹{Number(item.earnings).toLocaleString()}</Text>}
                  />
                  <Tag color="blue">{item.dealCount} Deals</Tag>
                </List.Item>
              )}
            />
          </CustomCard>
        </Col>
        <Col xs={24} md={8}>
          <CustomCard title="Market Leaders" style={{ height: '100%' }}>
            <List
              dataSource={topPerformers.companies || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<Store size={14} />} style={{ backgroundColor: colors.gray[100], color: colors.warning.solid }} />}
                    title={<Text strong style={{ color: colors.text.primary }}>{item.name}</Text>}
                    description={<Text style={{ fontSize: '12px', color: colors.text.tertiary }}>{item.dealCount} Active Collaborations</Text>}
                  />
                  <Text strong style={{ color: colors.text.primary }}>₹{Number(item.totalValue).toLocaleString()}</Text>
                </List.Item>
              )}
            />
          </CustomCard>
        </Col>
        <Col xs={24} md={8}>
          <CustomCard title="Top Engaged Users" style={{ height: '100%' }}>
            <List
              dataSource={topPerformers.activeUsers || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: colors.gray[100], color: colors.orange }}>{item.name[0]}</Avatar>}
                    title={<Text strong style={{ color: colors.text.primary }}>{item.name}</Text>}
                    description={<Text style={{ fontSize: '12px', color: colors.text.tertiary }}>{item.email}</Text>}
                  />
                  <Badge count={item.messageCount} color={colors.primary.solid} />
                </List.Item>
              )}
            />
          </CustomCard>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: spacing[6] }} align="stretch">
        <Col xs={24} lg={12}>
          <CustomCard title="Platform Growth Velocity" style={{ height: '100%' }}>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <List
                itemLayout="horizontal"
                dataSource={Array.from(growth).reverse()}
                renderItem={(item: any) => (
                  <List.Item extra={<Tag color="success">+{item.deals} Deals</Tag>}>
                    <List.Item.Meta
                      avatar={<Avatar icon={<TrendingUp size={14} />} style={{ background: colors.success.subtle, color: colors.success.solid }} />}
                      title={<Text strong style={{ color: colors.text.primary }}>{item.week} Performance</Text>}
                      description={<Text style={{ color: colors.text.tertiary }}>{item.users} users • {item.creators} creators • {item.companies} partners</Text>}
                    />
                  </List.Item>
                )}
              />
            </div>
          </CustomCard>
        </Col>
        <Col xs={24} lg={12}>
          <CustomCard title="System Activity Audit" style={{ height: '100%' }}>
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
                          <Text strong style={{ color: colors.text.primary }}>{item.company} & {item.creator}</Text>
                          <Text style={{ fontSize: '11px', color: colors.text.tertiary }}>{new Date(item.createdAt).toLocaleString()}</Text>
                        </Space>
                        <Text strong style={{ color: colors.success.solid }}>₹{Number(item.amount).toLocaleString()}</Text>
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
                          <Text strong style={{ color: colors.text.primary }}>{item.name}</Text>
                          <Text style={{ fontSize: '11px', color: colors.text.tertiary }}>{item.email} • {item.role}</Text>
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
                          <CheckCircle2 size={16} color={colors.success.solid} />
                          <Text strong style={{ color: colors.text.primary }}>{item.displayName}</Text>
                        </Space>
                        <Text style={{ fontSize: '11px', color: colors.text.tertiary }}>Verified on {new Date(item.verifiedAt).toLocaleDateString()}</Text>
                      </List.Item>
                    )}
                  />
                )
              }
            ]} />
          </CustomCard>
        </Col>
      </Row>
    </div>
  );
};

// --- Helper Components ---

const MetricCard = ({ title, value, icon, color, onClick }: any) => (
  <CustomCard
    onClick={onClick}
    hoverable
    style={{ height: '100%' }}
  >
    <Statistic
      title={<Text style={{ color: colors.gray[500], fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</Text>}
      value={value}
      prefix={<span style={{ color, marginRight: spacing[2], display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      valueStyle={{ color: colors.text.primary, fontWeight: 800, fontSize: '28px' }}
    />
    <div style={{ marginTop: spacing[3], display: 'flex', alignItems: 'center', color: colors.primary.solid, fontSize: '13px', fontWeight: 600 }}>
      View Detailed Report <ArrowRight size={14} style={{ marginLeft: spacing[1] }} />
    </div>
  </CustomCard>
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
