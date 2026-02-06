// ===========================================
// COMPANY DASHBOARD
// ===========================================

import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, List, Tag, Spin, Button, Avatar } from 'antd';
import { ShopOutlined, TeamOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { companyApi } from '../../services/api';

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
    <div className="company-dashboard fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', background: 'linear-gradient(135deg, #FFF 0%, #A5F3FC 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Company Dashboard
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '16px' }}>Welcome back, <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{dashboard?.companyName || 'Partner'}</span></p>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
          >
            <Statistic
              title={<span style={{ color: '#94A3B8' }}>Active Opportunities</span>}
              value={dashboard?.opportunities?.filter((o: any) => o.status === 'OPEN').length || 0}
              prefix={<ShopOutlined style={{ color: '#60A5FA' }} />}
              valueStyle={{ color: '#F8FAFC', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
          >
            <Statistic
              title={<span style={{ color: '#94A3B8' }}>Total Applications</span>}
              value={dashboard?.opportunities?.reduce((acc: number, o: any) => acc + (o._count?.applications || 0), 0) || 0}
              prefix={<TeamOutlined style={{ color: '#A78BFA' }} />}
              valueStyle={{ color: '#F8FAFC', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
          >
            <Statistic
              title={<span style={{ color: '#94A3B8' }}>Active Deals</span>}
              value={dashboard?.deals?.filter((d: any) => d.status === 'IN_PROGRESS').length || 0}
              prefix={<DollarOutlined style={{ color: '#34D399' }} />}
              valueStyle={{ color: '#F8FAFC', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: '#F8FAFC' }}>Recent Opportunities</span>}
            bordered={false}
            style={{ background: '#1E293B', border: '1px solid #334155' }}
            extra={<Button type="link" onClick={() => navigate('/company-dashboard/opportunities')} style={{ color: '#60A5FA' }}>View All</Button>}
          >
            <List
              dataSource={dashboard?.opportunities?.slice(0, 5) || []}
              renderItem={(item: any) => (
                <List.Item style={{ borderBottom: '1px solid #334155', padding: '12px 0' }}>
                  <List.Item.Meta
                    title={<span style={{ color: '#F8FAFC' }}>{item.title}</span>}
                    description={
                      <div style={{ marginTop: '4px' }}>
                        <Tag color={item.status === 'OPEN' ? 'success' : 'default'} style={{ border: 'none' }}>{item.status}</Tag>
                        <span style={{ color: '#64748B', fontSize: '12px', marginLeft: '8px' }}>
                          Created {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    }
                  />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#94A3B8', fontSize: '12px' }}>Applications</div>
                    <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '16px' }}>{item._count?.applications || 0}</div>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: <div style={{ color: '#64748B', padding: '20px', textAlign: 'center' }}>No opportunities posted yet.</div> }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: '#F8FAFC' }}>Active Deals</span>}
            bordered={false}
            style={{ background: '#1E293B', border: '1px solid #334155' }}
            extra={<Button type="link" onClick={() => navigate('/company-dashboard/deals')} style={{ color: '#60A5FA' }}>Manage</Button>}
          >
            <List
              dataSource={dashboard?.deals?.slice(0, 5) || []}
              renderItem={(item: any) => (
                <List.Item style={{ borderBottom: '1px solid #334155', padding: '12px 0' }}>
                  <List.Item.Meta
                    avatar={<Avatar src={item.creator?.profileImage} icon={<UserOutlined />} style={{ background: '#334155' }} />}
                    title={<span style={{ color: '#F8FAFC' }}>{item.creator?.displayName}</span>}
                    description={<span style={{ color: '#64748B' }}>{item.application?.opportunity?.title}</span>}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <Tag color="geekblue" style={{ marginRight: 0, marginBottom: '4px' }}>{item.status}</Tag>
                    <div style={{ color: '#A5F3FC', fontWeight: 600 }}>₹{item.amount.toLocaleString()}</div>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: <div style={{ color: '#64748B', padding: '20px', textAlign: 'center' }}>No active deals.</div> }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CompanyDashboard;
