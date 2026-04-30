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
import { colors, shadows } from '../../styles/tokens';
import { logger } from '../../utils/logger';
// eslint-disable-next-line no-duplicate-imports
import { Typography } from 'antd';

const { Title, Text } = Typography;

const UserSubscription = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subscription, setSubscription] = useState<Record<string, any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [usage, setUsage] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      logger.error('Failed to fetch subscription:', err);
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
      logger.error('Failed to fetch plans:', err);
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
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
            logger.error('Payment verification failed:', error);
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', function (response: { error: { description: string } }) {
        logger.error('Payment failed:', response.error);
        message.error('Payment failed: ' + response.error.description);
        navigate(`/payment-failure?error=${encodeURIComponent(response.error.description)}`);
        setUpgrading(false);
      });

      rzp.open();
    } catch (error: unknown) {
      logger.error('Payment initialization failed:', error);
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Failed to initialize payment');
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (__err) {
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
  const normalizePlanCode = (plan: { plan?: string; code?: string; name?: string }) => {
    return (plan?.plan || plan?.code || plan?.name || '').toString().toUpperCase();
  };
  const currentPlanDetails = plans.find(plan => normalizePlanCode(plan) === subscription?.plan);
  const premiumPlan = plans.find(plan => normalizePlanCode(plan) === 'PREMIUM');

  const formatPrice = (plan: { price?: number | string; amount?: number | string; monthlyPrice?: number | string; yearlyPrice?: number | string; currency?: string }) => {
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

  const getIntervalLabel = (plan: { interval?: string; period?: string; billingPeriod?: string }) => {
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
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ color: colors.text.primary, marginBottom: '4px', fontWeight: 800, letterSpacing: '-0.02em' }}>Subscription</Title>
        <Text style={{ color: colors.text.tertiary, fontSize: '16px', fontWeight: 500 }}>Manage your subscription plan</Text>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: colors.text.primary, fontWeight: 800 }}>Current Plan</span>}
            bordered={false}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              border: `1px solid ${colors.gray[100]}`,
              boxShadow: shadows.md
            }}
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <CrownOutlined style={{ fontSize: '48px', color: isPremium ? '#faad14' : '#d9d9d9' }} />
              <Title level={2} style={{ marginTop: '16px', color: colors.text.primary, fontWeight: 900 }}>{currentPlanLabel}</Title>
              <Tag color={subscription?.status === 'ACTIVE' ? 'success' : 'error'} style={{ borderRadius: '8px', padding: '4px 12px', fontWeight: 700 }}>
                {subscription?.status || 'UNKNOWN'}
              </Tag>
              {isPremium && subscription?.currentPeriodEnd && (
                <Text style={{ marginTop: '16px', color: colors.text.tertiary, display: 'block', fontWeight: 500 }}>
                  Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </Text>
              )}
            </div>
            <div style={{ marginTop: '24px', padding: '20px', background: colors.gray[50], borderRadius: '16px', border: `1px solid ${colors.gray[100]}` }}>
              <Title level={5} style={{ color: colors.text.primary, fontWeight: 800, marginBottom: '12px' }}>Usage Today</Title>
              <Text style={{ color: colors.text.secondary, fontWeight: 600, display: 'block' }}>
                Messages: {messagesToday}
                {messageLimit ? ` / ${messageLimit}` : ''}
              </Text>
              {isPremium && tokenBalance !== undefined && tokenGrant !== undefined && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Token Balance</div>
                  <div style={{ color: '#111827' }}>
                    {Number(tokenBalance).toLocaleString()} / {Number(tokenGrant).toLocaleString()} tokens
                  </div>
                  {tokensPerMessage !== undefined && (
                    <div style={{ color: colors.text.tertiary, fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>
                      Burn per message: {Number(tokensPerMessage).toLocaleString()} tokens
                    </div>
                  )}
                  {tokenGrantedAt && (
                    <div style={{ color: colors.text.tertiary, fontSize: '12px', marginTop: '2px', fontWeight: 500 }}>
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
              <Button danger block size="large" onClick={handleCancel} style={{ marginTop: '24px', borderRadius: '12px', fontWeight: 700 }}>Cancel Subscription</Button>
            ) : (
              <Button
                type="primary"
                block
                size="large"
                onClick={handleUpgrade}
                loading={upgrading}
                disabled={upgrading}
                style={{ marginTop: '24px', borderRadius: '12px', fontWeight: 700, height: '48px' }}
              >
                {upgrading ? 'Processing...' : upgradeLabel}
              </Button>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: colors.text.primary, fontWeight: 800 }}>Premium Benefits</span>}
            bordered={false}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              border: `1px solid ${colors.gray[100]}`,
              boxShadow: shadows.md
            }}
          >
            {plansLoading ? (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <Spin />
              </div>
            ) : premiumFeatures.length > 0 ? (
              <List
                dataSource={premiumFeatures}
                renderItem={(item) => (
                  <List.Item style={{ borderBottom: `1px solid ${colors.gray[50]}`, padding: '16px 0' }}>
                    <CheckOutlined style={{ color: colors.primary.solid, marginRight: '12px', fontWeight: 900 }} />
                    <Text style={{ color: colors.text.secondary, fontWeight: 600 }}>{item}</Text>
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
