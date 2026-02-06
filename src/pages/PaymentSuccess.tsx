// ===========================================
// PAYMENT SUCCESS PAGE
// ===========================================

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Optional: Track payment success analytics
    if (orderId) {
      console.log('Payment successful for order:', orderId);
    }
  }, [orderId]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <Result
        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
        status="success"
        title="Payment Successful!"
        subTitle="Your Premium subscription has been activated successfully. You now have unlimited access to all creators!"
        extra={[
          <Button
            type="primary"
            size="large"
            key="subscription"
            onClick={() => navigate('/user/subscription')}
          >
            View Subscription
          </Button>,
          <Button
            size="large"
            key="creators"
            onClick={() => navigate('/creators')}
          >
            Start Chatting
          </Button>
        ]}
        style={{
          background: '#fff',
          padding: '60px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '600px'
        }}
      />
    </div>
  );
};

export default PaymentSuccess;
