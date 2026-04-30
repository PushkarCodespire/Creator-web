import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Building2, Smartphone, Shield, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { payoutApi } from '../../services/api';

const card: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #ede8e3',
  borderRadius: 16,
  padding: 24,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TRANSACTIONS: Record<string, any>[] = [];

const CreatorPayouts = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('2500');
  const [method, setMethod] = useState<'bank' | 'upi'>('bank');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [earnings, setEarnings] = useState<Record<string, any> | null>(null);
  const [payouts, setPayouts] = useState<typeof TRANSACTIONS>([]);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState('');
  const [page, setPage] = useState(1);
  const [totalPayouts, setTotalPayouts] = useState(0);
  const pageSize = 4;

  useEffect(() => {
    (async () => {
      try {
        const [earnRes, payoutRes] = await Promise.allSettled([
          payoutApi.getEarningsBreakdown(),
          payoutApi.getPayouts({ limit: pageSize, page }),
        ]);
        if (earnRes.status === 'fulfilled') setEarnings(earnRes.value.data.data);
        if (payoutRes.status === 'fulfilled') {
          const resData = payoutRes.value.data.data;
          const items = resData?.payouts || resData || [];
          setPayouts(Array.isArray(items) ? items : []);
          setTotalPayouts(resData?.total || resData?.count || items.length || 0);
        }
      } catch {}
    })();
  }, [page]);

  const handleWithdraw = async () => {
    const num = parseFloat(amount);
    if (!num || num < 100) {
      setWithdrawMsg('Minimum withdrawal is ₹100');
      return;
    }
    setWithdrawing(true);
    setWithdrawMsg('');
    try {
      await payoutApi.requestPayout(num);
      setWithdrawMsg('Withdrawal request submitted successfully!');
      setAmount('');
      // Refresh payouts
      const res = await payoutApi.getPayouts({ limit: 4 });
      const items = res.data.data?.payouts || res.data.data || [];
      setPayouts(Array.isArray(items) ? items : []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setWithdrawMsg(e?.response?.data?.error || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0 }}>Payouts</h1>
          <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>Manage your earnings and withdrawal methods</p>
        </div>
      </div>

      {/* Balance + Creator Insight row */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 24 }}>
        {/* Balance Card */}
        <div style={{ ...card, background: '#fafaf8', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative circle */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,62,72,0.04)', pointerEvents: 'none' }} />
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700,
            background: '#111827', color: '#fff', padding: '4px 12px', borderRadius: 6, marginBottom: 16,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            💰 Ready to Withdraw
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 20 }}>
            <span style={{ fontSize: 18, color: '#9ca3af' }}>₹</span>
            <span style={{ fontSize: 52, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{Math.floor(earnings?.availableBalance || 0).toLocaleString()}</span>
            <span style={{ fontSize: 22, fontWeight: 600, color: '#9ca3af' }}>.{((earnings?.availableBalance || 0) % 1 * 100).toFixed(0).padStart(2, '0')}</span>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Lifetime Earnings</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>₹{(earnings?.lifetimeEarnings || earnings?.totalEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Next Payout</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{earnings?.nextPayoutDate ? new Date(earnings.nextPayoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}</div>
            </div>
          </div>
        </div>

        {/* Creator Insight */}
        <div style={{
          background: 'linear-gradient(135deg, #ff3e48 0%, #ff6b6b 100%)',
          borderRadius: 16, padding: 28, color: '#fff',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Sparkles size={14} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Creator Insight</span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', lineHeight: 1.3 }}>Track your earnings growth here</h3>
          <p style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.5, marginBottom: 16 }}>
            Withdrawal insights will appear as your balance grows.
          </p>
          <button type="button" onClick={() => navigate('/pricing')} style={{
            padding: '9px 20px', borderRadius: 8, background: '#fff', color: '#ff3e48',
            fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', alignSelf: 'flex-start',
          }}>View Growth Plan</button>
        </div>
      </div>

      {/* Withdraw Funds */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff3e48' }}>
            <svg viewBox="0 0 20 20" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="10" cy="10" r="8" /><path d="M10 6v8M6 10h8" /></svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Withdraw Funds</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
          {/* Amount */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Amount to Withdraw</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px',
              border: '1px solid #ede8e3', borderRadius: 12, background: '#fff',
            }}>
              <span style={{ fontSize: 16, color: '#9ca3af' }}>₹</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                style={{ border: 'none', outline: 'none', fontSize: 22, fontWeight: 700, color: '#111827', width: '100%', background: 'transparent' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Minimum withdrawal: ₹100.00</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981' }}>Max: ₹{(earnings?.availableBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Payout Method */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Payout Method</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { id: 'bank' as const, icon: <Building2 size={20} />, label: 'Bank Transfer', sub: '3-5 business days' },
                { id: 'upi' as const, icon: <Smartphone size={20} />, label: 'UPI', sub: 'Instant processing' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  style={{
                    flex: 1, padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                    border: method === m.id ? '2px solid #ff3e48' : '1px solid #ede8e3',
                    background: method === m.id ? '#fff5f5' : '#fff',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: method === m.id ? '#ff3e48' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: method === m.id ? '#fff' : '#6b7280', flexShrink: 0 }}>{m.icon}</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{m.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        {withdrawMsg && (
          <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 13, color: withdrawMsg.includes('success') ? '#10b981' : '#ef4444' }}>{withdrawMsg}</div>
        )}
        <button type="button" onClick={handleWithdraw} disabled={withdrawing} style={{
          width: '100%', maxWidth: 480, margin: '0 auto', display: 'block',
          padding: '14px 24px', borderRadius: 12, border: 'none',
          background: withdrawing ? '#d1d5db' : 'linear-gradient(135deg, #ff5b1f 0%, #ff3e48 100%)',
          color: '#fff', fontSize: 15, fontWeight: 600, cursor: withdrawing ? 'not-allowed' : 'pointer',
          boxShadow: withdrawing ? 'none' : '0 4px 16px rgba(255,62,72,0.3)',
        }}>
          {withdrawing ? 'Processing...' : 'Confirm Withdrawal'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, color: '#9ca3af', fontSize: 11 }}>
          <Shield size={12} />
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Secure Encrypted Transaction</span>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Transactions</h3>
        <button type="button" onClick={() => {
          const data = (payouts.length > 0 ? payouts : []).map((p) => `${p.id || ''},${p.amount || 0},${p.status || ''},${p.requestedAt || p.createdAt || ''}`);
          const csv = 'ID,Amount,Status,Date\n' + data.join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'payouts-report.csv'; a.click();
        }} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#ff3e48', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <Download size={14} /> Download Report
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {payouts.length === 0 && TRANSACTIONS.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 14, ...card }}>No payout transactions yet</div>
        )}
        {(payouts.length > 0 ? payouts : TRANSACTIONS).map((tx, i: number) => {
          const isReal = payouts.length > 0;
          const status = isReal ? (tx.status || 'PENDING') : tx.status;
          const statusColor = status === 'COMPLETED' ? '#10b981' : status === 'PROCESSING' ? '#f59e0b' : status === 'FAILED' ? '#ef4444' : '#9ca3af';
          const date = isReal ? new Date(tx.requestedAt || tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : tx.date;
          const amt = isReal ? `₹${(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : tx.amount;
          const method = isReal ? (tx.bankAccount?.bankName ? `🏦 ${tx.bankAccount.bankName}` : '🏦 Bank') : `${tx.icon} ${tx.method}`;
          const txnId = isReal ? `TXN-${(tx.id || '').slice(0, 6)}` : tx.txn;

          return (
            <div key={i} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700,
                  padding: '3px 10px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.04em',
                  background: status === 'COMPLETED' ? '#ecfdf5' : status === 'PROCESSING' ? '#fffbeb' : '#fef2f2',
                  color: statusColor,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusColor }} />
                  {status}
                </span>
                <span style={{ fontSize: 10, color: '#9ca3af' }}>{txnId}</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Date</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>{date}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Method</div>
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>{method}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Amount</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{amt}</div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {(() => {
        const totalPages = Math.max(1, Math.ceil(totalPayouts / pageSize));
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>
              Showing {payouts.length} of {totalPayouts} transactions
            </span>
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button type="button" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #ede8e3', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page <= 1 ? 'not-allowed' : 'pointer', color: page <= 1 ? '#d1d5db' : '#9ca3af' }}><ChevronLeft size={14} /></button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} type="button" onClick={() => setPage(p)} style={{ width: 32, height: 32, borderRadius: '50%', border: page === p ? 'none' : '1px solid #ede8e3', background: page === p ? '#ff3e48' : '#fff', color: page === p ? '#fff' : '#6b7280', fontSize: 12, fontWeight: page === p ? 700 : 600, cursor: 'pointer' }}>{p}</button>
                ))}
                <button type="button" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #ede8e3', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page >= totalPages ? 'not-allowed' : 'pointer', color: page >= totalPages ? '#d1d5db' : '#9ca3af' }}><ChevronRight size={14} /></button>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default CreatorPayouts;
