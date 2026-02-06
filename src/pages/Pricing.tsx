// ===========================================
// PRICING PAGE
// ===========================================

import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Typography, List } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const { Title, Paragraph } = Typography;

const Pricing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      features: ['5 messages per day', 'Access to all creators', 'Basic chat history', '3 guest messages without signup'],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Premium',
      price: '₹799',
      period: '/month',
      features: ['Unlimited messages', 'Access to all creators', 'Full chat history', 'Priority support', 'Early access to new features', 'Support creators directly'],
      cta: 'Upgrade Now',
      popular: true
    }
  ];

  const handleCTA = (planName: string) => {
    if (!isAuthenticated) {
      navigate('/register');
    } else if (planName === 'Premium') {
      navigate('/dashboard/subscription');
    } else {
      navigate('/creators');
    }
  };

  return (
    <div style={{ padding: '60px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <Title>Simple, Transparent Pricing</Title>
        <Paragraph style={{ fontSize: '18px' }} type="secondary">
          Start free and upgrade when you need more
        </Paragraph>
      </div>

      <Row gutter={32} justify="center">
        {plans.map((plan) => (
          <Col xs={24} md={12} lg={10} key={plan.name}>
            <Card
              style={{ 
                height: '100%', 
                borderColor: plan.popular ? '#1890ff' : undefined,
                borderWidth: plan.popular ? 2 : 1
              }}
              title={
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  {plan.popular && (
                    <div style={{ 
                      background: '#1890ff', 
                      color: '#fff', 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      display: 'inline-block',
                      marginBottom: '8px'
                    }}>
                      MOST POPULAR
                    </div>
                  )}
                  <Title level={3} style={{ margin: '8px 0' }}>{plan.name}</Title>
                  <div>
                    <span style={{ fontSize: '42px', fontWeight: 'bold' }}>{plan.price}</span>
                    <span style={{ color: '#888' }}>{plan.period}</span>
                  </div>
                </div>
              }
            >
              <List
                dataSource={plan.features}
                renderItem={(item) => (
                  <List.Item style={{ border: 'none', padding: '8px 0' }}>
                    <CheckOutlined style={{ color: '#52c41a', marginRight: '12px' }} />
                    {item}
                  </List.Item>
                )}
              />
              <Button 
                type={plan.popular ? 'primary' : 'default'} 
                size="large" 
                block 
                style={{ marginTop: '24px' }}
                onClick={() => handleCTA(plan.name)}
              >
                {plan.cta}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <Title level={3}>Frequently Asked Questions</Title>
        <Row gutter={32} style={{ marginTop: '32px', textAlign: 'left' }}>
          <Col xs={24} md={12}>
            <Title level={5}>How does the free tier work?</Title>
            <Paragraph type="secondary">
              You get 5 messages per day to chat with any creator on the platform. Try before you commit!
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Title level={5}>Can I cancel anytime?</Title>
            <Paragraph type="secondary">
              Yes! You can cancel your Premium subscription at any time. No questions asked.
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Title level={5}>How do creators get paid?</Title>
            <Paragraph type="secondary">
              Creators receive 80% of subscription revenue. When you subscribe, you support your favorite creators directly.
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Title level={5}>Are the responses really AI?</Title>
            <Paragraph type="secondary">
              Yes! Our AI is trained on each creator's actual content to sound just like them. It's not the creator typing.
            </Paragraph>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Pricing;
