import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { creatorApi, payoutApi } from '../../services/api';
import { useDashboardFilter } from '../../components/layouts/DashboardFilterContext';
import { MessageSquare, DollarSign, Plus, Bot, Share2, Star, Users, Pencil, HelpCircle, Zap, Clock, ThumbsUp } from 'lucide-react';

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #ede8e3',
  borderRadius: 16,
  padding: 24,
};

const CreatorDashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { days } = useDashboardFilter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [earnings, setEarnings] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [dashRes, earnRes, compRes] = await Promise.allSettled([
          creatorApi.getDashboard(),
          payoutApi.getEarningsBreakdown(),
          creatorApi.getComparativeAnalytics(days),
        ]);
        if (dashRes.status === 'fulfilled') setData(dashRes.value.data.data);
        if (earnRes.status === 'fulfilled') setEarnings(earnRes.value.data.data);
        if (compRes.status === 'fulfilled') setComparison(compRes.value.data.data);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [days]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = data?.displayName || user?.creator?.displayName || user?.name || 'Creator';
  const firstName = displayName.split(' ')[0];
  const formatNum = (n: number) => {
    if (!n) return '0';
    if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return n.toLocaleString('en-IN');
    return n.toString();
  };

  const changeLabel = (val: number | undefined) => {
    if (!val && val !== 0) return '—';
    return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#9ca3af', fontSize: 15 }}>Loading dashboard...</div>;
  }

  const topQuestions: { question: string; count: number }[] = data?.topQuestions || [];
  const totalAiAnswers = data?.stats?.totalAiAnswers || data?.totalChats || 0;
  const aiAnswersToday = data?.stats?.aiAnswersToday || data?.messagesLastHour || 0;
  const reviewRating = data?.reviews?.summary?.averageRating || 0;
  const totalReviews = data?.reviews?.summary?.totalReviews || 0;
  const followersCount = data?.followers?.count || 0;

  // Earnings breakdown
  const subEarnings = Number(earnings?.subscriptionEarnings || 0);
  const dealEarnings = Number(earnings?.brandDealEarnings || 0);
  const availableBalance = Number(earnings?.availableBalance || 0);
  const pendingBalance = Number(earnings?.pendingBalance || 0);
  const lifetimeEarnings = Number(earnings?.lifetimeEarnings || 0);
  const totalEarningsSum = subEarnings + dealEarnings;

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>
          {greeting()}, {firstName}
        </h1>
        <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>
          Here's how your CreatorPal is doing today
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          {
            icon: <MessageSquare size={18} />, label: 'Questions Answered', value: formatNum(totalAiAnswers),
            change: changeLabel(comparison?.change?.messages),
            sub: aiAnswersToday ? `${aiAnswersToday} answered today` : 'No questions today',
            color: '#ff3e48', bg: '#fff5f5',
          },
          {
            icon: <DollarSign size={18} />, label: 'Total Earnings', value: `₹${formatNum(lifetimeEarnings || Number(data?.totalEarnings || 0))}`,
            change: changeLabel(comparison?.change?.revenue),
            sub: availableBalance > 0 ? `₹${formatNum(availableBalance)} available` : 'No earnings yet',
            color: '#10b981', bg: '#ecfdf5',
          },
          {
            icon: <Users size={18} />, label: 'Followers', value: formatNum(followersCount),
            change: changeLabel(comparison?.change?.newUsers),
            sub: `${data?.contents?.length || 0} content pieces · ${totalReviews} reviews`,
            color: '#8b5cf6', bg: '#f5f3ff',
          },
        ].map((stat, i) => (
          <div key={i} style={{ ...cardStyle, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>{stat.icon}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: stat.change.startsWith('+') ? '#10b981' : stat.change.startsWith('-') ? '#ef4444' : '#9ca3af' }}>{stat.change}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{stat.label}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, lineHeight: 1.4 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { icon: <Plus size={20} />, label: 'Add Program', desc: 'Create and publish a new fitness program', path: '/creator-dashboard/products', color: '#ff3e48' },
            { icon: <DollarSign size={20} />, label: 'Change Pricing', desc: 'Update prices on your programs', path: '/creator-dashboard/settings', color: '#10b981' },
            { icon: <Bot size={20} />, label: 'Edit Your AI', desc: 'Tune how your CreatorPal responds', path: '/creator-dashboard/your-ai', color: '#8b5cf6' },
            { icon: <Share2 size={20} />, label: 'Share CreatorPal', desc: 'Get your link and share with audience', path: '/creator-dashboard/settings', color: '#3b82f6' },
          ].map((a, i) => (
            <button key={i} type="button" onClick={() => navigate(a.path)} style={{
              padding: '20px 16px', borderRadius: 14, border: '1px solid #ede8e3', background: '#fff',
              display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${a.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color }}>{a.icon}</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{a.label}</span>
              <span style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.4 }}>{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Top Questions This Week */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Top Questions This Week</h3>
          {topQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 13 }}>
              <HelpCircle size={24} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p style={{ margin: 0 }}>No questions this week yet. Share your CreatorPal link to get started!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topQuestions.map((q, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: '#fafaf8', borderRadius: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#ff3e48', background: '#fff5f5', borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>
                    {q.count}x
                  </span>
                  <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{q.question}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CreatorPal Insights + AI Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* CreatorPal Insights */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>CreatorPal Insights</h3>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Last {days} days</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: 14, background: '#fff5f5', borderRadius: 12, textAlign: 'center' }}>
                <Zap size={16} style={{ color: '#ff3e48', marginBottom: 4 }} />
                <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{formatNum(totalAiAnswers)}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>AI Responses</div>
              </div>
              <div style={{ padding: 14, background: '#ecfdf5', borderRadius: 12, textAlign: 'center' }}>
                <ThumbsUp size={16} style={{ color: '#10b981', marginBottom: 4 }} />
                <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{reviewRating ? `${(reviewRating / 5 * 100).toFixed(0)}%` : '—'}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Satisfaction</div>
              </div>
              <div style={{ padding: 14, background: '#eff6ff', borderRadius: 12, textAlign: 'center' }}>
                <Clock size={16} style={{ color: '#3b82f6', marginBottom: 4 }} />
                <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{data?.stats?.recentChats || 0}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Chats This Week</div>
              </div>
              <div style={{ padding: 14, background: '#f5f3ff', borderRadius: 12, textAlign: 'center' }}>
                <Star size={16} style={{ color: '#8b5cf6', marginBottom: 4 }} />
                <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{reviewRating ? reviewRating.toFixed(1) : '—'}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Avg Rating ({totalReviews})</div>
              </div>
            </div>
          </div>

          {/* Your CreatorPal AI */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Your CreatorPal AI</h3>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981', background: '#ecfdf5', padding: '3px 10px', borderRadius: 99 }}>● Live</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Questions today', value: `${aiAnswersToday} answered`, valueWeight: 700 },
                { label: 'Satisfaction rate', value: reviewRating ? `${(reviewRating / 5 * 100).toFixed(0)}% positive` : '— no reviews yet', valueColor: '#10b981' },
                { label: 'Topics covered', value: `${data?.contents?.length || 0} sources` },
                { label: 'Total conversations', value: `${data?.totalChats || 0}` },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: (s as { valueWeight?: number }).valueWeight || 600, color: (s as { valueColor?: string }).valueColor || '#111827' }}>{s.value}</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => navigate('/creator-dashboard/your-ai')} style={{
              width: '100%', marginTop: 16, padding: '10px 20px', borderRadius: 10, border: 'none',
              background: '#ff3e48', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Pencil size={14} /> Edit Your CreatorPal AI
            </button>
          </div>
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Earnings Breakdown</h3>
          <button type="button" onClick={() => navigate('/creator-dashboard/revenue')} style={{ fontSize: 12, fontWeight: 600, color: '#ff3e48', background: 'none', border: 'none', cursor: 'pointer' }}>View details →</button>
        </div>
        {lifetimeEarnings === 0 && totalEarningsSum === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>
            <DollarSign size={24} style={{ marginBottom: 8, opacity: 0.4 }} />
            <p style={{ margin: 0 }}>No earnings yet. Once users start chatting with your AI, earnings will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div style={{ padding: 16, background: '#ecfdf5', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Available</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>₹{formatNum(availableBalance)}</div>
            </div>
            <div style={{ padding: 16, background: '#fef3c7', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Pending</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#d97706' }}>₹{formatNum(pendingBalance)}</div>
            </div>
            <div style={{ padding: 16, background: '#fff5f5', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Subscriptions</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#ff3e48' }}>₹{formatNum(subEarnings)}</div>
            </div>
            <div style={{ padding: 16, background: '#f5f3ff', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Lifetime</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#8b5cf6' }}>₹{formatNum(lifetimeEarnings)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboardHome;
