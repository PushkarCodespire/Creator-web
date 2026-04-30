import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, CreditCard } from 'lucide-react';
import { payoutApi, creatorApi } from '../../services/api';

const card: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #ede8e3',
  borderRadius: 16,
  padding: 28,
};

const FALLBACK_TRANSACTIONS: { name: string; type: string; date: string; amount: string; status: string; positive: boolean }[] = [];

const CreatorRevenue = () => {
  const [period, setPeriod] = useState('MONTHLY');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [earnings, setEarnings] = useState<Record<string, any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashboard, setDashboard] = useState<Record<string, any> | null>(null);
  const [ledger, setLedger] = useState<{ description?: string; sourceType?: string; type: string; createdAt: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [earnRes, ledgerRes, dashRes] = await Promise.allSettled([
          payoutApi.getEarningsBreakdown(),
          payoutApi.getLedger({ limit: period === 'WEEKLY' ? 7 : period === 'MONTHLY' ? 30 : 100 }),
          creatorApi.getDashboard(),
        ]);
        if (earnRes.status === 'fulfilled') setEarnings(earnRes.value.data.data);
        if (ledgerRes.status === 'fulfilled') {
          const items = ledgerRes.value.data.data?.entries || ledgerRes.value.data.data || [];
          setLedger(Array.isArray(items) ? items : []);
        }
        if (dashRes.status === 'fulfilled') setDashboard(dashRes.value.data.data);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [period]);

  const formatCurrency = (n: number) => {
    if (!n && n !== 0) return '₹0.00';
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalRevenue = earnings?.lifetimeEarnings || earnings?.totalEarnings || dashboard?.totalEarnings || 0;
  const availableBalance = earnings?.availableBalance || 0;

  // Map ledger entries to transaction display format, fallback to static
  const transactions = ledger.length > 0
    ? ledger.map((entry) => ({
        name: entry.description || entry.sourceType || 'Transaction',
        type: entry.type === 'CREDIT' ? 'Earning' : entry.type === 'DEBIT' ? 'Withdrawal' : entry.type,
        date: new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: `${entry.type === 'DEBIT' ? '-' : '+'}${formatCurrency(Math.abs(entry.amount))}`,
        status: 'COMPLETED',
        positive: entry.type !== 'DEBIT',
      }))
    : FALLBACK_TRANSACTIONS;

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#9ca3af', fontSize: 15 }}>Loading revenue...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0 }}>Revenue Overview</h1>
          <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>Track your earnings and transaction history</p>
        </div>
        <div style={{ display: 'flex', background: '#fff', border: '1px solid #ede8e3', borderRadius: 10, padding: 3 }}>
          {['WEEKLY', 'MONTHLY', 'YEARLY'].map((p) => (
            <button key={p} type="button" onClick={() => setPeriod(p)} style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: period === p ? '#111827' : 'transparent',
              color: period === p ? '#fff' : '#6b7280',
              transition: 'all 0.15s ease', letterSpacing: '0.03em',
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* 2 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Revenue</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><CreditCard size={18} /></div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#111827', lineHeight: 1, marginBottom: 12 }}>{formatCurrency(totalRevenue)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} style={{ color: '#10b981' }} />
            <span style={{ fontSize: 13, color: '#10b981', fontWeight: 500 }}>Lifetime earnings</span>
          </div>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Available Balance</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><DollarSign size={18} /></div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#111827', lineHeight: 1, marginBottom: 12 }}>{formatCurrency(availableBalance)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} style={{ color: '#10b981' }} />
            <span style={{ fontSize: 13, color: '#10b981', fontWeight: 500 }}>Ready to withdraw</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Transactions</h3>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{transactions.length} transactions</span>
        </div>

        {transactions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 }}>No transactions yet</div>
        )}

        {transactions.map((tx, i: number) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 0',
            borderTop: i > 0 ? '1px solid #f5f0eb' : 'none',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: tx.positive ? '#fff5f5' : '#f5f3ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: tx.positive ? '#ff3e48' : '#8b5cf6', flexShrink: 0,
            }}>
              {tx.positive ? (
                <svg viewBox="0 0 20 20" width={18} height={18}><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M7 10h6M10 7v6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              ) : (
                <svg viewBox="0 0 20 20" width={18} height={18}><rect x="3" y="5" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M3 9h14" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{tx.name}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>{tx.type} · {tx.date}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: tx.positive ? '#111827' : '#6b7280' }}>{tx.amount}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: tx.status === 'COMPLETED' ? '#10b981' : '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>{tx.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatorRevenue;
