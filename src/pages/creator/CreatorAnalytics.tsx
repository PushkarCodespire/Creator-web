import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { creatorApi, contentApi, programApi } from '../../services/api';
import { Sparkles, HelpCircle, MessageSquare, CheckCircle, ArrowRight, Mic, Package, FileText, Star, Share2 } from 'lucide-react';

const card: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #ede8e3',
  borderRadius: 16,
  padding: 24,
};

const CreatorAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [hasVoice, setHasVoice] = useState(false);
  const [programCount, setProgramCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [dashRes, voiceRes, progRes] = await Promise.allSettled([
          creatorApi.getDashboard(),
          contentApi.getVoiceClone(),
          programApi.getAll(),
        ]);
        if (dashRes.status === 'fulfilled') setData(dashRes.value.data.data);
        if (voiceRes.status === 'fulfilled') setHasVoice(voiceRes.value.data.data?.status === 'READY');
        if (progRes.status === 'fulfilled') setProgramCount((progRes.value.data.data || []).length);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#9ca3af', fontSize: 15 }}>Loading analytics...</div>;
  }

  const totalAiAnswers = data?.stats?.totalAiAnswers || data?.totalChats || 0;
  const totalChats = data?.totalChats || 0;
  const followersCount = data?.followers?.count || 0;
  const topQuestions: { question: string; count: number }[] = data?.topQuestions || [];
  const contents = data?.contents || [];
  const reviewRating = data?.reviews?.summary?.averageRating || 0;
  const totalReviews = data?.reviews?.summary?.totalReviews || 0;

  // Engagement rate = (total AI answers / total chats) — how many chats get responses
  const engagementRate = totalChats > 0 ? Math.min(100, Math.round((totalAiAnswers / Math.max(totalChats, 1)) * 100)) : 0;

  // Conversion rate = (followers / total unique users who chatted) — approximation
  const conversionRate = totalChats > 0 ? Math.min(100, Math.round((followersCount / Math.max(totalChats, 1)) * 100)) : 0;

  // Top Creator Voices — derive from content + stats
  const voiceItems = [
    ...(contents.filter((c: { type: string; title: string }) => c.type === 'YOUTUBE_VIDEO').slice(0, 2).map((c: { type: string; title: string }) => ({
      label: c.title,
      type: 'YouTube',
      color: '#ff3e48',
      bg: '#fff5f5',
    }))),
    ...(contents.filter((c: { type: string; title: string }) => c.type === 'MANUAL_TEXT').slice(0, 2).map((c: { type: string; title: string }) => ({
      label: c.title,
      type: 'Guide',
      color: '#3b82f6',
      bg: '#eff6ff',
    }))),
    ...(contents.filter((c: { type: string; title: string }) => c.type === 'FAQ').slice(0, 1).map((c: { type: string; title: string }) => ({
      label: c.title,
      type: 'FAQ',
      color: '#d97706',
      bg: '#fef3c7',
    }))),
  ].slice(0, 5);

  const formatNum = (n: number) => {
    if (!n) return '0';
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0 }}>Audience Insights</h1>
        <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>Track your audience growth and engagement</p>
      </div>

      {/* Row 1: Stats + Creator Voices */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 16, alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 3 Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div style={card}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Questions Answered</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{formatNum(totalAiAnswers)}</div>
              <div style={{ fontSize: 11, color: '#10b981', marginTop: 6, fontWeight: 600 }}>
                {data?.stats?.aiAnswersToday ? `+${data.stats.aiAnswersToday} today` : 'All time'}
              </div>
            </div>
            <div style={card}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Engagement Rate</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{engagementRate}%</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>
                Responses per chat
              </div>
            </div>
            <div style={card}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Conversion Rate</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{conversionRate}%</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>
                Chat to follower
              </div>
            </div>
          </div>

          {/* Top Questions of the Week */}
          <div style={{ ...card, flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Top Questions of the Week</h3>
            {topQuestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>
                <HelpCircle size={20} style={{ marginBottom: 6, opacity: 0.4 }} />
                <p style={{ margin: 0 }}>No questions this week yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topQuestions.map((q, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#fafaf8', borderRadius: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#ff3e48', minWidth: 24 }}>#{i + 1}</span>
                    <span style={{ fontSize: 13, color: '#374151', flex: 1, lineHeight: 1.4 }}>{q.question}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', flexShrink: 0 }}>{q.count}x</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Creator Voices */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Top Creator Voices</h3>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 16px' }}>Your most impactful training content</p>
          {voiceItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 13 }}>
              <MessageSquare size={20} style={{ marginBottom: 6, opacity: 0.4 }} />
              <p style={{ margin: 0 }}>Add content to your AI to see your top voices</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {voiceItems.map((v, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#fafaf8', borderRadius: 12, border: '1px solid #f3f0ec' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: v.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: v.color, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {v.type.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.label}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{v.type}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mini stats below */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f3f0ec' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{followersCount}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Followers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{reviewRating ? reviewRating.toFixed(1) : '—'}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: AI Smart Recommendations */}
      {(() => {
        const hasFaqs = contents.some((c: { type: string }) => c.type === 'FAQ');
        const hasContent = contents.length > 0;

        // Build recommendations based on actual creator state
        const recommendations: { icon: React.ReactNode; title: string; desc: string; action: string; path: string; done: boolean; color: string }[] = [
          {
            icon: <FileText size={16} />, title: 'Add training content',
            desc: 'Upload YouTube videos, guides, or documents to train your AI',
            action: 'Add Content', path: '/creator-dashboard/your-ai',
            done: hasContent, color: '#ff3e48',
          },
          {
            icon: <HelpCircle size={16} />, title: 'Add FAQs',
            desc: 'Creators with FAQs get more accurate AI responses',
            action: 'Add FAQs', path: '/creator-dashboard/your-ai',
            done: hasFaqs, color: '#ff3e48',
          },
          {
            icon: <Mic size={16} />, title: 'Clone your voice',
            desc: 'Let your AI respond in your own voice for a personal touch',
            action: 'Upload Voice', path: '/creator-dashboard/your-ai',
            done: hasVoice, color: '#ff3e48',
          },
          {
            icon: <Package size={16} />, title: 'Create a program or product',
            desc: 'Monetize your expertise with fitness programs or product recommendations',
            action: 'Add Program', path: '/creator-dashboard/products',
            done: programCount > 0, color: '#ff3e48',
          },
          {
            icon: <Share2 size={16} />, title: 'Share your CreatorPal link',
            desc: 'Drive traffic by sharing your AI chatbot link on social media',
            action: 'Get Link', path: '/creator-dashboard/settings',
            done: totalAiAnswers > 10, color: '#ff3e48',
          },
          {
            icon: <Star size={16} />, title: 'Get your first review',
            desc: 'Ask fans to leave a review to boost your credibility',
            action: 'View Profile', path: `/creator/${data?.id || ''}`,
            done: totalReviews > 0, color: '#ff3e48',
          },
        ];

        const pending = recommendations.filter(r => !r.done);
        const completed = recommendations.filter(r => r.done);
        const completedCount = completed.length;
        const totalCount = recommendations.length;
        const progressPct = Math.round((completedCount / totalCount) * 100);

        return (
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ff3e48', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255,62,72,0.25)' }}>
                  <Sparkles size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>AI Smart Recommendations</h3>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Personalized tips to grow your CreatorPal</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: progressPct === 100 ? '#10b981' : '#ff3e48' }}>{progressPct}%</span>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{completedCount}/{totalCount} done</p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, marginBottom: 20, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct === 100 ? '#10b981' : 'linear-gradient(90deg, #ff5b1f, #ff3e48)', borderRadius: 3, transition: 'width 0.5s ease' }} />
            </div>

            {/* Pending recommendations */}
            {pending.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: completed.length > 0 ? 16 : 0 }}>
                {pending.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#fafaf8', borderRadius: 12, border: '1px solid #f3f0ec' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: `${r.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.color, flexShrink: 0 }}>
                      {r.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>{r.desc}</div>
                    </div>
                    <button type="button" onClick={() => navigate(r.path)} style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '7px 16px', borderRadius: 8,
                      background: r.color, color: '#fff', fontSize: 12, fontWeight: 600,
                      border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                    }}>
                      {r.action} <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Completed items */}
            {completed.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Completed</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {completed.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', opacity: 0.6 }}>
                      <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#6b7280', textDecoration: 'line-through' }}>{r.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {progressPct === 100 && (
              <div style={{ textAlign: 'center', padding: '16px 0 0', borderTop: '1px solid #f3f0ec', marginTop: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#10b981', margin: 0 }}>You're all set! Keep engaging and consider creating new programs.</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Row 3: Locations + Age Group */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

      {/* Audience Locations */}
      {(() => {
        const locations: { location: string; count: number; percentage: number }[] = data?.locationBreakdown || [];
        const hasLocData = locations.length > 0;
        const LOC_COLORS = ['#ff3e48', '#ff3e48', '#ff3e48', '#ff3e48', '#ff3e48', '#ff3e48', '#ff3e48', '#ff3e48', '#ff3e48', '#ff3e48'];

        return (
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Audience Locations</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '-8px 0 16px' }}>Where your fans are located</p>
            {!hasLocData ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>
                No location data yet. Location is collected when users sign up.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {locations.map((l, i) => (
                  <div key={l.location} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: LOC_COLORS[i % LOC_COLORS.length], flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, color: '#374151', fontWeight: 500 }}>{l.location}</span>
                    <div style={{ width: 100, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${l.percentage}%`, background: LOC_COLORS[i % LOC_COLORS.length], borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', width: 36, textAlign: 'right' }}>{l.percentage}%</span>
                    <span style={{ fontSize: 11, color: '#9ca3af', width: 24, textAlign: 'right' }}>{l.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Age Group Breakdown */}
      {(() => {
        const ageData: { label: string; count: number; percentage: number }[] = data?.ageBreakdown || [];
        const hasAgeData = ageData.some(a => a.count > 0);
        const BAR_COLORS = ['#ff3e48', '#ff3e48', '#ff3e48', '#ff3e48', '#ff3e48', '#ff3e48'];

        return (
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Age Group Breakdown</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '-8px 0 16px' }}>Based on fans who provided their date of birth</p>
            {!hasAgeData ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>
                No age data yet. Age is collected when users sign up.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 24 }}>
                {/* Bar chart */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, height: 160, paddingBottom: 24 }}>
                  {ageData.map((a, i) => {
                    const maxPct = Math.max(...ageData.map(x => x.percentage), 1);
                    const barH = a.percentage > 0 ? Math.max(16, (a.percentage / maxPct) * 110) : 6;
                    return (
                      <div key={a.label} style={{ width: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{a.percentage}%</span>
                        <div style={{
                          width: 36, height: barH, borderRadius: 8,
                          background: BAR_COLORS[i % BAR_COLORS.length],
                          transition: 'height 0.4s ease',
                        }} />
                        <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 600 }}>{a.label}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div style={{ width: 140, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
                  {ageData.filter(a => a.count > 0).map((a, _i) => (
                    <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: BAR_COLORS[ageData.indexOf(a) % BAR_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#374151' }}>{a.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginLeft: 'auto' }}>{a.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
      </div>
    </div>
  );
};

export default CreatorAnalytics;
