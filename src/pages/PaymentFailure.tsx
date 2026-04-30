// ===========================================
// PAYMENT FAILURE PAGE
// ===========================================

import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error') || 'Payment could not be processed';

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <Result
        icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
        status="error"
        title="Payment Failed"
        subTitle={`${error}. Please try again or contact support if the problem persists.`}
        extra={[
          <Button
            type="primary"
            size="large"
            key="retry"
            onClick={() => navigate('/user/subscription')}
          >
            Try Again
          </Button>,
          <Button
            size="large"
            key="pricing"
            onClick={() => navigate('/pricing')}
          >
            View Plans
          </Button>,
          <Button
            size="large"
            key="home"
            onClick={() => navigate('/')}
          >
            Go Home
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

export default PaymentFailure;
