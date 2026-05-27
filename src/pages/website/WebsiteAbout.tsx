import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Compass, Video, BookOpen, ShoppingBag, Mic,
  Sparkles, Waves, Package, Phone, LifeBuoy,
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

const URGENCY_BENEFITS = [
  { icon: <Sparkles size={13} />,      title: 'Personalized setup',      sub: 'White-glove account onboarding' },
  { icon: <Waves size={13} />,         title: 'AI voice training',        sub: 'Studio-grade voice modeling' },
  { icon: <Package size={13} />,       title: 'Product integrations',     sub: 'Shopify, Amazon, affiliate stacks' },
  { icon: <Phone size={13} />,         title: 'Booking systems',          sub: 'Calendar, payments, reminders' },
  { icon: <LayoutDashboard size={13} />, title: 'Custom dashboard',       sub: 'Built around your business model' },
  { icon: <LifeBuoy size={13} />,      title: '90-day support',           sub: 'A dedicated launch partner' },
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
  '/website/figma/raghav.png',
  '/website/figma/krishansh.png',
  '/website/figma/ravya.png',
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
        {/* ── Layer 0: hero photo fills the section ── */}
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

        {/* ── Layer 1: left-side dark scrim (black → transparent) ── */}
        <img
          aria-hidden
          src="/website/figma/aboutusol.png"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',          /* stretch to cover exactly */
            display: 'block',
            mixBlendMode: 'multiply',   /* black darkens; white reveals image */
          }}
        />

        {/* ── Layer 2: content ── */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1229,
          margin: '0 auto',
          width: '100%',
          padding: '80px 48px 80px',
        }}>
          {/* Left column — text + CTA */}
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

            {/* CTA — ghost/dark button as per Figma */}
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

            {/* Social proof */}
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
                    <img
                      src={src}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
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
          Background: pure black. White ✦ star + bold title + subtitle.
          ═══════════════════════════════════════════════════════ */}
      <section style={{
        background: '#000000',
        padding: '44px 24px',
      }}>
        <div style={{
          maxWidth: 1229,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          textAlign: 'center',
        }}>
          {/* ✦ star + heading on the same line */}
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
            fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", "Inter", system-ui, sans-serif',
          }}>
            {/* Four-pointed star ✦ */}
            <span style={{ fontSize: 20, lineHeight: 1, color: '#ffffff' }}>✦</span>
            Invite Only Early Access
          </h2>

          <p style={{
            fontSize: 18,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.65)',
            lineHeight: '36px',
            margin: 0,
            fontFamily: '"Inter", system-ui, sans-serif',
          }}>
            Onboarding a limited number of creators through private access and referrals.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES
          ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 24px 104px', background: '#fbf7f4' }}>
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

          {/* Wide "Second Mind" card — two-column: text left, image right */}
          <div style={{
            background: '#111',
            borderRadius: 20,
            marginBottom: 16,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'stretch',
          }}>
            {/* Accent glow — sits behind both columns */}
            <div style={{
              position: 'absolute',
              top: -60,
              right: -40,
              width: 520,
              height: 420,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(231,93,58,0.28) 0%, transparent 60%)',
              pointerEvents: 'none',
              zIndex: 0,
            }} />

            {/* Left: icon + title + body */}
            <div style={{
              flex: '0 0 42%',
              padding: '48px 40px 48px 48px',
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              {/* Power / always-on icon */}
              <div style={{
                width: 36,
                height: 36,
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

              <p style={{
                fontSize: 14.5,
                color: 'rgba(244,239,231,0.65)',
                lineHeight: '21.75px',
                margin: 0,
              }}>
                A scalable creator presence available for your audience 24/7. Trained on your content,
                philosophy, and history — so you can finally clock out.
              </p>
            </div>

            {/* Right: always-on AI label + image */}
            <div style={{
              flex: '0 0 58%',
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '0px 0px 0',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
            }}>
              <img
                src="/website/figma/secondmind.png"
                alt=""
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  borderRadius: '10px 10px 0 0',
                  marginTop: 'auto',
                }}
              />
            </div>
          </div>

          {/* 3-column feature cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{
                background: '#fff',
                border: '1px solid #ede8e3',
                borderRadius: 16,
                padding: '28px 28px 32px',
              }}>
                <div style={{
                  width: 38,
                  height: 38,
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
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#111',
                  margin: '0 0 8px',
                  letterSpacing: '-0.01em',
                }}>{f.title}</h3>
                <p style={{
                  fontSize: 13.5,
                  color: '#666',
                  lineHeight: 1.65,
                  margin: 0,
                }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOUNDING CREATOR / URGENCY
          ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 24px 104px', background: '#fbf7f4' }}>
        <div style={{
          maxWidth: 1229,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          alignItems: 'stretch',
        }}>

          {/* Left — heading + progress bar + ghost CTA */}
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: '36px 36px 40px',
            border: '1px solid #e2d8ce',
          }}>
            <h2 style={{
              fontSize: 38,
              fontWeight: 700,
              color: '#111',
              margin: '0 0 16px',
              lineHeight: 1.22,
              letterSpacing: '-0.02em',
            }}>
              Infact if you join before 30th June, 2026 , you get
            </h2>

            <p style={{
              fontSize: 15,
              color: '#666',
              lineHeight: 1.75,
              margin: '0 0 36px',
            }}>
              Founding-creator access to CreatorPal — permanent revenue share, white-glove
              onboarding, and direct line to our product team.
            </p>

            {/* Progress bar block */}
            <div style={{ marginBottom: 40 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 10,
              }}>
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#bbb',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                }}>Founding Cohort</span>
                <div>
                  <span style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#111',
                    letterSpacing: '-0.02em',
                  }}>67</span>
                  <span style={{ fontSize: 13, color: '#999', marginLeft: 6 }}>/ 100 spots filled</span>
                </div>
              </div>

              {/* Bar */}
              <div style={{
                height: 5,
                borderRadius: 100,
                background: '#e2dbd3',
                overflow: 'hidden',
                marginBottom: 8,
              }}>
                <div style={{
                  width: '67%',
                  height: '100%',
                  borderRadius: 100,
                  background: 'linear-gradient(90deg, #e75d3a 0%, #ff3e48 100%)',
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.15em' }}>33 Remaining</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Reviewed Weekly</span>
              </div>
            </div>

            {/* Outline / ghost CTA */}
            <Link
              to="/create-your-ai"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 28px',
                borderRadius: 10,
                background: '#fff',
                border: '1.5px solid #111',
                color: '#111',
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Apply Now
              <ArrowRight />
            </Link>
          </div>

          {/* Right — dark "What's Included" card */}
          <div style={{
            background: '#111',
            borderRadius: 20,
            padding: '28px 28px 32px',
          }}>
            {/* Card header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
              }}>What's Included</span>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#fff',
                background: '#e75d3a',
                borderRadius: 100,
                padding: '4px 12px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>Founding Tier</span>
            </div>

            {/* Feature rows */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {URGENCY_BENEFITS.map((b, i) => (
                <div key={b.title} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '13px 0',
                  borderBottom: i < URGENCY_BENEFITS.length - 1
                    ? '1px solid rgba(255,255,255,0.06)'
                    : 'none',
                }}>
                  {/* Icon chip */}
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: 7,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.4)',
                    flexShrink: 0,
                  }}>
                    {b.icon}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
                      {b.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                      {b.sub}
                    </div>
                  </div>

                  {/* Green checkmark */}
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'rgba(52,199,89,0.14)',
                    border: '1px solid rgba(52,199,89,0.28)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg viewBox="0 0 12 12" width="9" height="9" aria-hidden>
                      <path d="M2 6.5l2.5 2.5 5.5-5.5" fill="none" stroke="#34c759"
                        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

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
          <p style={{
            fontSize: 16,
            color: '#888',
            textAlign: 'center',
            margin: '0 0 56px',
          }}>The people doing the work.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {CREATOR_STORIES.map((c) => (
              <div key={c.name} style={{
                borderRadius: 20,
                overflow: 'hidden',
                position: 'relative',
                minHeight: 400,
              }}>
                {/* Full-bleed gradient background */}
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

                {/* Bottom dark gradient for text legibility */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.62) 70%, rgba(0,0,0,0.78) 100%)',
                  pointerEvents: 'none',
                }} />

                {/* Card content — flex column, pushes quote+meta to bottom */}
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  minHeight: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '20px 22px 22px',
                }}>

                  {/* Top bar: category badge + location */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Category badge */}
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
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#fff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}>{c.category}</span>
                    </div>

                    {/* Location */}
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}>{c.location}</span>
                  </div>

                  {/* Spacer — pushes quote section to lower half */}
                  <div style={{ flex: 1 }} />

                  {/* Quote */}
                  <blockquote style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#fff',
                    lineHeight: 1.45,
                    margin: '0 0 18px',
                    fontStyle: 'normal',
                  }}>
                    &ldquo;{c.quote}&rdquo;
                  </blockquote>

                  {/* Metric pill */}
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

                  {/* Divider */}
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.18)', marginBottom: 16 }} />

                  {/* Creator info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={c.img}
                      alt={c.name}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        display: 'block',
                        flexShrink: 0,
                        border: '2px solid rgba(255,255,255,0.25)',
                      }}
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
          APPLY AS CREATOR
          ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 24px 112px', background: '#fbf7f4' }}>
        <div style={{ maxWidth: 1229, margin: '0 auto' }}>

          {/* Heading block — centered text, no width constraint needed */}
          <h2 style={{
            fontSize: 36,
            fontWeight: 700,
            color: '#333333',
            textAlign: 'center',
            margin: '0 0 8px',
            lineHeight: '44px',
            fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", "Inter", system-ui, sans-serif',
          }}>
            Apply as a{' '}
            {/* "creator" uses the exact Figma gradient */}
            <span style={{
              background: 'linear-gradient(90deg, #ff8a4c 0%, #ff5a3c 57.692%, #ff3e48 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>creator</span>
          </h2>
          <p style={{
            fontSize: 16,
            color: '#666',
            textAlign: 'center',
            margin: '0 0 48px',
            lineHeight: 1.6,
          }}>
            Six minutes. Hand-reviewed. Built for you.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            alignItems: 'stretch',
          }}>

            {/* ── Left — multi-step category selector ── */}
            <div style={{
              background: '#fff',
              borderRadius: 20,
              padding: '24px 24px 28px',
              border: '1px solid #e6dfd7',
              display: 'flex',
              flexDirection: 'column',
            }}>

              {/* Step progress bar */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                {[1, 2, 3].map((s) => (
                  <div key={s} style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 100,
                    background: s === 1
                      ? 'linear-gradient(90deg, #e75d3a, #ff3e48)'
                      : '#e6dfd7',
                  }} />
                ))}
              </div>

              {/* Header row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
              }}>
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#aaa',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                }}>Creator Category</span>
                <span style={{ fontSize: 12, color: '#aaa' }}>~ 6 min left</span>
              </div>

              {/* Heading */}
              <h3 style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#111',
                margin: '0 0 6px',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
              }}>What kind of creator are you?</h3>
              <p style={{ fontSize: 13, color: '#999', margin: '0 0 20px', lineHeight: 1.5 }}>
                Pick the closest category. You can change this later.
              </p>

              {/* 2-column category grid — flex-grow fills remaining left-card space */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                flex: 1,
                alignContent: 'start',
              }}>
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 14px',
                        borderRadius: 12,
                        border: `1px solid ${active ? 'transparent' : '#ede8e3'}`,
                        background: active ? '#111' : '#f7f5f2',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s, border-color 0.15s',
                      }}
                    >
                      {/* Icon — ✦ star */}
                      <span style={{
                        fontSize: 12,
                        color: active ? '#e75d3a' : '#bbb',
                        lineHeight: 1,
                        flexShrink: 0,
                      }}>✦</span>
                      <div>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: active ? '#fff' : '#222',
                          lineHeight: 1.25,
                        }}>{cat.label}</div>
                        <div style={{
                          fontSize: 11,
                          color: active ? 'rgba(255,255,255,0.45)' : '#aaa',
                          marginTop: 2,
                        }}>{cat.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer nav */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 24,
              }}>
                <button style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 0',
                  border: 'none',
                  background: 'transparent',
                  fontSize: 14,
                  color: '#666',
                  cursor: 'pointer',
                }}>
                  ← Back
                </button>
                <Link
                  to="/create-your-ai"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '11px 22px',
                    borderRadius: 10,
                    background: '#111',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Continue →
                </Link>
              </div>
            </div>

            {/* ── Right — live page preview (gradient2.png bg) ── */}
            <div style={{
              borderRadius: 20,
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Full-bleed gradient2 background */}
              <img
                src="/website/figma/gradient2.png"
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

              {/* Content layer */}
              <div style={{
                position: 'relative',
                zIndex: 1,
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}>
                {/* Label */}
                <p style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  margin: '0 0 14px',
                }}>Live Preview · Your CreatorPal Page</p>

                {/* Frosted-glass profile card */}
                <div style={{
                  background: 'rgba(8,4,2,0.52)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  borderRadius: 16,
                  padding: '22px 20px 18px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}>

                  {/* CSS sphere avatar */}
                  <div style={{
                    width: 68,
                    height: 68,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 36% 30%, #ff8a5a 0%, #cc2e18 48%, #7a0808 100%)',
                    boxShadow: '0 8px 28px rgba(180,40,10,0.6)',
                    marginBottom: 14,
                    flexShrink: 0,
                  }} />

                  {/* Name */}
                  <div style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: '#fff',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                    marginBottom: 4,
                  }}>Maya Okonjo</div>

                  {/* Handle */}
                  <div style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.38)',
                    marginBottom: 12,
                  }}>Health &amp; Movement · @mayaokonjo</div>

                  {/* Bio */}
                  <p style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.6)',
                    lineHeight: 1.6,
                    margin: '0 0 12px',
                  }}>
                    &ldquo;I help women build strength they can feel in 12 weeks — not 12 months.&rdquo;
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {['Strength', 'Mobility', 'Recovery'].map((tag) => (
                      <span key={tag} style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.48)',
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 100,
                        padding: '3px 10px',
                      }}>{tag}</span>
                    ))}
                  </div>

                  {/* Stats — 3 individual bordered boxes */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 6,
                    marginBottom: 12,
                  }}>
                    {MAYA_STATS.map((s) => (
                      <div key={s.label} style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 10,
                        padding: '10px 6px',
                        textAlign: 'center',
                      }}>
                        <div style={{
                          fontSize: 8,
                          color: 'rgba(255,255,255,0.28)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          marginBottom: 4,
                        }}>{s.label}</div>
                        <div style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: '#fff',
                          letterSpacing: '-0.01em',
                        }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* CTA buttons */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <button style={{
                      flex: 1,
                      padding: '11px 0',
                      borderRadius: 10,
                      background: 'linear-gradient(90deg, #e75d3a 0%, #d42e1e 100%)',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                    }}>Chat with Maya</button>
                    <button style={{
                      flex: 1,
                      padding: '11px 0',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.65)',
                      fontSize: 13,
                      fontWeight: 600,
                      border: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                    }}>Book a call</button>
                  </div>

                  {/* Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto',
                  }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)' }}>Step 1 of 6 · live updating</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)' }}>creatorpal.co/maya</span>
                  </div>

                </div>
              </div>
            </div>

          </div>{/* end grid */}
        </div>{/* end maxWidth wrapper */}
      </section>

    </div>
  );
}
