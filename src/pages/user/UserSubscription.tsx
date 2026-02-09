// ===========================================
// USER SUBSCRIPTION PAGE
// ===========================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Tag, List, Spin, message, Modal } from 'antd';
import { CheckOutlined, CrownOutlined } from '@ant-design/icons';
import { subscriptionApi, paymentApi } from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import DashboardContentLoader from '../../components/common/DashboardContentLoader';

const UserSubscription = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
    fetchPlans();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await subscriptionApi.getDetails();
      const data = response.data.data || {};
      setSubscription(data.subscription || data);
      setUsage(data.usage || null);
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const response = await subscriptionApi.getPlans();
      const data = response.data.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.plans)
          ? data.plans
          : [];
      setPlans(list);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);

      // Create Razorpay order
      const orderResponse = await paymentApi.createOrder({ plan: 'PREMIUM' });
      const { orderId, amount, currency, keyId } = orderResponse.data.data;

      // Check if Razorpay script is loaded
      if (!(window as any).Razorpay) {
        message.error('Payment gateway not loaded. Please refresh the page.');
        setUpgrading(false);
        return;
      }

      // Initialize Razorpay checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'AI Creator Platform',
        description: 'Premium Subscription - Unlimited Access',
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyResponse = await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              message.success('Payment successful! Premium activated.');
              navigate(`/payment-success?orderId=${orderId}`);
              fetchSubscription();
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            message.error('Payment verification failed');
            navigate('/payment-failure?error=Verification failed');
          } finally {
            setUpgrading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#1890ff'
        },
        modal: {
          ondismiss: function () {
            setUpgrading(false);
            message.info('Payment cancelled');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        message.error('Payment failed: ' + response.error.description);
        navigate(`/payment-failure?error=${encodeURIComponent(response.error.description)}`);
        setUpgrading(false);
      });

      rzp.open();
    } catch (error: any) {
      console.error('Payment initialization failed:', error);
      message.error(error.response?.data?.message || 'Failed to initialize payment');
      setUpgrading(false);
    }
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Cancel Subscription?',
      content: 'Are you sure you want to cancel your Premium subscription?',
      onOk: async () => {
        try {
          await subscriptionApi.cancel();
          message.success('Subscription cancelled');
          fetchSubscription();
        } catch (err) {
          message.error('Failed to cancel subscription');
        }
      }
    });
  };

  if (loading) {
    return <DashboardContentLoader />;
  }

  const isPremium = subscription?.plan === 'PREMIUM';
  const tokenUsage = usage?.tokens;
  const tokenBalance = tokenUsage?.balance ?? subscription?.tokenBalance;
  const tokenGrant = tokenUsage?.grant ?? subscription?.tokenGrant;
  const tokensPerMessage = tokenUsage?.perMessage;
  const tokenGrantedAt = tokenUsage?.grantedAt ?? subscription?.tokenGrantedAt;
  const isOutOfTokens = isPremium && tokenBalance !== undefined && tokenBalance !== null && Number(tokenBalance) <= 0;
  const normalizePlanCode = (plan: any) => {
    return (plan?.plan || plan?.code || plan?.name || '').toString().toUpperCase();
  };
  const currentPlanDetails = plans.find(plan => normalizePlanCode(plan) === subscription?.plan);
  const premiumPlan = plans.find(plan => normalizePlanCode(plan) === 'PREMIUM');

  const formatPrice = (plan: any) => {
    const amount = plan?.price ?? plan?.amount ?? plan?.monthlyPrice ?? plan?.yearlyPrice;
    if (amount === undefined || amount === null) return 'Price unavailable';
    const numeric = typeof amount === 'string' ? Number(amount) : amount;
    if (Number.isNaN(numeric)) return String(amount);
    const currency = plan?.currency || 'INR';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(numeric);
    } catch {
      return `${numeric}`;
    }
  };

  const getIntervalLabel = (plan: any) => {
    const interval = plan?.interval || plan?.period || plan?.billingPeriod;
    if (!interval) return '';
    return `/${interval}`;
  };

  const formatPlanName = (value?: string) => {
    if (!value) return 'Plan';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  };

  const currentPlanLabel = currentPlanDetails?.name || (subscription?.plan ? formatPlanName(subscription.plan) : 'Free');
  const premiumPriceLabel = premiumPlan ? `${formatPrice(premiumPlan)}${getIntervalLabel(premiumPlan)}` : 'Upgrade to Premium';
  const premiumFeaturesRaw = Array.isArray(premiumPlan?.features)
    ? premiumPlan.features
    : Array.isArray(premiumPlan?.benefits)
      ? premiumPlan.benefits
      : [];
  const premiumFeatures: string[] = premiumFeaturesRaw.map((feature: unknown) => String(feature));
  const messageLimit = currentPlanDetails?.messageLimit
    ?? currentPlanDetails?.dailyMessageLimit
    ?? currentPlanDetails?.limits?.messagesPerDay
    ?? usage?.dailyQuota;
  const upgradeLabel = premiumPlan ? `Upgrade to Premium - ${premiumPriceLabel}` : 'Upgrade to Premium';
  const messagesToday = usage?.messagesToday ?? subscription?.messagesUsedToday ?? 0;

  return (
    <div>
      <h2>Subscription</h2>
      <p style={{ color: '#888', marginBottom: '24px' }}>Manage your subscription plan</p>

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card title="Current Plan">
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <CrownOutlined style={{ fontSize: '48px', color: isPremium ? '#faad14' : '#d9d9d9' }} />
              <h2 style={{ marginTop: '16px' }}>{currentPlanLabel}</h2>
              <Tag color={subscription?.status === 'ACTIVE' ? 'green' : 'red'}>
                {subscription?.status || 'UNKNOWN'}
              </Tag>
              {isPremium && subscription?.currentPeriodEnd && (
                <p style={{ marginTop: '16px', color: '#888' }}>
                  Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            <div style={{ marginTop: '24px' }}>
              <h4>Usage Today</h4>
              <p>
                Messages: {messagesToday}
                {messageLimit ? ` / ${messageLimit}` : ''}
              </p>
              {isPremium && tokenBalance !== undefined && tokenGrant !== undefined && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Token Balance</div>
                  <div style={{ color: '#111827' }}>
                    {Number(tokenBalance).toLocaleString()} / {Number(tokenGrant).toLocaleString()} tokens
                  </div>
                  {tokensPerMessage !== undefined && (
                    <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>
                      Burn per message: {Number(tokensPerMessage).toLocaleString()} tokens
                    </div>
                  )}
                  {tokenGrantedAt && (
                    <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>
                      Grant date: {new Date(tokenGrantedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
            {isOutOfTokens && (
              <div style={{ marginTop: '16px' }}>
                <Tag color="red">Out of tokens</Tag>
                <p style={{ color: '#b91c1c', marginTop: '8px' }}>
                  Your token balance is empty. Renew to continue premium chats.
                </p>
                <Button type="primary" onClick={handleUpgrade} loading={upgrading} disabled={upgrading}>
                  Renew Premium
                </Button>
              </div>
            )}
            {isPremium ? (
              <Button danger block onClick={handleCancel}>Cancel Subscription</Button>
            ) : (
              <Button
                type="primary"
                block
                onClick={handleUpgrade}
                loading={upgrading}
                disabled={upgrading}
              >
                {upgrading ? 'Processing...' : upgradeLabel}
              </Button>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Premium Benefits">
            {plansLoading ? (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <Spin />
              </div>
            ) : premiumFeatures.length > 0 ? (
              <List
                dataSource={premiumFeatures}
                renderItem={(item) => (
                  <List.Item>
                    <CheckOutlined style={{ color: '#52c41a', marginRight: '12px' }} />
                    {item}
                  </List.Item>
                )}
              />
            ) : (
              <p style={{ color: '#888' }}>Plan details are not available right now.</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserSubscription;
