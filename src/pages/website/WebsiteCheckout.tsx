import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { subscriptionApi } from '../../services/api';
import { fetchCurrentUser } from '../../store/slices/authSlice';
import { Check, Shield } from 'lucide-react';

const PLANS: Record<string, { name: string; price: string; priceNum: number; period: string; features: string[] }> = {
  starter: {
    name: 'Starter',
    price: '₹0',
    priceNum: 0,
    period: 'forever',
    features: ['5 free messages', 'Community support', 'Basic access'],
  },
  premium: {
    name: 'Premium',
    price: '₹499',
    priceNum: 499,
    period: '/month',
    features: ['2,000 tokens/month', 'All creator access', 'Full chat history', 'Priority support'],
  },
  elite: {
    name: 'Elite',
    price: '₹1,499',
    priceNum: 1499,
    period: '/month',
    features: ['10,000 tokens/month', '1-on-1 coaching access', 'Custom AI experience', 'Priority support'],
  },
};

export default function WebsiteCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const planId = searchParams.get('plan') || localStorage.getItem('selectedPlan') || 'premium';
  const _returnTo = searchParams.get('return') || localStorage.getItem('checkoutReturnTo') || '/';
  const plan = PLANS[planId] || PLANS.premium;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handlePay = async () => {
    if (plan.priceNum === 0) {
      // Free plan — just redirect
      navigate('/');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call upgrade API — backend handles mock payment when Razorpay not configured
      await subscriptionApi.upgrade();

      // Refresh user data to get updated subscription
      dispatch(fetchCurrentUser());

      setSuccess(true);
      localStorage.removeItem('selectedPlan');

      // Redirect after 2 seconds — go to home page
      setTimeout(() => {
        localStorage.removeItem('checkoutReturnTo');
        navigate('/', { replace: true });
      }, 2500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: '#ecfdf5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: '#10b981',
          }}>
            <Check size={32} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Payment Successful!</h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Your {plan.name} plan is now active. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px 80px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Checkout</h1>
      <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 32 }}>Complete your subscription</p>

      {/* Plan Summary Card */}
      <div style={{
        background: '#fff', border: '1px solid #ede8e3', borderRadius: 16, padding: 28, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Selected Plan</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{plan.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{plan.price}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{plan.period}</div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f0ebe6', paddingTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 12 }}>What's included:</div>
          {plan.features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Check size={14} style={{ color: '#10b981', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#374151' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bill Summary */}
      <div style={{
        background: '#fff', border: '1px solid #ede8e3', borderRadius: 16, padding: 28, marginBottom: 24,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Bill Summary</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 14, color: '#6b7280' }}>{plan.name} Plan</span>
          <span style={{ fontSize: 14, color: '#111827' }}>{plan.price}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 14, color: '#6b7280' }}>Tax</span>
          <span style={{ fontSize: 14, color: '#111827' }}>$0.00</span>
        </div>
        <div style={{ borderTop: '1px solid #f0ebe6', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Total</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{plan.price}{plan.period !== 'forever' ? plan.period : ''}</span>
        </div>
      </div>

      {/* Account info */}
      <div style={{
        background: '#fafaf8', border: '1px solid #ede8e3', borderRadius: 12, padding: '14px 18px', marginBottom: 24,
        fontSize: 13, color: '#6b7280',
      }}>
        Billing to: <strong style={{ color: '#111827' }}>{user?.email}</strong>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px',
          color: '#dc2626', fontSize: 13, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* Pay Button */}
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        style={{
          width: '100%', padding: '14px 24px', borderRadius: 12, border: 'none',
          background: loading ? '#d1d5db' : 'linear-gradient(135deg, #ff5b1f 0%, #ff3e48 100%)',
          color: '#fff', fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 4px 16px rgba(255,62,72,0.3)',
          transition: 'all 0.15s ease',
        }}
      >
        {loading ? 'Processing...' : plan.priceNum === 0 ? 'Activate Free Plan' : `Pay ${plan.price} Now`}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, color: '#9ca3af', fontSize: 11 }}>
        <Shield size={12} />
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Secure Encrypted Payment</span>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button type="button" onClick={() => navigate('/pricing')} style={{ fontSize: 13, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Back to plans
        </button>
      </div>
    </div>
  );
}
