import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, TrendingUp, Users, Zap } from 'lucide-react';
import { creatorApi, payoutApi } from '../../services/api';
import { useDashboardFilter } from '../../components/layouts/DashboardFilterContext';

const card: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #ede8e3',
  borderRadius: 16,
  padding: 24,
};

const CreatorDetailedAnalytics = () => {
  const navigate = useNavigate();
  const { days: globalDays } = useDashboardFilter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashboard, setDashboard] = useState<any>(null);
  const [trendData, setTrendData] = useState<number[]>([]);
  const [trendLabels, setTrendLabels] = useState<string[]>([]);
  const [trendDays, setTrendDays] = useState(7);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [comparison, setComparison] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [_earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [dashRes, compRes, earnRes] = await Promise.allSettled([
          creatorApi.getDashboard(),
          creatorApi.getComparativeAnalytics(globalDays),
          payoutApi.getEarningsBreakdown(),
        ]);
        if (dashRes.status === 'fulfilled') setDashboard(dashRes.value.data.data);
        if (compRes.status === 'fulfilled') setComparison(compRes.value.data.data);
        if (earnRes.status === 'fulfilled') setEarnings(earnRes.value.data.data);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [globalDays]);

  // Separate effect for trend chart — responds to trendDays toggle
  useEffect(() => {
    (async () => {
      try {
        const res = await creatorApi.getEngagementTrend(trendDays);
        const raw = res.data.data;
        const trend = raw?.trend || raw;
        if (Array.isArray(trend)) {
          setTrendData(trend.map((d: { count?: number; messages?: number; value?: number }) => d.count || d.messages || d.value || 0));
          setTrendLabels(trend.map((d: { date?: string }) => {
            const date = d.date || '';
            if (date.includes('T')) {
              // Hourly: "2026-04-14T09" → "9 AM"
              const hour = parseInt(date.split('T')[1], 10);
              return hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`;
            }
            // Daily: "2026-04-14" → "Apr 14"
            const parts = date.split('-');
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return `${months[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}`;
          }));
        }
      } catch {}
    })();
  }, [trendDays]);

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#9ca3af', fontSize: 15 }}>Loading analytics...</div>;
  }

  const totalAiAnswers = dashboard?.stats?.totalAiAnswers || dashboard?.totalChats || 0;
  const aiAnswersToday = dashboard?.stats?.aiAnswersToday || 0;
  const totalChats = dashboard?.totalChats || 0;
  const followersCount = dashboard?.followers?.count || 0;
  const reviewRating = dashboard?.reviews?.summary?.averageRating || 0;
  const totalReviews = dashboard?.reviews?.summary?.totalReviews || 0;
  const contents = dashboard?.contents || [];
  const topQuestions: { question: string; count: number }[] = dashboard?.topQuestions || [];

  // Derived metrics
  const engagementRate = totalChats > 0 ? Math.min(100, Math.round((totalAiAnswers / Math.max(totalChats, 1)) * 100)) : 0;
  const growthPct = comparison?.change?.newUsers || 0;

  // Change labels
  const changeLabel = (val: number | undefined) => {
    if (!val && val !== 0) return '';
    return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
  };
  const msgChange = changeLabel(comparison?.change?.messages);
  const _revChange = changeLabel(comparison?.change?.revenue);
  const userChange = changeLabel(comparison?.change?.newUsers);

  // Chart
  const chartPoints = trendData.length > 0 ? trendData : Array(globalDays).fill(0);
  const maxVal = Math.max(...chartPoints, 1);
  const w = 900, h = 200, px = 40, py = 20;
  const chartW = w - px * 2, chartH = h - py * 2;
  const points = chartPoints.map((v, i) => {
    const x = px + (i / Math.max(chartPoints.length - 1, 1)) * chartW;
    const y = py + chartH - (v / maxVal) * chartH;
    return `${x},${y}`;
  }).join(' ');
  const areaPath = `M${px},${py + chartH} L${points.split(' ').map(p => p).join(' L')} L${px + chartW},${py + chartH} Z`;

  // Y-axis ticks
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxVal / 4) * i));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0 }}>Analytics</h1>
          <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>Track your content performance and audience growth</p>
        </div>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>Last {globalDays} days</span>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { icon: <MessageSquare size={18} />, value: totalAiAnswers.toLocaleString(), label: 'Questions Answered', sub: aiAnswersToday ? `+${aiAnswersToday} today` : 'All time', change: msgChange, color: '#ff3e48', bg: '#fff5f5' },
          { icon: <Zap size={18} />, value: `${engagementRate}%`, label: 'Engagement Rate', sub: 'AI responses per chat', change: '', color: '#10b981', bg: '#ecfdf5' },
          { icon: <TrendingUp size={18} />, value: growthPct ? `${growthPct > 0 ? '+' : ''}${growthPct.toFixed(1)}%` : '0%', label: 'Growth Rate', sub: 'New users vs last period', change: userChange, color: '#3b82f6', bg: '#eff6ff' },
          { icon: <Users size={18} />, value: `${followersCount}`, label: 'Followers', sub: `${totalReviews} reviews · ${reviewRating ? reviewRating.toFixed(1) : '0'} avg`, change: '', color: '#8b5cf6', bg: '#f5f3ff' },
        ].map((s, i) => (
          <div key={i} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
              {s.change && <span style={{ fontSize: 11, fontWeight: 600, color: s.change.startsWith('+') ? '#10b981' : s.change.startsWith('-') ? '#ef4444' : '#9ca3af' }}>{s.change}</span>}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Engagement Trends Chart */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Engagement Trends</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>AI responses per day</p>
          </div>
          <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 8, padding: 3 }}>
            {[{ label: '1D', value: 1 }, { label: '7D', value: 7 }, { label: '30D', value: 30 }].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTrendDays(opt.value)}
                style={{
                  padding: '5px 14px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600,
                  background: trendDays === opt.value ? '#fff' : 'transparent',
                  color: trendDays === opt.value ? '#111827' : '#9ca3af',
                  cursor: 'pointer',
                  boxShadow: trendDays === opt.value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <svg viewBox={`0 0 ${w} ${h + 30}`} width="100%" height="240" style={{ display: 'block' }}>
          {yTicks.map((v) => {
            const y = py + chartH - (v / maxVal) * chartH;
            return (
              <g key={v}>
                <text x={px - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{v}</text>
                <line x1={px} y1={y} x2={px + chartW} y2={y} stroke="#f3f4f6" strokeWidth="1" />
              </g>
            );
          })}
          <path d={areaPath} fill="url(#areaGrad)" opacity="0.3" />
          <polyline points={points} fill="none" stroke="#ff3e48" strokeWidth="2" strokeLinejoin="round" />
          {chartPoints.map((_, i) => {
            const step = Math.max(1, Math.ceil(chartPoints.length / 10));
            if (i % step !== 0 && i !== chartPoints.length - 1) return null;
            const x = px + (i / Math.max(chartPoints.length - 1, 1)) * chartW;
            const label = trendLabels[i] || `${i + 1}`;
            return <text key={i} x={x} y={h + 16} textAnchor="middle" fontSize="9" fill="#9ca3af">{label}</text>;
          })}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff3e48" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ff3e48" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff3e48' }} /><span style={{ fontSize: 12, color: '#6b7280' }}>AI Responses / Day</span></div>
        </div>
      </div>

      {/* Bottom: Top Content + Chat Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top Content */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Top Content</h3>
            <button type="button" onClick={() => navigate('/creator-dashboard/your-ai')} style={{ fontSize: 11, fontWeight: 600, color: '#ff3e48', background: '#fff5f5', padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>Manage</button>
          </div>
          {contents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 13 }}>No content added yet</div>
          ) : (
            contents.slice(0, 5).map((c: { id: string; type: string; title: string; status: string }, i: number) => {
              const typeColors: Record<string, string> = { YOUTUBE_VIDEO: '#ff3e48', MANUAL_TEXT: '#3b82f6', FAQ: '#d97706', UPLOADED_FILE: '#10b981' };
              const typeLabels: Record<string, string> = { YOUTUBE_VIDEO: 'YouTube', MANUAL_TEXT: 'Guide', FAQ: 'FAQ', UPLOADED_FILE: 'File' };
              const color = typeColors[c.type] || '#6b7280';
              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i > 0 ? '1px solid #f5f0eb' : 'none' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, border: `2px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color, flexShrink: 0,
                  }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title || 'Untitled'}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{typeLabels[c.type] || c.type}</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                    background: c.status === 'COMPLETED' ? '#ecfdf5' : '#fef3c7',
                    color: c.status === 'COMPLETED' ? '#10b981' : '#d97706',
                  }}>
                    {c.status === 'COMPLETED' ? 'Active' : c.status}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Chat & Revenue Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Chat Stats */}
          <div style={card}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Chat Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: 14, background: '#fff5f5', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{totalAiAnswers}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Total AI Responses</div>
              </div>
              <div style={{ padding: 14, background: '#ecfdf5', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{aiAnswersToday}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Answered Today</div>
              </div>
              <div style={{ padding: 14, background: '#eff6ff', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{dashboard?.stats?.recentChats || 0}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Chats This Week</div>
              </div>
              <div style={{ padding: 14, background: '#f5f3ff', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{totalChats}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Total Conversations</div>
              </div>
            </div>
          </div>

          {/* Top Questions */}
          <div style={card}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Popular Questions</h3>
            {topQuestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#9ca3af', fontSize: 13 }}>No questions this week</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {topQuestions.slice(0, 3).map((q, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#fafaf8', borderRadius: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#ff3e48', background: '#fff5f5', borderRadius: 4, padding: '1px 6px' }}>{q.count}x</span>
                    <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.3 }}>{q.question}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDetailedAnalytics;
