import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { subscriptionApi } from '../../services/api';
import styles from './WebsitePricing.module.css';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹0',
    features: [
      '✓ 5 free messages',
      '✓ Community support',
      '✓ Basic access',
    ],
    cta: 'Start Free',
    highlighted: false,
    filled: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹499',
    features: [
      '✓ 2,000 tokens/month',
      '✓ All creator access',
      '✓ Full chat history',
      '✓ Priority support',
    ],
    cta: 'Start Premium',
    highlighted: true,
    filled: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '₹1,499',
    features: [
      '✓ 10,000 tokens/month',
      '✓ 1-on-1 coaching access',
      '✓ Custom AI experience',
      '✓ Priority support',
    ],
    cta: 'Go Elite',
    highlighted: false,
    filled: false,
  },
];

export default function WebsitePricing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        try {
          const res = await subscriptionApi.getCurrent();
          const plan = res.data.data?.plan;
          if (plan === 'PREMIUM') setCurrentPlan('premium');
          else if (plan === 'FREE') setCurrentPlan('starter');
        } catch {}
      })();
    }
  }, [isAuthenticated]);

  const handleSelectPlan = (planId: string) => {
    // Store selected plan
    localStorage.setItem('selectedPlan', planId);

    if (isAuthenticated) {
      navigate(`/pricing/checkout?plan=${planId}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Choose Your Fitness Plan</h1>
      <p className={styles.sub}>Start your transformation today with the perfect plan</p>

      <div className={styles.cards}>
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          return (
          <div
            key={plan.id}
            className={`${styles.card} ${plan.highlighted || isCurrentPlan ? styles.cardHighlighted : ''}`}
          >
            {isCurrentPlan && (
              <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981', background: '#ecfdf5', padding: '3px 10px', borderRadius: 6, display: 'inline-block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ✓ Current Plan
              </div>
            )}
            <h3 className={styles.planName}>{plan.name}</h3>
            <p className={styles.price}>{plan.price}</p>
            <ul className={styles.features}>
              {plan.features.map((f) => (
                <li key={f} className={styles.feature}>{f}</li>
              ))}
            </ul>
            <button
              type="button"
              className={`${styles.planBtn} ${plan.filled ? styles.planBtnFilled : styles.planBtnOutline}`}
              onClick={() => handleSelectPlan(plan.id)}
              disabled={isCurrentPlan}
            >
              {isCurrentPlan ? 'Current Plan' : plan.cta}
            </button>
          </div>
          );
        })}
      </div>
    </div>
  );
}
