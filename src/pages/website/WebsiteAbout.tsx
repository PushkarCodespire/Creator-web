import React from 'react';
import { Link } from 'react-router-dom';
import styles from './WebsiteAbout.module.css';

export default function WebsiteAbout() {
  return (
    <div style={{ fontFamily: '-apple-system, "Inter", "SF Pro Display", system-ui, sans-serif', background: '#fbf7f4', overflowX: 'hidden' }}>

      <style>{`
        @keyframes heroFloat1 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes heroFloat2 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes heroFloat3 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes logoMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes orbitCard {
          from { offset-distance: 0%; }
          to   { offset-distance: 100%; }
        }
      `}</style>

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className={styles.heroSection}>
        <div className={styles.heroGrid}>

          {/* Left: photo + floating chips */}
          <div className={styles.heroLeft}>
            <img
              src="/website/figma/aas (1).png"
              alt="Raghav, co-founder of CreatorPal"
              className={styles.heroImg}
            />
            {/* Floating chip 1 */}
            <div className={styles.chip} style={{ top: 86, right: 8, animation: 'heroFloat1 3s ease-in-out infinite' }}>
              <img src="/website/figma/bg12.png" alt="" style={{ maxWidth: 190 }} />
            </div>
            {/* Floating chip 2 */}
            <div className={styles.chip} style={{ bottom: 102, right: 0, animation: 'heroFloat2 3.6s ease-in-out infinite', animationDelay: '0.6s' }}>
              <img src="/website/figma/aas (3).png" alt="" />
            </div>
            {/* Floating chip 3 */}
            <div className={styles.chip} style={{ bottom: 280, left: 0, animation: 'heroFloat3 4s ease-in-out infinite', animationDelay: '1.2s' }}>
              <img src="/website/figma/aas (4).png" alt="" />
            </div>
          </div>

          {/* Right: text */}
          <div>
            <h1 className={styles.heroTitle}>
              Hi, I'm Raghav,{' '}
              <span className={styles.heroAccent}>
                Co-<br />founder
              </span>
              {' '}, CreatorPal,
            </h1>
            <p style={{ fontSize: 15, color: '#666', lineHeight: 1.75, margin: '0 0 24px', maxWidth: 440 }}>
              After 150K+ wellness conversations and 10+ years in wellness to building PeakPals —
              One of India's leading wellness ecosystems, I realised, hot people still struggle to
              get personalised guidance from sources they trust.
            </p>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 16px' }}>
              People don't need more reels. They want real connection.
            </p>
            <p style={{ fontSize: 15, color: '#666', lineHeight: 1.75, margin: '0 0 20px', maxWidth: 440 }}>
              While creators are stuck in endless DMs and manage multiple platforms, making
              meaningful interaction impossible to scale.
            </p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: 0 }}>
              That realisation became CreatorPal.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ LOGO STRIP ═══════════════════════ */}
      <div className={styles.logoStrip}>
        <div className={styles.logoStripLabel}>As featured in</div>
        {/* Scroll viewport */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', padding: '22px 0' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, zIndex: 2, background: 'linear-gradient(to right, #fbf7f4 0%, transparent 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, zIndex: 2, background: 'linear-gradient(to left, #fbf7f4 0%, transparent 100%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', width: 'max-content', animation: 'logoMarquee 28s linear infinite', willChange: 'transform' }}>
            {(() => {
              const logos = ['The Times.', 'ENTREPRENEUR', 'Flipkart', 'Dailyhunt', 'Republic', 'YourStory', 'NewsScroll', 'Inc42'];
              return [...logos, ...logos].map((name, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', userSelect: 'none' as const }}>
                  <span style={{ fontSize: 17, fontWeight: 700, color: '#b8b0a8', letterSpacing: '0.04em', whiteSpace: 'nowrap' as const, padding: '0 8px' }}>
                    {name}
                  </span>
                  <span style={{ fontSize: 8, color: '#d4cec8', margin: '0 22px', lineHeight: 1 }}>●</span>
                </span>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* ═══════════════════════ EXPERIENCE IMAGE ═══════════════════════ */}
      <section className={styles.expSection}>
        <div className={styles.expWrap}>
          <img src="/website/figma/exp.jpg" alt="CreatorPal live consultation experience" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </section>

      {/* ═══════════════════════ ECOSYSTEM ═══════════════════════ */}
      <section className={styles.ecosystemSection}>
        {/* Heading */}
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto', padding: '0 24px 40px' }}>
          <h2 className={styles.ecosystemHeading}>Creatorpal is an all in one ecosystem</h2>
          <p className={styles.ecosystemSub}>
            Audiences can interact, get personalised guidance, discover creator-recommended
            products, access programs, and book one-on-one calls.
          </p>
        </div>

        {/* Orbit wrapper — scales down on smaller screens via CSS */}
        <div className={styles.orbitWrapper}>
          <img src="/website/figma/orbit.png" alt="" aria-hidden style={{ width: '100%', height: 'auto', display: 'block' }} />

          {/* Animated orbit cards (hidden on mobile via CSS) */}

          {/* Creator's Second Mind — OUTER 225° */}
          <div className={styles.orbitCard} style={{
            left: 20, top: 221, width: 231,
            offsetPath: 'ellipse(478px 390px at 508px 411px)',
            offsetRotate: '0deg', offsetAnchor: '50% 50%',
            animation: 'orbitCard 80s linear infinite', animationDelay: '-50s',
          } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: '#f5f0ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/website/figma/secondmind.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>Creator's Second Mind</span>
            </div>
            <p style={{ fontSize: 13, color: '#999', lineHeight: 1.55, margin: 0 }}>Built from creator life experience, accessible 24/7.</p>
          </div>

          {/* Programs — INNER 270° */}
          <div className={styles.orbitCard} style={{
            left: 400, top: 118, width: 220,
            offsetPath: 'ellipse(300px 252px at 508px 411px)',
            offsetRotate: '0deg', offsetAnchor: '50% 50%',
            animation: 'orbitCard 60s linear infinite', animationDelay: '-45s',
          } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: '#f5f0ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#555" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="12" height="10" rx="1.5" /><path d="M5 3V1M11 3V1M2 7h12" /></svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>Programs</span>
            </div>
            <p style={{ fontSize: 13, color: '#999', lineHeight: 1.55, margin: 0 }}>Get expert-led programs &amp; courses</p>
          </div>

          {/* Calls — OUTER 315° */}
          <div className={styles.orbitCard} style={{
            left: 780, top: 186, width: 220,
            offsetPath: 'ellipse(478px 390px at 508px 411px)',
            offsetRotate: '0deg', offsetAnchor: '50% 50%',
            animation: 'orbitCard 80s linear infinite', animationDelay: '-70s',
          } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: '#f5f0ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#555" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 10.5v1.5a1 1 0 01-1.09 1 9.7 9.7 0 01-4.2-1.5 9.5 9.5 0 01-2.93-2.93 9.7 9.7 0 01-1.5-4.24A1 1 0 014.87 3.33h1.5a1 1 0 011 .86 6.4 6.4 0 00.35 1.4 1 1 0 01-.22 1.05L6.9 7.24a8 8 0 002.93 2.93l.6-.57a1 1 0 011.05-.22 6.4 6.4 0 001.4.35 1 1 0 01.62 1.77z" /></svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>Calls</span>
            </div>
            <p style={{ fontSize: 13, color: '#999', lineHeight: 1.55, margin: 0 }}>Schedule 1:1 on audio/video call</p>
          </div>

          {/* Product Picks — OUTER 135° */}
          <div className={styles.orbitCard} style={{
            left: 81, top: 521, width: 220,
            offsetPath: 'ellipse(478px 390px at 508px 411px)',
            offsetRotate: '0deg', offsetAnchor: '50% 50%',
            animation: 'orbitCard 80s linear infinite', animationDelay: '-30s',
          } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: '#f5f0ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#555" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2h1.5l1 5h7l1-4H5" /><circle cx="6.5" cy="13" r="1" fill="#555" stroke="none" /><circle cx="11.5" cy="13" r="1" fill="#555" stroke="none" /></svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>Product Picks</span>
            </div>
            <p style={{ fontSize: 13, color: '#999', lineHeight: 1.55, margin: 0 }}>Skip searching. Discover creator-trusted products.</p>
          </div>

          {/* Personal guidance — OUTER 45° */}
          <div className={styles.orbitCard} style={{
            left: 759, top: 502, width: 220,
            offsetPath: 'ellipse(478px 390px at 508px 411px)',
            offsetRotate: '0deg', offsetAnchor: '50% 50%',
            animation: 'orbitCard 80s linear infinite', animationDelay: '-10s',
          } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: '#f5f0ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#555" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5" r="2.5" /><path d="M2.5 14c0-3 2.46-5 5.5-5s5.5 2 5.5 5" /></svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>Personal guidance</span>
            </div>
            <p style={{ fontSize: 13, color: '#999', lineHeight: 1.55, margin: 0 }}>Get guidance tailored to your goals</p>
          </div>

          {/* Voice Interaction — INNER 90° */}
          <div className={styles.orbitCard} style={{
            left: 400, top: 601, width: 220,
            offsetPath: 'ellipse(300px 252px at 508px 411px)',
            offsetRotate: '0deg', offsetAnchor: '50% 50%',
            animation: 'orbitCard 60s linear infinite', animationDelay: '-15s',
          } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: '#f5f0ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#555" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="5.5" y="1" width="5" height="8" rx="2.5" /><path d="M2.5 8a5.5 5.5 0 0011 0M8 13.5V15M5.5 15h5" /></svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>Voice Interaction</span>
            </div>
            <p style={{ fontSize: 13, color: '#999', lineHeight: 1.55, margin: 0 }}>Talk to creators in their own voice</p>
          </div>

          {/* Mobile feature grid — shown only on mobile via CSS */}
          <div className={styles.featureGrid}>
            {[
              { title: "Creator's Second Mind", desc: 'Built from creator life experience, accessible 24/7.', icon: <img src="/website/figma/secondmind.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} /> },
              { title: 'Programs', desc: 'Get expert-led programs & courses', icon: <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#555" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="12" height="10" rx="1.5" /><path d="M5 3V1M11 3V1M2 7h12" /></svg> },
              { title: 'Calls', desc: 'Schedule 1:1 on audio/video call', icon: <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#555" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 10.5v1.5a1 1 0 01-1.09 1 9.7 9.7 0 01-4.2-1.5 9.5 9.5 0 01-2.93-2.93 9.7 9.7 0 01-1.5-4.24A1 1 0 014.87 3.33h1.5a1 1 0 011 .86 6.4 6.4 0 00.35 1.4 1 1 0 01-.22 1.05L6.9 7.24a8 8 0 002.93 2.93l.6-.57a1 1 0 011.05-.22 6.4 6.4 0 001.4.35 1 1 0 01.62 1.77z" /></svg> },
              { title: 'Product Picks', desc: 'Discover creator-trusted products.', icon: <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#555" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2h1.5l1 5h7l1-4H5" /><circle cx="6.5" cy="13" r="1" fill="#555" stroke="none" /><circle cx="11.5" cy="13" r="1" fill="#555" stroke="none" /></svg> },
              { title: 'Personal guidance', desc: 'Guidance tailored to your goals.', icon: <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#555" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5" r="2.5" /><path d="M2.5 14c0-3 2.46-5 5.5-5s5.5 2 5.5 5" /></svg> },
              { title: 'Voice Interaction', desc: 'Talk to creators in their own voice.', icon: <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#555" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="5.5" y="1" width="5" height="8" rx="2.5" /><path d="M2.5 8a5.5 5.5 0 0011 0M8 13.5V15M5.5 15h5" /></svg> },
            ].map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <p className={styles.featureTitle}>{f.title}</p>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ BUILT ALONGSIDE CODESPIRE ═══════════════════════ */}
      <section className={styles.codespireSection}>
        <div className={styles.codespireGrid}>
          <div className={styles.codespireLeft}>
            <h2 className={styles.codespireTitle}>Built alongside<br />CodeSpire,</h2>
            <div className={styles.codespireDivider} />
            <p className={styles.codespireText}>
              One of India's leading AI-first product engineering companies, CreatorPal
              combines intelligent technology with real human understanding.
            </p>
          </div>
          <div className={styles.codespireRight}>
            <img
              src="/website/figma/ustimes.png"
              alt="US Times — CodeSpire & PeakPals launch CreatorPal"
              className={styles.codespireImg}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════ MISSION ═══════════════════════ */}
      <section className={styles.missionSection}>
        <div className={styles.missionInner}>
          <div style={{ margin: '0 auto 24px', width: 44, height: 44 }}>
            <img src="/website/figma/cplogo.png" alt="CreatorPal" style={{ width: 44, height: 44, objectFit: 'contain', opacity: 0.9 }} />
          </div>
          <h2 className={styles.missionTitle}>Mission is simple</h2>
          <p className={styles.missionSub}>
            CreatorPal is building a future where creators become scalable, interactive digital
            businesses with intelligent second minds designed to serve their audience 24/7.
          </p>
          <Link to="/about" className={styles.missionCta}>
            Talk to a creator →
          </Link>
        </div>
      </section>

    </div>
  );
}
