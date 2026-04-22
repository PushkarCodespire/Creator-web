import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import styles from './WebsiteFindExpert.module.css';
import { creatorApi, getImageUrl } from '../../services/api';
import { CREATORS } from './data/creators-data';
import type { Creator } from '../../types';

const CATEGORIES = [
  "All", "Fat Loss", "Muscle Gain", "PCOS", "Gut Health",
  "Yoga", "Nutrition", "Strength Training", "Calisthenics",
  "CrossFit", "Sports Performance", "Mental Wellness", "Women's Fitness",
];

function VerifiedIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden>
      <path d="M9 0l1.9 1.4 2.35-.11.45 2.3 1.9 1.41-1.02 2.1.65 2.27-2.08 1.11-.63 2.28-2.32-.5L9 13.9l-1.85-1.65-2.32.5-.49-2.22L2.25 9.42l.65-2.27-1.02-2.1 1.9-1.41.45-2.3L6.58 1.4z" fill="#1d9bf0" />
      <path d="M5.5 9l2.5 2.5L13 6" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden>
      <circle cx="9" cy="9" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M14 14l4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function WebsiteFindExpert() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const listRef = useRef<HTMLElement>(null);

  const scrollToList = () => {
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    (async () => {
      try {
        const params: Record<string, string | number> = { limit: 20, sortBy: 'popular' };
        if (activeCategory !== 'All') params.category = activeCategory;
        if (search.trim()) params.search = search.trim();
        const res = await creatorApi.getAll(params);
        const data = res.data.data?.creators || res.data.data || [];
        setCreators(data);
      } catch {
        // Fallback — empty list
        setCreators([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeCategory, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    scrollToList();
  };

  return (
    <div className={styles.page}>
      {/* HERO BANNER */}
      <section className={styles.hero}>
        <div className={`${styles.blob} ${styles.blobA}`} aria-hidden />
        <div className={`${styles.blob} ${styles.blobB}`} aria-hidden />
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            Get the right advice<br />
            <span className={styles.heroTitleAccent}>from the right person</span>
          </h1>
          <p className={styles.heroSub}>Ask top experts, get personalized guidance instantly</p>

          <form onSubmit={handleSearch} className={styles.searchBar} style={{ position: 'relative', zIndex: 10 }}>
            <span className={styles.searchIcon} aria-hidden><SearchIcon size={18} /></span>
            <input
              type="text"
              placeholder="What do you need help with?"
              className={styles.searchInput}
              aria-label="Search experts"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              autoComplete="off"
            />
            {search && (
              <button type="button" onClick={() => { setSearch(''); setActiveCategory('All'); }}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0 4px', fontSize: 18, lineHeight: 1 }}>×</button>
            )}
            <button type="submit" className={styles.searchBtn}>Search <ArrowRight /></button>

            {showSuggestions && (() => {
              const filtered = CATEGORIES.filter(c => c !== 'All').filter(c => !search.trim() || c.toLowerCase().includes(search.toLowerCase())).slice(0, 2);
              return (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                  background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)',
                  borderRadius: 14, padding: filtered.length ? '4px 0' : '12px 20px',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}>
                  {filtered.length === 0 && search.trim() ? (
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>No matching categories</span>
                  ) : filtered.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onMouseDown={() => { setSearch(cat); setActiveCategory(cat); setShowSuggestions(false); scrollToList(); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '11px 18px', textAlign: 'left',
                        background: activeCategory === cat ? 'rgba(255,62,72,0.15)' : 'transparent',
                        border: 'none', fontSize: 14, color: '#fff', cursor: 'pointer',
                        fontFamily: 'inherit', transition: 'background 0.12s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = activeCategory === cat ? 'rgba(255,62,72,0.15)' : 'transparent'}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff3e48', flexShrink: 0 }} />
                      {cat}
                    </button>
                  ))}
                </div>
              );
            })()}
          </form>

          <div className={styles.categoryFilters} role="tablist" aria-label="Filter by category">
            {(showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 5)).map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat}
                className={`${styles.categoryBtn} ${activeCategory === cat ? styles.categoryBtnActive : ""}`}
                onClick={() => { setActiveCategory(cat); scrollToList(); }}
              >
                {cat}
              </button>
            ))}
            <button
              type="button"
              className={styles.categoryBtn}
              onClick={() => setShowAllCategories(!showAllCategories)}
            >
              {showAllCategories ? 'Less' : 'More'}
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED EXPERTS — static design cards */}
      <section className={styles.featured}>
        <div className={styles.featuredHeader}>
          <h2 className={styles.featuredTitle}>Featured Experts</h2>
          <a href="#all" className={styles.viewAll}>View all <ArrowRight /></a>
        </div>
        <div className={styles.featuredRow}>
          {[...CREATORS, ...CREATORS].map((c, i) => (
            <div key={`${c.id}-${i}`} className={styles.featuredCard}>
              <img src={c.cardImg} alt={c.name} className={styles.featuredCardImg} />
            </div>
          ))}
        </div>
      </section>

      {/* EXPERT LIST */}
      <section ref={listRef} className={styles.expertList}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280', fontSize: 15 }}>
            Loading creators...
          </div>
        ) : creators.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280', fontSize: 15 }}>
            No creators found. Try a different search or category.
          </div>
        ) : (
          <div className={styles.expertGrid}>
            {creators.map((c) => (
              <article key={c.id} className={styles.expertRow}>
                <div className={styles.expertAvatar}>
                  {c.profileImage ? (
                    <img
                      src={getImageUrl(c.profileImage)}
                      alt={c.displayName}
                      className={styles.expertAvatarImg}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%', borderRadius: '50%',
                      background: '#ff3e48',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 22, fontWeight: 700,
                    }}>
                      {c.displayName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className={styles.expertNameWrap}>
                  <h3 className={styles.expertName}>{c.displayName}</h3>
                  {c.isVerified && <VerifiedIcon />}
                </div>
                <p className={styles.expertTitle}>{c.category || c.tagline || 'Creator'}</p>
                <div className={styles.expertBtns}>
                  <Link to={`/creator/${c.id}`} className={styles.viewProfileBtn}>View Profile</Link>
                  <Link to={`/website-chat/${c.id}`} className={styles.chatNowBtn}>Chat Now</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* BOTTOM CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Connect with the world&apos;s best minds</h2>
        <p className={styles.ctaSub}>Join thousands learning from experts in their field</p>
        <button type="button" className={styles.ctaBtn}>Get Started for Free</button>
      </section>
    </div>
  );
}
