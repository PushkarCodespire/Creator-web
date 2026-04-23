import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { homeApi, getImageUrl } from '../../services/api';
import styles from './WebsiteHome.module.css';
import { CountdownTimer } from './components/CountdownTimer';
import { CreatorsGrid, type ApiCreator } from './components/CreatorsGrid';
import { getBackendIdForSlug } from './data/config';

const ASSETS = {
  interactCreator: "/website/figma/Group%2048095692.png",
  mikeChen: "/website/figma/dfc3e6302cb302790dcc3c4feb670d6c3bdff6fe.png",
  media1: "/website/figma/Mask%20group.png",
  media2: "/website/figma/image%2017.png",
  media3: "/website/figma/image%2013.png",
  media4: "/website/figma/Mask%20group%201.png",
  media5: "/website/figma/Mask%20group%202.png",
  media6: "/website/figma/mask%201.png",
};

const CATEGORIES = ["Fat loss", "Muscle gain", "PCOS", "Gut health", "More"];

const MEDIA = [
  { src: ASSETS.media1, alt: "Flipboard", width: 148, height: 30 },
  { src: ASSETS.media2, alt: "TIME", width: 114, height: 36 },
  { src: ASSETS.media3, alt: "Entrepreneur", width: 203, height: 49 },
  { src: ASSETS.media4, alt: "Dailyhunt", width: 127, height: 41 },
  { src: ASSETS.media5, alt: "Republic", width: 133, height: 44 },
  { src: ASSETS.media6, alt: "YourStory", width: 98, height: 41 },
];

const INTERACT_POINTS = [
  "Secrets from real creator experience revealed",
  "Personalized advice for your body, goals & lifestyle",
  "24/7 available in a tap",
  "Coached 400+ peoples",
];

const EXPERTISE = ["CrossFit", "Functional Fitness", "Olympic Lifting", "Conditioning"];

function CheckCircle() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden className={styles.check}>
      <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 10.5 L9 13 L14 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden>
      <path d="M4 10h12M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMsg('');
    try {
      const res = await api.post('/newsletter/subscribe', { email: email.trim() });
      setMsg(res.data.message || 'Subscribed!');
      setEmail('');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setMsg(e?.response?.data?.error?.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.newsletter}>
      <h2 className={`${styles.sectionTitle} ${styles.sectionTitleBold} ${styles.newsletterTitle}`}>
        Top creator insights &amp; deals curated for you.<br />Delivered weekly.
      </h2>
      <p className={styles.newsletterSub}>Get free creator insights and deals</p>
      <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
        <input type="email" placeholder="Enter your email" className={styles.newsletterInput} aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit" className={styles.newsletterBtn} disabled={loading}>{loading ? 'Subscribing...' : 'Subscribe'}</button>
      </form>
      {msg && <p style={{ marginTop: 12, fontSize: 14, color: msg.includes('Failed') ? '#ef4444' : '#10b981', fontWeight: 500 }}>{msg}</p>}
    </section>
  );
}

export default function WebsiteHome() {
  const [featured, setFeatured] = useState<ApiCreator[]>([]);
  const [mainHighlight, setMainHighlight] = useState<ApiCreator | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await homeApi.getFeatured();
        const data = res.data?.data || {};
        setFeatured(data.featured || []);
        setMainHighlight(data.mainHighlight || null);
      } catch {
        // Silent fail — CreatorsGrid falls back to hardcoded list
      }
    })();
  }, []);

  return (
    <div className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Chat with your favourite<br />fitness creator
        </h1>
        <p className={styles.heroSub}>
          Get personalized advice &amp; learn from<br />their experience for free
        </p>
        <Link to="/find-expert" className={styles.heroCta}>Find right expert</Link>
      </section>

      {/* EXPERT CARDS — home shows the top 3 (order 1–3) */}
      <CreatorsGrid creators={featured.slice(0, 3)} />

      {/* MEDIA LOGOS */}
      <section className={styles.media}>
        <h2 className={styles.sectionTitle}>Creator pal in media</h2>
        <div className={styles.mediaRow}>
          {MEDIA.map((m) => (
            <img key={m.alt} src={m.src} alt={m.alt} width={m.width} height={m.height} className={styles.mediaLogo} />
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className={styles.categories}>
        <h2 className={styles.sectionTitle}>Expert guidance for following</h2>
        <div className={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <span key={cat} className={styles.category}>{cat}</span>
          ))}
        </div>
      </section>

      {/* INTERACT */}
      {(() => {
        const highlightImg = mainHighlight?.profileImage
          ? getImageUrl(mainHighlight.profileImage)
          : !mainHighlight
            ? ASSETS.interactCreator
            : null;
        const highlightName = mainHighlight?.displayName || 'Raghav Bhudhraja';
        const highlightCategory = mainHighlight?.category || mainHighlight?.tagline || '';
        const highlightTags = mainHighlight?.tags && mainHighlight.tags.length > 0
          ? mainHighlight.tags
          : EXPERTISE;
        const highlightChatId = mainHighlight?.id
          || getBackendIdForSlug('raghav')
          || 'raghav';

        return (
          <section className={styles.interact}>
            <article className={styles.interactCard}>
              <div className={styles.interactCardPhoto}>
                {highlightImg ? (
                  <img src={highlightImg} alt={highlightName} className={styles.interactCardImg} />
                ) : (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: '#ffb4b8',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    color: '#ff3e48', textAlign: 'center', padding: 24,
                  }}>
                    <div style={{ fontSize: 220, fontWeight: 700, lineHeight: 1, marginBottom: 24 }}>
                      {highlightName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, color: '#7f1d1d' }}>{highlightName}</div>
                    {highlightCategory && (
                      <div style={{ fontSize: 16, color: '#7f1d1d', opacity: 0.8 }}>{highlightCategory}</div>
                    )}
                  </div>
                )}
              </div>
            </article>

            <div className={styles.interactBody}>
              <h2 className={styles.interactHeading}>Interact, don&apos;t just consume.</h2>
              <ul className={styles.interactList}>
                {INTERACT_POINTS.map((p) => (
                  <li key={p}>
                    <CheckCircle />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.interactLabel}>Expertise</p>
              <div className={styles.interactTags}>
                {highlightTags.map((e) => (
                  <span key={e} className={styles.interactTag}>{e}</span>
                ))}
              </div>
              <Link to={`/website-chat/${highlightChatId}`} className={styles.interactChat}>
                Chat Now <ArrowRight />
              </Link>
            </div>
          </section>
        );
      })()}

      {/* NEWSLETTER */}
      <NewsletterSection />

      {/* TESTIMONIALS */}
      <section className={styles.testimonials}>
        <p className={styles.eyebrow}>TESTIMONIALS</p>
        <h2 className={`${styles.sectionTitle} ${styles.sectionTitleBold}`}>Real outcomes from creator guidance</h2>
        <div style={{ maxWidth: 700, margin: '40px auto 0', padding: '0 24px' }}>
          <div style={{ background: '#f7f0e8', borderRadius: 20, padding: 32, position: 'relative' }}>
            <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
              <img src="/website/figma/9bbdfb06a5eae3ca01387e38cee556cb0ba93eb3.png" alt="Robert Fox" style={{ width: 90, height: 90, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Robert Fox</h3>
                <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 10px' }}>Manager</p>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} viewBox="0 0 20 20" width="20" height="20"><path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27 5.23 15.71l.91-5.32L2.27 6.62l5.34-.78z" fill="#f59e0b" /></svg>
                  ))}
                </div>
              </div>
              <svg viewBox="0 0 40 28" width="44" height="30" style={{ position: 'absolute', top: 28, right: 32, opacity: 0.5 }}>
                <path d="M0 28V16.8C0 7.2 5.6 1.6 16.8 0l1.6 4.8C11.2 6.4 8.4 10 8 14h8v14H0zm21.6 0V16.8C21.6 7.2 27.2 1.6 38.4 0L40 4.8C32.8 6.4 30 10 29.6 14h8v14H21.6z" fill="#ff3e48" />
              </svg>
            </div>
            <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.7, margin: 0 }}>Joy horrible moreover man feelings own shy. Request norland neither mistake for yet. Between the for morning.</p>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className={styles.bottomCta}>
        <Link to="/pricing" className={styles.claimBtn}>Claim your free chat with expert</Link>
        <p className={styles.expires}>
          Expires soon <CountdownTimer className={styles.timer} />
        </p>
      </section>
    </div>
  );
}
