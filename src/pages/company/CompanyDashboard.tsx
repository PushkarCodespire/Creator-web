import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, List, Tag, Spin, Button, Avatar, Typography } from 'antd';
import { ShopOutlined, TeamOutlined, DollarOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { companyApi, getImageUrl } from '../../services/api';
import { colors, spacing, shadows, typography, borderRadius } from '../../styles/tokens';

const { Title, Text } = Typography;

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await companyApi.getDashboard();
      setDashboard(response.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  return (
    <div className="company-dashboard fade-in" style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ color: colors.text.primary, marginBottom: '4px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Company Dashboard
        </Title>
        <Text style={{ color: colors.text.tertiary, fontSize: '16px', fontWeight: 500 }}>
          Welcome back, <span style={{ color: colors.primary.solid, fontWeight: 700 }}>{dashboard?.companyName || 'Partner'}</span>
        </Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        {[
          { title: 'Active Opportunities', value: dashboard?.opportunities?.filter((o: any) => o.status === 'OPEN').length || 0, icon: <ShopOutlined />, color: colors.primary.solid },
          { title: 'Total Applications', value: dashboard?.opportunities?.reduce((acc: number, o: any) => acc + (o._count?.applications || 0), 0) || 0, icon: <TeamOutlined />, color: colors.secondary?.solid || '#8B5CF6' },
          { title: 'Active Deals', value: dashboard?.deals?.filter((d: any) => d.status === 'IN_PROGRESS').length || 0, icon: <DollarOutlined />, color: colors.success?.solid || '#10B981' }
        ].map((stat, idx) => (
          <Col xs={24} sm={8} key={idx}>
            <Card
              bordered={false}
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: `1px solid ${colors.gray[100]}`,
                boxShadow: shadows.md
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color,
                  fontSize: '20px'
                }}>
                  {stat.icon}
                </div>
                <div>
                  <Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {stat.title}
                  </Text>
                  <div style={{ color: colors.text.primary, fontSize: '24px', fontWeight: 900, letterSpacing: '-0.02em' }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: colors.text.primary, fontWeight: 800, fontSize: '18px' }}>📢 Recent Opportunities</span>}
            bordered={false}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              border: `1px solid ${colors.gray[100]}`,
              boxShadow: shadows.md
            }}
            extra={<Button type="link" onClick={() => navigate('/company-dashboard/opportunities')} style={{ color: colors.primary.solid, fontWeight: 700 }}>View All <ArrowRightOutlined style={{ fontSize: '12px', marginLeft: '4px' }} /></Button>}
            bodyStyle={{ padding: '0 24px' }}
          >
            <List
              dataSource={dashboard?.opportunities?.slice(0, 5) || []}
              renderItem={(item: any, index: number) => (
                <List.Item style={{ borderBottom: index === (dashboard?.opportunities?.slice(0, 5).length - 1) ? 'none' : `1px solid ${colors.gray[50]}`, padding: '20px 0' }}>
                  <List.Item.Meta
                    title={<Text style={{ color: colors.text.primary, fontWeight: 700, fontSize: '16px' }}>{item.title}</Text>}
                    description={
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag color={item.status === 'OPEN' ? 'success' : 'default'} style={{ borderRadius: '6px', fontWeight: 700, margin: 0 }}>{item.status}</Tag>
                        <Text style={{ color: colors.text.tertiary, fontSize: '12px', fontWeight: 500 }}>
                          Posted {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                    }
                  />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Applications</div>
                    <div style={{ color: colors.text.primary, fontWeight: 900, fontSize: '18px' }}>{item._count?.applications || 0}</div>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: <div style={{ color: colors.text.tertiary, padding: '40px', textAlign: 'center', fontWeight: 500 }}>No opportunities posted yet.</div> }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: colors.text.primary, fontWeight: 800, fontSize: '18px' }}>🤝 Active Deals</span>}
            bordered={false}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              border: `1px solid ${colors.gray[100]}`,
              boxShadow: shadows.md
            }}
            extra={<Button type="link" onClick={() => navigate('/company-dashboard/deals')} style={{ color: colors.primary.solid, fontWeight: 700 }}>Manage <ArrowRightOutlined style={{ fontSize: '12px', marginLeft: '4px' }} /></Button>}
            bodyStyle={{ padding: '0 24px' }}
          >
            <List
              dataSource={dashboard?.deals?.slice(0, 5) || []}
              renderItem={(item: any, index: number) => (
                <List.Item style={{ borderBottom: index === (dashboard?.deals?.slice(0, 5).length - 1) ? 'none' : `1px solid ${colors.gray[50]}`, padding: '20px 0' }}>
                  <List.Item.Meta
                    avatar={<Avatar src={item.creator?.profileImage ? getImageUrl(item.creator.profileImage) : undefined} icon={<UserOutlined />} style={{ background: colors.gray[100], border: `1px solid ${colors.gray[200]}` }} />}
                    title={<Text style={{ color: colors.text.primary, fontWeight: 700, fontSize: '16px' }}>{item.creator?.displayName}</Text>}
                    description={<Text style={{ color: colors.text.tertiary, fontSize: '13px', fontWeight: 500 }}>{item.application?.opportunity?.title}</Text>}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <Tag color="geekblue" style={{ borderRadius: '6px', fontWeight: 700, marginBottom: '4px', marginRight: 0 }}>{item.status.replace('_', ' ')}</Tag>
                    <div style={{ color: colors.primary.solid, fontWeight: 800, fontSize: '16px' }}>₹{item.amount.toLocaleString()}</div>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: <div style={{ color: colors.text.tertiary, padding: '40px', textAlign: 'center', fontWeight: 500 }}>No active deals.</div> }}
            />
          </Card>
        </Col>
      </Row>
    </div >
  );
};

export default CompanyDashboard;
