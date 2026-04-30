import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import styles from './WebsiteFindExpert.module.css';
import { creatorApi, homeApi, getImageUrl } from '../../services/api';
import type { Creator } from '../../types';
import type { ApiCreator } from './components/CreatorsGrid';

const CATEGORIES = [
  "All", "Fat Loss", "Muscle Gain", "PCOS", "Gut Health",
  "Yoga", "Nutrition", "Strength Training", "Calisthenics",
  "CrossFit", "Sports Performance", "Mental Wellness", "Women's Fitness",
];

const FEATURED_PER_PAGE = 8;
const EXPERTS_PER_PAGE = 10;

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

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PaginationBar({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  const pages = getPages();

  return (
    <div className={styles.pagination}>
      <button className={styles.pageNav} onClick={() => onChange(page - 1)} disabled={page === 1}>← Prev</button>
      {pages[0] > 1 && (
        <>
          <button className={styles.pageBtn} onClick={() => onChange(1)}>1</button>
          <span className={styles.pageEllipsis}>…</span>
        </>
      )}
      {pages.map(p => (
        <button
          key={p}
          className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      {pages[pages.length - 1] < totalPages && (
        <>
          <span className={styles.pageEllipsis}>…</span>
          <button className={styles.pageBtn} onClick={() => onChange(totalPages)}>{totalPages}</button>
        </>
      )}
      <button className={styles.pageNav} onClick={() => onChange(page + 1)} disabled={page === totalPages}>Next →</button>
    </div>
  );
}

export default function WebsiteFindExpert() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [featured, setFeatured] = useState<ApiCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Creator[]>([]);

  // Featured modal
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [featuredModalPage, setFeaturedModalPage] = useState(1);

  // Expert list pagination
  const [expertPage, setExpertPage] = useState(1);
  const [totalExpertPages, setTotalExpertPages] = useState(1);

  const listRef = useRef<HTMLElement>(null);
  const suggestionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await homeApi.getFeatured();
        setFeatured(res.data?.data?.featured || []);
      } catch {
        setFeatured([]);
      }
    })();
  }, []);

  // Close modal on Escape
  useEffect(() => {
    if (!showFeaturedModal) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowFeaturedModal(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showFeaturedModal]);

  const scrollToList = () => {
    if (!listRef.current) return;
    const offset = 96;
    const top = listRef.current.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const params: Record<string, string | number> = {
          limit: EXPERTS_PER_PAGE,
          page: expertPage,
          sortBy: 'popular',
        };
        if (activeCategory !== 'All') params.category = activeCategory;
        if (search.trim()) params.search = search.trim();
        const res = await creatorApi.getAll(params);
        const responseData = res.data.data;
        const data = responseData?.creators || (Array.isArray(responseData) ? responseData : []);
        setCreators(data);
        setTotalExpertPages(responseData?.pagination?.totalPages || 1);
      } catch {
        setCreators([]);
        setTotalExpertPages(1);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeCategory, search, expertPage]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setExpertPage(1);
    scrollToList();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setExpertPage(1);
    scrollToList();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setExpertPage(1);

    if (suggestionTimer.current) clearTimeout(suggestionTimer.current);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    suggestionTimer.current = setTimeout(async () => {
      try {
        const res = await creatorApi.getAll({ limit: 5, search: value.trim(), sortBy: 'popular' });
        const responseData = res.data.data;
        const data: Creator[] = responseData?.creators || (Array.isArray(responseData) ? responseData : []);
        setSuggestions(data.slice(0, 5));
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  // Featured modal pagination
  const featuredTotalPages = Math.ceil(featured.length / FEATURED_PER_PAGE);
  const featuredPageItems = featured.slice(
    (featuredModalPage - 1) * FEATURED_PER_PAGE,
    featuredModalPage * FEATURED_PER_PAGE
  );

  return (
    <div className={styles.page}>
      {/* HERO BANNER */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden>
          <div className={`${styles.blob} ${styles.blobA}`} />
          <div className={`${styles.blob} ${styles.blobB}`} />
        </div>
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
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              autoComplete="off"
            />
            {search && (
              <button type="button" onClick={() => { setSearch(''); setActiveCategory('All'); setExpertPage(1); setSuggestions([]); setShowSuggestions(false); }}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0 4px', fontSize: 18, lineHeight: 1 }}>×</button>
            )}
            <button type="submit" className={styles.searchBtn}>Search <ArrowRight /></button>

            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                background: 'rgba(15,10,10,0.96)', backdropFilter: 'blur(16px)',
                borderRadius: 14, padding: '6px 0',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 16px 40px -8px rgba(0,0,0,0.5)',
                zIndex: 20,
                maxHeight: 240, overflowY: 'auto',
              }}>
                {suggestions.map(creator => (
                  <button
                    key={creator.id}
                    type="button"
                    onMouseDown={() => {
                      setShowSuggestions(false);
                      window.location.href = `/creator/${creator.id}`;
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                      padding: '10px 16px', textAlign: 'left',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      overflow: 'hidden', background: '#ff3e48',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {creator.profileImage
                        ? <img src={getImageUrl(creator.profileImage)} alt={creator.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>{creator.displayName?.charAt(0)?.toUpperCase() || '?'}</span>
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {creator.displayName}
                      </div>
                      {(creator.category || creator.tags?.[0]) && (
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                          {creator.category || creator.tags[0]}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>

          <div className={styles.categoryFilters} role="tablist" aria-label="Filter by category">
            {(showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 5)).map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat}
                className={`${styles.categoryBtn} ${activeCategory === cat ? styles.categoryBtnActive : ""}`}
                onClick={() => handleCategoryChange(cat)}
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

      {/* FEATURED EXPERTS */}
      {featured.length > 0 && (
        <section className={styles.featured}>
          <div className={styles.featuredHeader}>
            <h2 className={styles.featuredTitle}>Featured Experts</h2>
            <button
              type="button"
              className={styles.viewAll}
              onClick={() => { setFeaturedModalPage(1); setShowFeaturedModal(true); }}
            >
              View all <ArrowRight />
            </button>
          </div>
          <div className={styles.featuredRow}>
            {featured.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                to={`/creator/${c.id}`}
                className={styles.featuredCard}
                aria-label={`View ${c.displayName}'s profile`}
              >
                {c.profileImage ? (
                  <img src={getImageUrl(c.profileImage)} alt={c.displayName} className={styles.featuredCardImg} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%', background: '#ffb4b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ff3e48', fontSize: 96, fontWeight: 700,
                  }}>
                    {c.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

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
          <>
            <div className={styles.expertGrid}>
              {creators.map((c) => (
                <article key={c.id} className={styles.expertRow}>
                  <div className={styles.expertAvatar}>
                    {c.profileImage ? (
                      <img src={getImageUrl(c.profileImage)} alt={c.displayName} className={styles.expertAvatarImg} />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%', borderRadius: '50%', background: '#ff3e48',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 22, fontWeight: 700,
                      }}>
                        {c.displayName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className={styles.expertNameWrap}>
                    <h3 className={styles.expertName}>{c.displayName}</h3>
                    {c.isFeatured && <VerifiedIcon />}
                  </div>
                  <p className={styles.expertTitle}>{c.category || c.tagline || 'Creator'}</p>
                  <div className={styles.expertBtns}>
                    <Link to={`/creator/${c.id}`} className={styles.viewProfileBtn}>View Profile</Link>
                    <Link to={`/website-chat/${c.id}`} className={styles.chatNowBtn}>Chat Now</Link>
                  </div>
                </article>
              ))}
            </div>
            <PaginationBar page={expertPage} totalPages={totalExpertPages} onChange={(p) => { setExpertPage(p); scrollToList(); }} />
          </>
        )}
      </section>

      {/* BOTTOM CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Connect with the world&apos;s best minds</h2>
        <p className={styles.ctaSub}>Join thousands learning from experts in their field</p>
        <button type="button" className={styles.ctaBtn}>Get Started for Free</button>
      </section>

      {/* FEATURED EXPERTS MODAL */}
      {showFeaturedModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFeaturedModal(false)} role="dialog" aria-modal aria-label="All Featured Experts">
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Featured Experts</h2>
              <button type="button" className={styles.modalClose} onClick={() => setShowFeaturedModal(false)} aria-label="Close">
                <CloseIcon />
              </button>
            </div>

            <div className={styles.modalBody}>
              {featuredPageItems.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>No experts to show.</p>
              ) : (
                <div className={styles.modalGrid}>
                  {featuredPageItems.map((c) => (
                    <Link
                      key={c.id}
                      to={`/creator/${c.id}`}
                      className={styles.modalCard}
                      onClick={() => setShowFeaturedModal(false)}
                      aria-label={`View ${c.displayName}'s profile`}
                    >
                      <div className={styles.modalCardImg}>
                        {c.profileImage ? (
                          <img src={getImageUrl(c.profileImage)} alt={c.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{
                            width: '100%', height: '100%', background: '#ffb4b8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#ff3e48', fontSize: 40, fontWeight: 700,
                          }}>
                            {c.displayName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <p className={styles.modalCardName}>{c.displayName}</p>
                      {c.category && <p className={styles.modalCardCategory}>{c.category}</p>}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <PaginationBar page={featuredModalPage} totalPages={featuredTotalPages} onChange={setFeaturedModalPage} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
