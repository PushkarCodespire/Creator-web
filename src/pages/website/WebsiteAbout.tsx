import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Compass, Video, BookOpen, ShoppingBag, Mic,
  Sparkles, Waves, Package, Phone, LifeBuoy, MessageSquare, TrendingUp,
} from 'lucide-react';

// ─── Data ──────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <LayoutDashboard size={18} />,
    title: 'Creator Dashboard',
    desc: 'Manage products, bookings, analytics, and your entire audience experience in one place.',
  },
  {
    icon: <Compass size={18} />,
    title: 'Personalized Guidance',
    desc: 'Help your audience through intelligent one-on-one interactions, trained on your knowledge.',
  },
  {
    icon: <Video size={18} />,
    title: 'Creator Calls',
    desc: 'Offer direct access through personalized 1:1 sessions and built-in booking flows.',
  },
  {
    icon: <BookOpen size={18} />,
    title: 'Programs & Courses',
    desc: 'Sell creator-led programs and digital experiences with built-in delivery and progress.',
  },
  {
    icon: <ShoppingBag size={18} />,
    title: 'Product Recommendations',
    desc: 'Share creator-approved products your audience trusts — with revenue share built in.',
  },
  {
    icon: <Mic size={18} />,
    title: 'Creator Voice',
    desc: 'Your audience can interact with your CreatorPal in your own voice, studio grade, 24/7.',
  },
];

// ─── Founding Features (Figma node 1396-4156) ──────────────────────────────

const FOUNDING_FEATURES = [
  {
    num: '01',
    icon: <Mic size={16} />,
    title: 'AI voice & knowledge training',
    desc: 'Your tone, philosophy, and expertise — modeled precisely.',
    value: '₹65,000+',
    valueType: 'price',
    preview: 'waveform',
  },
  {
    num: '02',
    icon: <MessageSquare size={16} />,
    title: 'Personalized audience interaction',
    desc: 'One-on-one responses, at scale, in your style.',
    value: 'INCLUDED',
    valueType: 'muted',
    preview: 'chat',
  },
  {
    num: '03',
    icon: <Package size={16} />,
    title: 'Programs, products & booking',
    desc: 'Integrated delivery, scheduling, and revenue share.',
    value: '₹75,000+',
    valueType: 'price',
    preview: 'calendar',
  },
  {
    num: '04',
    icon: <TrendingUp size={16} />,
    title: 'Creator dashboard & analytics',
    desc: 'Every booking, interaction, and metric in one place.',
    value: '₹58,000+',
    valueType: 'price',
    preview: 'chart',
  },
  {
    num: '05',
    icon: <ShoppingBag size={16} />,
    title: 'Monetization infrastructure',
    desc: 'Booking systems, recurring revenue, product integrations.',
    value: '₹46,000+',
    valueType: 'price',
    preview: 'bars',
  },
  {
    num: '06',
    icon: <LifeBuoy size={16} />,
    title: 'Personalized setup & support',
    desc: 'We configure it. You show up ready.',
    value: '₹38,000+',
    valueType: 'price',
    preview: 'checklist',
  },
  {
    num: '07',
    icon: <Sparkles size={16} />,
    title: 'Ongoing upgrades & feature access',
    desc: 'Founding creators get every new release first automatically.',
    value: 'FIRST ACCESS',
    valueType: 'pill',
    preview: 'version',
  },
];

const CREATOR_STORIES = [
  {
    name: 'Anjeni Khusul',
    category: 'FITNESS',
    location: 'LAGOS · NIGERIA',
    metric: '+$48K',
    metricSub: 'in 90 days',
    quote: 'I stopped chasing 1M views. I started chasing 100 people I could actually change.',
    bio: 'Strength coach · 184K following',
    img: '/website/figma/anjeni.png',
    gradient: '/website/figma/gradient1.png',
  },
  {
    name: 'Pratik Bhakta',
    category: 'WRITING',
    location: 'BROOKLYN · NY',
    metric: '+312',
    metricSub: 'paid members',
    quote: 'My readers became my clients became my friends. CreatorPal is the only place that lets that happen.',
    bio: 'Essayist · 92K subscribers',
    img: '/website/figma/pratik.png',
    gradient: '/website/figma/gradient2.png',
  },
  {
    name: 'Raghav Budhraja',
    category: 'FITNESS',
    location: 'DELHI · INDIA',
    metric: '94%',
    metricSub: 'repeat clients',
    quote: 'Critique calls pay my studio rent. Programs pay my staff. CreatorPal pays for my Tuesdays.',
    bio: 'Fitness coach · 31K following',
    img: '/website/figma/raghavs.png',
    gradient: '/website/figma/gradient1.png',
  },
];

const CATEGORIES = [
  { id: 'health',   label: 'Health & Movement', sub: 'Coaching programs recovery' },
  { id: 'writing',  label: 'Writing & Voice',   sub: 'Essays newsletters podcasts' },
  { id: 'design',   label: 'Design & Craft',    sub: 'Type product photography' },
  { id: 'money',    label: 'Money & Career',    sub: 'Investing careers founders' },
  { id: 'style',    label: 'Style & Home',      sub: 'Fashion interiors taste' },
  { id: 'food',     label: 'Food & Drink',      sub: 'Recipes restaurants wine' },
];

const MAYA_STATS = [
  { label: 'AUDIENCE',   value: '180K' },
  { label: 'OFFERINGS',  value: '3' },
  { label: 'REPLY RATE', value: '94%' },
];

const HERO_AVATARS = [
  '/website/figma/raghavs.png',
  '/website/figma/pratik.png',
  '/website/figma/anjeni.png',
];

// ─── Inline SVG helpers ─────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="10" cy="10" r="9" fill="rgba(231,93,58,0.12)" />
      <path d="M6 10.5l3 3 5-6" fill="none" stroke="#e75d3a" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden style={{ display: 'block' }}>
      <polygon points="12,2 22,9 12,22 2,9" fill="none" stroke="#e75d3a" strokeWidth="1.8"
        strokeLinejoin="round" />
      <polygon points="2,9 12,9 22,9" fill="none" stroke="#e75d3a" strokeWidth="1.2"
        strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden style={{ display: 'block' }}>
      <path d="M4 10h12M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Founding Feature Preview Widgets ──────────────────────────────────────

function WaveformPreview() {
  const bars = [32, 50, 72, 55, 80, 44, 65, 85, 54, 70, 28, 78, 50, 63, 30];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 56 }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: 12,
          height: h * 0.7,
          borderRadius: 100,
          background: 'linear-gradient(to top, #e75d3a, #ff9a70)',
          boxShadow: '0 2px 6px rgba(231,93,58,0.25)',
          flexShrink: 0,
        }} />
      ))}
    </div>
  );
}

function ChatPreview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
      <div style={{
        alignSelf: 'flex-start',
        background: '#fff',
        border: '1px solid #e8e2db',
        borderRadius: '10px 10px 10px 3px',
        padding: '7px 13px',
        fontSize: 12,
        color: '#333',
        fontWeight: 500,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        whiteSpace: 'nowrap',
      }}>Should I deload?</div>
      <div style={{
        alignSelf: 'flex-end',
        background: 'linear-gradient(90deg, #e75d3a 0%, #d42e1e 100%)',
        borderRadius: '10px 10px 3px 10px',
        padding: '7px 13px',
        fontSize: 12,
        color: '#fff',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>Drop 30% for 4 days.</div>
    </div>
  );
}

function CalendarGridPreview() {
  const highlighted = new Set([4, 8, 11, 13]);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 3, width: '100%' }}>
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} style={{
          paddingTop: '100%',
          position: 'relative',
          borderRadius: 5,
          background: highlighted.has(i)
            ? 'linear-gradient(135deg, #e75d3a, #ff8a5a)'
            : 'transparent',
          border: highlighted.has(i) ? 'none' : '1px solid #e4ddd6',
          boxShadow: highlighted.has(i) ? '0 2px 6px rgba(231,93,58,0.2)' : 'none',
        }} />
      ))}
    </div>
  );
}

function AnalyticsChartPreview() {
  return (
    <svg viewBox="0 0 220 56" style={{ width: '100%', height: 56, display: 'block' }} aria-hidden>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e75d3a" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#e75d3a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 48 C25 44, 50 38, 75 30 S120 20, 150 15 S185 10, 220 6"
        fill="none"
        stroke="#e75d3a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M0 48 C25 44, 50 38, 75 30 S120 20, 150 15 S185 10, 220 6 L220 56 L0 56Z"
        fill="url(#areaGrad)"
      />
      <circle cx="220" cy="6" r="3.5" fill="#e75d3a" />
    </svg>
  );
}

function RevenueBarsPreview() {
  const bars = [55, 74, 46, 60, 42, 68, 52, 80, 62, 28];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 56 }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          flex: 1,
          height: `${h}%`,
          borderRadius: '4px 4px 0 0',
          background: i === bars.length - 1
            ? 'linear-gradient(to top, #e75d3a, #ff8a5a)'
            : `rgba(231, 93, 58, ${0.35 + i * 0.065})`,
        }} />
      ))}
    </div>
  );
}

function SetupChecklistPreview() {
  const items = [
    { label: 'Account ready', done: true },
    { label: 'Voice trained', done: true },
    { label: 'Catalog · pending', done: false },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 17,
            height: 17,
            borderRadius: '50%',
            background: item.done ? '#e75d3a' : 'transparent',
            border: item.done ? 'none' : '1.5px solid #ccc',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {item.done && (
              <svg viewBox="0 0 10 10" width="8" height="8" aria-hidden>
                <path d="M1.5 5.5l2.5 2.5 4.5-5" fill="none" stroke="#fff"
                  strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span style={{
            fontSize: 12,
            color: item.done ? '#333' : '#aaa',
            fontWeight: item.done ? 600 : 400,
          }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function VersionUpgradePreview() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
      <div style={{
        padding: '7px 16px',
        borderRadius: 8,
        border: '1px solid #ddd6ce',
        fontSize: 13,
        fontWeight: 600,
        color: '#aaa',
        background: '#fff',
      }}>v2.4</div>
      <span style={{ color: '#bbb', fontSize: 13, fontWeight: 500 }}>→</span>
      <div style={{
        padding: '7px 16px',
        borderRadius: 8,
        background: 'linear-gradient(135deg, #e75d3a 0%, #d42e1e 100%)',
        fontSize: 13,
        fontWeight: 700,
        color: '#fff',
        boxShadow: '0 3px 12px rgba(231,93,58,0.38)',
      }}>v3.0</div>
    </div>
  );
}

function FeaturePreview({ type }: { type: string }) {
  const wrapStyle: React.CSSProperties = {
    width: 220,
    background: '#fdf6f0',
    border: '1px solid #f0e8e0',
    borderRadius: 12,
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };
  return (
    <div style={wrapStyle}>
      {type === 'waveform'  && <WaveformPreview />}
      {type === 'chat'      && <ChatPreview />}
      {type === 'calendar'  && <CalendarGridPreview />}
      {type === 'chart'     && <AnalyticsChartPreview />}
      {type === 'bars'      && <RevenueBarsPreview />}
      {type === 'checklist' && <SetupChecklistPreview />}
      {type === 'version'   && <VersionUpgradePreview />}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function WebsiteAbout() {
  const [selectedCategory, setSelectedCategory] = useState('health');

  return (
    <div style={{ minHeight: '100vh', background: '#fbf7f4' }}>

      {/* ═══════════════════════════════════════════════════════
          HERO — full-viewport, abouthero.jpg + aboutusol overlay
          ═══════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        minHeight: 680,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Layer 0: hero photo */}
        <img
          aria-hidden
          src="/website/figma/abouthero.jpg"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'right center',
            display: 'block',
          }}
        />

        {/* Layer 1: left-side dark scrim */}
        <img
          aria-hidden
          src="/website/figma/aboutusol.png"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            display: 'block',
            mixBlendMode: 'multiply',
          }}
        />

        {/* Layer 2: content */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1229,
          margin: '0 auto',
          width: '100%',
          padding: '80px 48px',
        }}>
          <div style={{ maxWidth: '40vw' }}>
            <h1 style={{
              fontSize: 52,
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.1,
              margin: '0 0 18px',
              letterSpacing: '-0.025em',
            }}>
              Turn Your Audience Into An{' '}
              <span style={{ color: '#e75d3a' }}>Interactive Ecosystem</span>
            </h1>
            <p style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.75,
              margin: '0 0 32px',
              maxWidth: '30vw',
            }}>
              Build deeper audience relationships by personalized chats, calls,
              programs &amp; more generating revenue on daily basis.
            </p>
            <Link
              to="/create-your-ai"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 22px',
                borderRadius: 8,
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.28)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            >
              Apply As A Creator
              <ArrowRight />
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
              <div style={{ display: 'flex' }}>
                {HERO_AVATARS.map((src, i) => (
                  <div
                    key={i}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      overflow: 'hidden',
                      background: '#555',
                      marginLeft: i > 0 ? -9 : 0,
                      position: 'relative',
                      zIndex: HERO_AVATARS.length - i,
                    }}
                  >
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                100+ creators applied
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          INVITE-ONLY BANNER
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: '#000000', padding: '44px 24px' }}>
        <div style={{
          maxWidth: 1229,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          textAlign: 'center',
        }}>
          <h2 style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            fontSize: 36,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: '44px',
            margin: 0,
          }}>
            <span style={{ fontSize: 20, lineHeight: 1, color: '#ffffff' }}>✦</span>
            Invite Only Early Access
          </h2>
          <p style={{
            fontSize: 18,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.65)',
            lineHeight: '36px',
            margin: 0,
          }}>
            Onboarding a limited number of creators through private access and referrals.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES — commented out
          ═══════════════════════════════════════════════════════ */}
      {false && <section style={{ padding: '96px 24px 104px', background: '#fbf7f4' }}>
        <div style={{ maxWidth: 1229, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 40,
            fontWeight: 700,
            color: '#111',
            textAlign: 'center',
            margin: '0 0 56px',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}>
            After joining CreatorPal, here's what you'll get
          </h2>

          {/* Wide "Second Mind" card */}
          <div style={{
            background: '#111',
            borderRadius: 20,
            marginBottom: 16,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'stretch',
          }}>
            <div style={{
              position: 'absolute',
              top: -60, right: -40,
              width: 520, height: 420,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(231,93,58,0.28) 0%, transparent 60%)',
              pointerEvents: 'none',
              zIndex: 0,
            }} />
            <div style={{
              flex: '0 0 42%',
              padding: '48px 40px 48px 48px',
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                flexShrink: 0,
              }}>
                <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden>
                  <path d="M10 3v7" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M6.34 5.34A6 6 0 1 0 13.66 5.34" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <h3 style={{
                fontSize: 30,
                fontWeight: 700,
                color: '#f4efe7',
                margin: '0 0 16px',
                letterSpacing: '-0.6px',
                lineHeight: '33px',
              }}>Your Second Mind.</h3>
              <p style={{ fontSize: 14.5, color: 'rgba(244,239,231,0.65)', lineHeight: '21.75px', margin: 0 }}>
                A scalable creator presence available for your audience 24/7. Trained on your content,
                philosophy, and history — so you can finally clock out.
              </p>
            </div>
            <div style={{
              flex: '0 0 58%',
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
            }}>
              <img
                src="/website/figma/secondmind.png"
                alt=""
                style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '10px 10px 0 0', marginTop: 'auto' }}
              />
            </div>
          </div>

          {/* 3-column feature cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{
                background: '#fff',
                border: '1px solid #ede8e3',
                borderRadius: 16,
                padding: '28px 28px 32px',
              }}>
                <div style={{
                  width: 38, height: 38,
                  borderRadius: 10,
                  background: '#f0ede9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#555',
                  marginBottom: 20,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: '#666', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* ═══════════════════════════════════════════════════════
          FOUNDING CREATOR VALUE TABLE
          Figma: node 1396-4156 — "Background+Border+Shadow"
          ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 24px 96px', background: '#fbf7f4' }}>
        <div style={{ maxWidth: 1229, margin: '0 auto' }}>

          {/* Outer card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e8e1d8',
            borderRadius: 20,
            boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>

            {/* ── Header ── */}
            <div style={{
              padding: '18px 40px',
              borderBottom: '1px solid #ede8e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#b0a89e',
                letterSpacing: '0.04em',
              }}>
                CP-2026 · prepared for new founding creator
              </span>
              <span style={{
                fontSize: 11,
                color: '#c8c0b6',
                letterSpacing: '0.04em',
              }}>
                Founding tier — limited spots
              </span>
            </div>

            {/* ── Feature rows ── */}
            {FOUNDING_FEATURES.map((f, i) => (
              <div
                key={f.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0,
                  padding: '28px 40px',
                  borderBottom: i < FOUNDING_FEATURES.length - 1 ? '1px solid #ede8e2' : 'none',
                  minHeight: 120,
                }}
              >
                {/* ── Number ── */}
                <div style={{
                  width: 64,
                  flexShrink: 0,
                  fontSize: 44,
                  fontWeight: 700,
                  color: '#cec6bc',
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                  fontFamily: '-apple-system, "SF Pro Display", "Inter", system-ui, sans-serif',
                }}>
                  {f.num}
                </div>

                {/* ── Icon box ── */}
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: '#f5f0eb',
                  border: '1px solid #ede7e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7a6e65',
                  flexShrink: 0,
                  marginRight: 24,
                }}>
                  {f.icon}
                </div>

                {/* ── Title + description ── */}
                <div style={{ flex: 1, minWidth: 0, paddingRight: 32 }}>
                  <h3 style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#111',
                    margin: '0 0 6px',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                  }}>
                    {f.title}
                  </h3>
                  <p style={{
                    fontSize: 14,
                    color: '#888',
                    margin: 0,
                    lineHeight: 1.55,
                  }}>
                    {f.desc}
                  </p>
                </div>

                {/* ── Preview widget ── */}
                <FeaturePreview type={f.preview} />

                {/* ── Price / value ── */}
                <div style={{ width: 160, flexShrink: 0, textAlign: 'right', paddingLeft: 24 }}>
                  {f.valueType === 'price' && (
                    <span style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: '#111',
                      letterSpacing: '-0.02em',
                      whiteSpace: 'nowrap',
                    }}>
                      {f.value}
                    </span>
                  )}
                  {f.valueType === 'muted' && (
                    <span style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#b0a89e',
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.1em',
                    }}>
                      {f.value}
                    </span>
                  )}
                  {f.valueType === 'pill' && (
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: '1.5px solid #e75d3a',
                      background: 'rgba(231,93,58,0.06)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#e75d3a',
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.08em',
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {f.value}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* ── Total value footer ── */}
            <div style={{
              padding: '36px 40px',
              borderTop: '1px solid #ede8e2',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'end',
              gap: 32,
            }}>
              <div>
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#e75d3a',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.15em',
                  marginBottom: 10,
                }}>
                  Total Estimated Value
                </div>
                <p style={{
                  fontSize: 16,
                  color: '#444',
                  lineHeight: 1.65,
                  margin: 0,
                  maxWidth: 460,
                }}>
                  Founding creators receive this as a working system built around them — not a feature list.
                </p>
              </div>
              <div style={{
                fontSize: 51,
                fontWeight: 700,
                color: '#111',
                letterSpacing: '-0.04em',
                lineHeight: 1,
                whiteSpace: 'nowrap' as const,
              }}>
                ₹2,82,000 +
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOUNDING CREATOR / URGENCY — commented out, replaced above
          ═══════════════════════════════════════════════════════ */}
      {false && (
        <section style={{ padding: '96px 24px 104px', background: '#fbf7f4' }}>
          {/* Section replaced by Figma node 1396-4156 value table above */}
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          CREATOR STORIES
          ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 24px 104px', background: '#fbf7f4' }}>
        <div style={{ maxWidth: 1229, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 40,
            fontWeight: 700,
            color: '#111',
            textAlign: 'center',
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}>Creator stories</h2>
          <p style={{ fontSize: 16, color: '#888', textAlign: 'center', margin: '0 0 56px' }}>
            The people doing the work.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {CREATOR_STORIES.map((c) => (
              <div key={c.name} style={{
                borderRadius: 20,
                overflow: 'hidden',
                position: 'relative',
                minHeight: 400,
              }}>
                <img
                  src={c.gradient}
                  alt=""
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.62) 70%, rgba(0,0,0,0.78) 100%)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  minHeight: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '20px 22px 22px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(0,0,0,0.28)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      borderRadius: 100,
                      padding: '5px 12px',
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e75d3a', flexShrink: 0 }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.category}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.location}</span>
                  </div>
                  <div style={{ flex: 1 }} />
                  <blockquote style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.45, margin: '0 0 18px', fontStyle: 'normal' }}>
                    &ldquo;{c.quote}&rdquo;
                  </blockquote>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    borderRadius: 100,
                    padding: '6px 14px',
                    alignSelf: 'flex-start',
                    marginBottom: 16,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{c.metric}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{c.metricSub}</span>
                  </div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.18)', marginBottom: 16 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={c.img}
                      alt={c.name}
                      style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', display: 'block', flexShrink: 0, border: '2px solid rgba(255,255,255,0.25)' }}
                    />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{c.bio}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          APPLY AS CREATOR — commented out
          (replaced by direct /create-your-ai flow)
          ═══════════════════════════════════════════════════════ */}
      {false && (
        <section style={{ padding: '96px 24px 112px', background: '#fbf7f4' }}>
          <div style={{ maxWidth: 1229, margin: '0 auto' }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#333', textAlign: 'center', margin: '0 0 8px' }}>
              Apply as a{' '}
              <span style={{ background: 'linear-gradient(90deg, #ff8a4c 0%, #ff5a3c 57%, #ff3e48 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>creator</span>
            </h2>
            <p style={{ fontSize: 16, color: '#666', textAlign: 'center', margin: '0 0 48px' }}>Six minutes. Hand-reviewed. Built for you.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid #e6dfd7' }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                  {[1, 2, 3].map((s) => (
                    <div key={s} style={{ flex: 1, height: 3, borderRadius: 100, background: s === 1 ? 'linear-gradient(90deg, #e75d3a, #ff3e48)' : '#e6dfd7' }} />
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
                  {CATEGORIES.map((cat) => {
                    const active = selectedCategory === cat.id;
                    return (
                      <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                        borderRadius: 12, border: `1px solid ${active ? 'transparent' : '#ede8e3'}`,
                        background: active ? '#111' : '#f7f5f2', cursor: 'pointer', textAlign: 'left',
                      }}>
                        <span style={{ fontSize: 12, color: active ? '#e75d3a' : '#bbb' }}>✦</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: active ? '#fff' : '#222' }}>{cat.label}</div>
                          <div style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.45)' : '#aaa', marginTop: 2 }}>{cat.sub}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                  <Link to="/create-your-ai" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 22px', borderRadius: 10, background: '#111', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                    Continue →
                  </Link>
                </div>
              </div>
              <div style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', minHeight: 300, background: '#1a0f0a' }}>
                <img src="/website/figma/gradient2.png" alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'relative', zIndex: 1, padding: 22 }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', margin: '0 0 14px' }}>Live Preview · Your CreatorPal Page</p>
                  <div style={{ background: 'rgba(8,4,2,0.52)', backdropFilter: 'blur(18px)', borderRadius: 16, padding: '22px 20px 18px', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'radial-gradient(circle at 36% 30%, #ff8a5a, #cc2e18, #7a0808)', marginBottom: 12 }} />
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Maya Okonjo</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginBottom: 12 }}>Health &amp; Movement · @mayaokonjo</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'linear-gradient(90deg, #e75d3a, #d42e1e)', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Chat with Maya</button>
                      <button style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)', fontSize: 12, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>Book a call</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── unused helper refs (suppress lint) ── */}
      {false && <>{CheckIcon}{DiamondIcon}</>}

    </div>
  );
}
