import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { creatorApi, reviewApi, programApi, bookingApi, followApi, getImageUrl } from '../../services/api';
import styles from './WebsiteProfile.module.css';

/* ---------- SVG Icons ---------- */
function VerifiedIcon() {
  return (
    <svg viewBox="0 0 18 18" width="20" height="20" className={styles.verifiedBadge}>
      <path d="M9 0l1.9 1.4 2.35-.11.45 2.3 1.9 1.41-1.02 2.1.65 2.27-2.08 1.11-.63 2.28-2.32-.5L9 13.9l-1.85-1.65-2.32.5-.49-2.22L2.25 9.42l.65-2.27-1.02-2.1 1.9-1.41.45-2.3L6.58 1.4z" fill="#1d9bf0" />
      <path d="M5.5 9l2.5 2.5L13 6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16">
      <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27 5.23 15.71l.91-5.32L2.27 6.62l5.34-.78z"
        fill={filled ? '#fbbf24' : '#e5e7eb'} stroke={filled ? '#fbbf24' : '#e5e7eb'} strokeWidth="0.5" />
    </svg>
  );
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} viewBox="0 0 20 20" width={size} height={size}>
          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27 5.23 15.71l.91-5.32L2.27 6.62l5.34-.78z"
            fill={i <= Math.round(rating) ? '#fbbf24' : '#e5e7eb'} />
        </svg>
      ))}
    </div>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.4 31.4 0 000 12a31.4 31.4 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.4 31.4 0 0024 12a31.4 31.4 0 00-.5-5.8zM9.5 15.5V8.5l6.3 3.5-6.3 3.5z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2.2c2.7 0 3 0 4.1.1 1 0 1.5.2 1.9.3a3.2 3.2 0 011.9 1.9c.1.4.3.9.3 1.9 0 1 .1 1.4.1 4.1s0 3-.1 4.1c0 1-.2 1.5-.3 1.9a3.2 3.2 0 01-1.9 1.9c-.4.1-.9.3-1.9.3-1 0-1.4.1-4.1.1s-3 0-4.1-.1c-1 0-1.5-.2-1.9-.3a3.2 3.2 0 01-1.9-1.9c-.1-.4-.3-.9-.3-1.9 0-1-.1-1.4-.1-4.1s0-3 .1-4.1c0-1 .2-1.5.3-1.9A3.2 3.2 0 016 2.6c.4-.1.9-.3 1.9-.3 1 0 1.4-.1 4.1-.1M12 0C9.3 0 8.9 0 7.8.1 6.7.1 5.9.3 5.2.6a5.4 5.4 0 00-2 1.3 5.4 5.4 0 00-1.3 2C1.6 4.6 1.4 5.4 1.4 6.5 1.3 7.5 1.3 8 1.3 12s0 4.5.1 5.5c0 1.1.2 1.9.5 2.6a5.4 5.4 0 001.3 2 5.4 5.4 0 002 1.3c.7.3 1.5.5 2.6.5 1 .1 1.5.1 5.5.1s4.5 0 5.5-.1c1.1 0 1.9-.2 2.6-.5a5.4 5.4 0 002-1.3 5.4 5.4 0 001.3-2c.3-.7.5-1.5.5-2.6.1-1 .1-1.5.1-5.5s0-4.5-.1-5.5c0-1.1-.2-1.9-.5-2.6a5.4 5.4 0 00-1.3-2 5.4 5.4 0 00-2-1.3C18.6.3 17.8.1 16.7.1 15.7 0 15.2 0 12 0zm0 5.8a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-11.8a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WebIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2H3v2a9 9 0 008 8.94V23h2v-2.06A9 9 0 0021 12v-2h-2z" />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
      <path d="M5 7l5 5 5-5" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

const CONTENT_ICONS: Record<string, { bg: string; color: string; label: string }> = {
  YOUTUBE_VIDEO: { bg: '#fff5f5', color: '#ff3e48', label: 'YouTube' },
  MANUAL_TEXT: { bg: '#eff6ff', color: '#3b82f6', label: 'Guide' },
  FAQ: { bg: '#fef3c7', color: '#d97706', label: 'FAQ' },
  UPLOADED_FILE: { bg: '#f0fdf4', color: '#10b981', label: 'File' },
  INSTAGRAM_POST: { bg: '#fdf2f8', color: '#ec4899', label: 'Instagram' },
};

export default function WebsiteProfile() {
  const { creatorId } = useParams<{ creatorId: string }>();
  const [searchParams] = useSearchParams();
  const [creator, setCreator] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'about' | 'faqs' | 'reviews' | 'offerings' | 'bookings'>(
    (['about', 'faqs', 'reviews', 'offerings', 'bookings'] as const).includes(initialTab as never)
      ? (initialTab as 'about' | 'faqs' | 'reviews' | 'offerings' | 'bookings')
      : 'about'
  );
  const [programs, setPrograms] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [slots, setSlots] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingMsg, setBookingMsg] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editHover, setEditHover] = useState(0);
  const [editText, setEditText] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchProfileData = async () => {
    if (!creatorId) return;
    try {
      const [profileRes, programsRes, slotsRes] = await Promise.all([
        creatorApi.getById(creatorId),
        programApi.getByCreator(creatorId).catch(() => ({ data: { data: [] } })),
        bookingApi.getPublicSlots(creatorId).catch(() => ({ data: { data: [] } })),
      ]);
      const profile = profileRes.data.data;
      setCreator(profile);
      setFollowerCount(profile.followers?.count ?? profile.followersCount ?? 0);
      setPrograms(programsRes.data.data || []);
      setSlots(slotsRes.data.data || []);
    } catch {
      setError('Creator not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [creatorId]);

  // Refetch when window regains focus (user switches back from another tab)
  useEffect(() => {
    const onFocus = () => fetchProfileData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [creatorId]);

  useEffect(() => {
    if (!isAuthenticated || !creatorId) return;
    followApi.checkFollowing(creatorId)
      .then(res => setIsFollowing(res.data.data.isFollowing))
      .catch(() => {});
  }, [creatorId, isAuthenticated]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (followLoading) return;
    const next = !isFollowing;
    setIsFollowing(next);
    setFollowerCount(c => next ? c + 1 : Math.max(0, c - 1));
    setFollowLoading(true);
    try {
      if (next) await followApi.followCreator(creatorId!);
      else await followApi.unfollowCreator(creatorId!);
    } catch {
      setIsFollowing(!next);
      setFollowerCount(c => next ? Math.max(0, c - 1) : c + 1);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || !creatorId) return;
    setReviewSubmitting(true);
    setReviewMsg('');
    try {
      await reviewApi.create(creatorId, { rating: reviewRating, comment: reviewText.trim() || undefined });
      setReviewMsg('Review submitted!');
      setReviewRating(0);
      setReviewText('');
      const res = await creatorApi.getById(creatorId);
      setCreator(res.data.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string }; message?: string } } };
      setReviewMsg(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleStartEdit = (r: { id: string; rating: number; comment?: string }) => {
    setEditingReviewId(r.id);
    setEditRating(r.rating);
    setEditText(r.comment || '');
    setReviewMsg('');
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditText('');
  };

  const handleSaveEdit = async (reviewId: string) => {
    if (!editRating || !creatorId) return;
    setEditSubmitting(true);
    try {
      await reviewApi.update(creatorId, reviewId, { rating: editRating, comment: editText.trim() || undefined });
      setEditingReviewId(null);
      setEditRating(0);
      setEditText('');
      const res = await creatorApi.getById(creatorId);
      setCreator(res.data.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string }; message?: string } } };
      setReviewMsg(e?.response?.data?.error?.message || e?.response?.data?.message || 'Failed to update review');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!creatorId) return;
    setDeletingReviewId(reviewId);
    try {
      await reviewApi.delete(creatorId, reviewId);
      const res = await creatorApi.getById(creatorId);
      setCreator(res.data.data);
    } catch {
      setReviewMsg('Failed to delete review');
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleRequestBooking = async () => {
    if (!bookingSlotId || !creatorId) return;
    setBookingSubmitting(true);
    setBookingMsg('');
    try {
      await bookingApi.requestBooking({ slotId: bookingSlotId, message: bookingMessage.trim() || undefined });
      setBookingMsg('Booking requested! The creator will confirm.');
      setBookingSlotId(null);
      setBookingMessage('');
      // Refresh slots
      const res = await bookingApi.getPublicSlots(creatorId);
      setSlots(res.data.data || []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setBookingMsg(e?.response?.data?.error?.message || 'Failed to request booking');
    } finally {
      setBookingSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading profile...</div>;
  if (error || !creator) return (
    <div className={styles.error}>
      <p>{error || 'Creator not found'}</p>
      <Link to="/find-expert" style={{ color: '#ff3e48', fontSize: 13 }}>Back to experts</Link>
    </div>
  );

  const faqs = creator.faqs || [];
  const reviews = creator.reviews || {};
  const reviewList = reviews.reviews || [];
  const reviewSummary = reviews.summary || { averageRating: 0, totalReviews: 0, breakdown: {} };
  const topics = creator.topicExpertise || [];
  const perf = creator.performance || {};
  const content = creator.content || [];
  const followers = creator.followers || {};
  const coverUrl = creator.coverImage ? getImageUrl(creator.coverImage) : '';
  const avatarUrl = creator.profileImage ? getImageUrl(creator.profileImage) : '';
  const initial = (creator.displayName || '?').charAt(0).toUpperCase();
  const hasSocials = creator.youtubeUrl || creator.instagramUrl || creator.twitterUrl || creator.websiteUrl;

  return (
    <div className={styles.page}>
      {/* COVER */}
      <div className={styles.coverWrap}>
        {coverUrl && <img src={coverUrl} alt="" className={styles.coverImg} />}
      </div>

      {/* HERO */}
      <div className={styles.heroSection}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrap}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={creator.displayName} className={styles.avatarImg} />
            ) : (
              <span className={styles.avatarInitial}>{initial}</span>
            )}
            {creator.isOnline && <div className={styles.onlineDot} />}
          </div>

          <div className={styles.profileInfo}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{creator.displayName}</h1>
              {creator.isFeatured && <VerifiedIcon />}
            </div>
            {creator.tagline && <p className={styles.tagline}>{creator.tagline}</p>}
            <div>
              {creator.category && <span className={styles.category}>{creator.category}</span>}
              {creator.voiceId && (
                <span className={styles.voiceBadge}><MicIcon /> Voice AI</span>
              )}
            </div>
            {creator.bio && <p className={styles.bio}>{creator.bio}</p>}

            {/* SOCIAL LINKS */}
            {hasSocials && (
              <div className={styles.socialRow}>
                {creator.youtubeUrl && (
                  <a href={creator.youtubeUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="YouTube"><YouTubeIcon /></a>
                )}
                {creator.instagramUrl && (
                  <a href={creator.instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Instagram"><InstagramIcon /></a>
                )}
                {creator.twitterUrl && (
                  <a href={creator.twitterUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Twitter/X"><TwitterIcon /></a>
                )}
                {creator.websiteUrl && (
                  <a href={creator.websiteUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Website"><WebIcon /></a>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link to={`/website-chat/${creatorId}`} className={styles.chatBtn}>
              <MessageIcon /> Chat Now
            </Link>
            <button
              type="button"
              onClick={handleFollow}
              disabled={followLoading}
              className={`${styles.followBtn} ${isFollowing ? styles.followBtnActive : ''}`}
            >
              {followLoading ? '...' : isFollowing ? '✓ Following' : '+ Follow'}
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{reviewSummary.averageRating?.toFixed(1) || '0.0'}</span>
            <span className={styles.statLabel}>Rating</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{creator.totalAiAnswers ?? creator.performance?.totalChats ?? 0}</span>
            <span className={styles.statLabel}>Chats</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{followerCount}</span>
            <span className={styles.statLabel}>Followers</span>
          </div>
          {perf.responseRate !== undefined && (
            <div className={styles.stat}>
              <span className={styles.statValue}>{Math.round(perf.responseRate)}%</span>
              <span className={styles.statLabel}>Response Rate</span>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className={styles.tabsWrap}>
        <div className={styles.tabs}>
          {(['about', 'offerings', 'bookings', 'faqs', 'reviews'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'about' ? 'About'
                : tab === 'offerings' ? `Products & Programs (${programs.length})`
                : tab === 'bookings' ? `Book a Meeting (${slots.length})`
                : tab === 'faqs' ? `FAQs (${faqs.length})`
                : `Reviews (${reviewSummary.totalReviews || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className={styles.tabContent}>
        {/* ---- ABOUT ---- */}
        {activeTab === 'about' && (
          <>
            {/* Welcome Message */}
            {creator.welcomeMessage && (
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Welcome Message</h3>
                <div className={styles.welcomeMsg}>"{creator.welcomeMessage}"</div>
              </div>
            )}

            {/* Topic Expertise */}
            {topics.length > 0 && (
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Expertise</h3>
                <div className={styles.topicTags}>
                  {topics.map((t: { topic: string; percentage: number }, i: number) => (
                    <span key={i} className={styles.topicTag}>
                      {t.topic} <span className={styles.topicPct}>{t.percentage}%</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Performance */}
            {(perf.responseRate !== undefined || perf.avgResponseTimeSeconds) && (
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Performance</h3>
                <div className={styles.perfGrid}>
                  {perf.responseRate !== undefined && (
                    <div className={styles.perfItem}>
                      <div className={styles.perfValue}>{Math.round(perf.responseRate)}%</div>
                      <div className={styles.perfLabel}>Response Rate</div>
                    </div>
                  )}
                  {perf.avgResponseTimeSeconds && (
                    <div className={styles.perfItem}>
                      <div className={styles.perfValue}>{perf.avgResponseTimeSeconds < 60 ? `${Math.round(perf.avgResponseTimeSeconds)}s` : `${Math.round(perf.avgResponseTimeSeconds / 60)}m`}</div>
                      <div className={styles.perfLabel}>Avg Response</div>
                    </div>
                  )}
                  <div className={styles.perfItem}>
                    <div className={styles.perfValue}>{creator.totalAiAnswers ?? creator.performance?.totalChats ?? 0}</div>
                    <div className={styles.perfLabel}>Total Chats</div>
                  </div>
                  {creator.firstMessageFree && (
                    <div className={styles.perfItem}>
                      <div className={styles.perfValue} style={{ color: '#10b981' }}>Free</div>
                      <div className={styles.perfLabel}>First Message</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Knowledge Base */}
            {content.length > 0 && (
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Trained On ({content.length} sources)</h3>
                <div className={styles.contentList}>
                  {content.map((c: { id: string; type: string; title: string }) => {
                    const icon = CONTENT_ICONS[c.type] || CONTENT_ICONS.MANUAL_TEXT;
                    return (
                      <div key={c.id} className={styles.contentItem}>
                        <div className={styles.contentIcon} style={{ background: icon.bg, color: icon.color }}>
                          {icon.label.charAt(0)}
                        </div>
                        <div>
                          <div className={styles.contentTitle}>{c.title}</div>
                          <div className={styles.contentType}>{icon.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ---- PRODUCTS & PROGRAMS ---- */}
        {activeTab === 'offerings' && (
          <>
            {programs.length === 0 ? (
              <div className={styles.faqEmpty}>No products or programs listed yet.</div>
            ) : (
              <>
                {/* Products */}
                {programs.filter(p => p.category === '__product__').length > 0 && (
                  <div className={styles.sectionCard}>
                    <h3 className={styles.sectionTitle}>Products</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {programs.filter(p => p.category === '__product__').map((p: { id: string; name: string; price?: number; description?: string; category?: string }) => {
                        let d: Record<string, string> = {};
                        try { d = JSON.parse(p.description || '{}'); } catch { d = { desc: p.description || '' }; }
                        return (
                          <div key={p.id} style={{ padding: 16, background: '#fafaf8', borderRadius: 12, border: '1px solid #f3f0ec' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{p.name}</div>
                            {d.desc && <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, lineHeight: 1.5 }}>{d.desc}</div>}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>₹{Number(p.price || 0).toFixed(0)}</span>
                              {d.promoCode && (
                                <span style={{ padding: '2px 8px', borderRadius: 6, background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 600 }}>Code: {d.promoCode}</span>
                              )}
                              {d.link && (
                                <a href={d.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#3b82f6', fontWeight: 500 }}>Buy Now →</a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Programs */}
                {programs.filter(p => p.category !== '__product__').length > 0 && (
                  <div className={styles.sectionCard}>
                    <h3 className={styles.sectionTitle}>Fitness Programs</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {programs.filter(p => p.category !== '__product__').map((p: { id: string; name: string; price?: number; description?: string; category?: string }) => {
                        let d: Record<string, string> = {};
                        try { d = JSON.parse(p.description || '{}'); } catch { d = { desc: p.description || '' }; }
                        return (
                          <div key={p.id} style={{ padding: 16, background: '#fafaf8', borderRadius: 12, border: '1px solid #f3f0ec' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{p.name}</div>
                            {d.desc && <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, lineHeight: 1.5 }}>{d.desc}</div>}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>₹{Number(p.price || 0).toFixed(0)}</span>
                              {d.duration && (
                                <span style={{ padding: '2px 8px', borderRadius: 6, background: '#eff6ff', color: '#3b82f6', fontSize: 11, fontWeight: 600 }}>{d.duration}</span>
                              )}
                              {d.level && (
                                <span style={{ padding: '2px 8px', borderRadius: 6, background: '#f0fdf4', color: '#10b981', fontSize: 11, fontWeight: 600 }}>{d.level}</span>
                              )}
                              {p.category && (
                                <span style={{ padding: '2px 8px', borderRadius: 6, background: '#f5f3ff', color: '#8b5cf6', fontSize: 11, fontWeight: 600 }}>{p.category}</span>
                              )}
                              {d.promoCode && (
                                <span style={{ padding: '2px 8px', borderRadius: 6, background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 600 }}>Code: {d.promoCode}</span>
                              )}
                              {d.link && (
                                <a href={d.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#3b82f6', fontWeight: 500 }}>View Program →</a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ---- BOOK A MEETING ---- */}
        {activeTab === 'bookings' && (
          <>
            {slots.length === 0 ? (
              <div className={styles.faqEmpty}>No available time slots right now. Check back later!</div>
            ) : (
              <>
                {/* Group slots by date */}
                {(() => {
                  const grouped: Record<string, typeof slots> = {};
                  slots.forEach((s) => {
                    const dateKey = new Date(s.startTime).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                    if (!grouped[dateKey]) grouped[dateKey] = [];
                    grouped[dateKey].push(s);
                  });

                  return Object.entries(grouped).map(([date, dateSlots]) => (
                    <div key={date} className={styles.sectionCard} style={{ marginBottom: 12 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>{date}</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                        {dateSlots.map((slot) => {
                          const start = new Date(slot.startTime);
                          const end = new Date(slot.endTime);
                          const timeStr = `${start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
                          const isSelected = bookingSlotId === slot.id;
                          const isBooked = slot.isAvailable === false;
                          const isBookedByMe = slot.bookedByMe === true;
                          const isRequestedByMe = slot.requestedByMe === true;
                          const meetingLink = slot.meetingLink || null;
                          const isDisabled = isBooked || isRequestedByMe;

                          return (
                            <div
                              key={slot.id}
                              onClick={() => { if (!isDisabled) { setBookingSlotId(isSelected ? null : slot.id); setBookingMsg(''); } }}
                              style={{
                                padding: '14px 16px', borderRadius: 12,
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                border: isSelected ? '2px solid #ff3e48'
                                  : isBookedByMe ? '1px solid #10b981'
                                  : isRequestedByMe ? '1px solid #f59e0b'
                                  : isBooked ? '1px solid #e5e7eb'
                                  : '1px solid #ede8e3',
                                background: isSelected ? '#fff5f5'
                                  : isBookedByMe ? '#ecfdf5'
                                  : isRequestedByMe ? '#fffbeb'
                                  : isBooked ? '#f3f4f6'
                                  : '#fafaf8',
                                opacity: isBooked && !isBookedByMe && !isRequestedByMe ? 0.5 : 1,
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: isBooked && !isBookedByMe && !isRequestedByMe ? '#9ca3af' : '#111827' }}>{timeStr}</span>
                                {isBookedByMe && <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', background: '#fff', padding: '2px 8px', borderRadius: 4, border: '1px solid #bbf7d0' }}>Your Booking</span>}
                                {isRequestedByMe && <span style={{ fontSize: 10, fontWeight: 700, color: '#d97706', background: '#fff', padding: '2px 8px', borderRadius: 4, border: '1px solid #fcd34d' }}>Requested</span>}
                                {isBooked && !isBookedByMe && !isRequestedByMe && <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '2px 8px', borderRadius: 4 }}>Booked</span>}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: isDisabled && !isBookedByMe && !isRequestedByMe ? '#9ca3af' : '#ff3e48', background: isDisabled && !isBookedByMe && !isRequestedByMe ? '#f3f4f6' : '#fff5f5', padding: '2px 8px', borderRadius: 6 }}>
                                  {slot.type || 'Consultation'}
                                </span>
                                {Number(slot.price) > 0 && (
                                  <span style={{ fontSize: 12, fontWeight: 700, color: isDisabled && !isBookedByMe && !isRequestedByMe ? '#9ca3af' : '#111827' }}>₹{Number(slot.price).toFixed(0)}</span>
                                )}
                                {Number(slot.price) === 0 && (
                                  <span style={{ fontSize: 12, fontWeight: 600, color: isDisabled && !isBookedByMe && !isRequestedByMe ? '#9ca3af' : '#10b981' }}>Free</span>
                                )}
                              </div>
                              {slot.title && slot.title !== 'Available' && (
                                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{slot.title}</div>
                              )}
                              {isBookedByMe && meetingLink && (
                                <a
                                  href={meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, fontWeight: 600, color: '#10b981', textDecoration: 'none' }}
                                >
                                  Join Meeting →
                                </a>
                              )}
                              {isBookedByMe && !meetingLink && (
                                <div style={{ marginTop: 8, fontSize: 11, color: '#6b7280', fontStyle: 'italic' }}>Meeting link coming soon</div>
                              )}
                              {isRequestedByMe && (
                                <div style={{ marginTop: 8, fontSize: 11, color: '#d97706', fontStyle: 'italic' }}>Awaiting creator confirmation</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}

                {/* Booking request form */}
                {bookingSlotId && isAuthenticated && (
                  <div className={styles.sectionCard} style={{ borderColor: '#ff3e48', borderWidth: 2 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Request This Slot</h3>
                    <textarea
                      value={bookingMessage}
                      onChange={(e) => setBookingMessage(e.target.value)}
                      placeholder="Add a message for the creator (optional) — e.g. what you'd like to discuss"
                      rows={3}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 10,
                        border: '1px solid #ede8e3', fontSize: 14, resize: 'vertical',
                        fontFamily: 'inherit', outline: 'none', background: '#fafaf8',
                        marginBottom: 12,
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button
                        type="button"
                        onClick={handleRequestBooking}
                        disabled={bookingSubmitting}
                        style={{
                          padding: '10px 24px', borderRadius: 10,
                          background: 'linear-gradient(135deg, #ff5b1f, #ff3e48)',
                          color: '#fff', fontSize: 14, fontWeight: 600, border: 'none',
                          cursor: bookingSubmitting ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {bookingSubmitting ? 'Requesting...' : 'Request Booking'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBookingSlotId(null); setBookingMsg(''); }}
                        style={{ padding: '10px 20px', borderRadius: 10, background: '#fff', color: '#6b7280', fontSize: 14, fontWeight: 600, border: '1px solid #ede8e3', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      {bookingMsg && (
                        <span style={{ fontSize: 13, color: bookingMsg.includes('requested') ? '#10b981' : '#ef4444' }}>
                          {bookingMsg}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {bookingSlotId && !isAuthenticated && (
                  <div className={styles.sectionCard}>
                    <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>
                      <Link to="/login" style={{ color: '#ff3e48', fontWeight: 600 }}>Sign in</Link> to request a booking
                    </p>
                  </div>
                )}

                {!bookingSlotId && (
                  <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 12 }}>
                    Select a time slot above to request a booking
                  </p>
                )}
              </>
            )}
          </>
        )}

        {/* ---- FAQS ---- */}
        {activeTab === 'faqs' && (
          <>
            {faqs.length === 0 ? (
              <div className={styles.faqEmpty}>No FAQs yet. Start a chat to ask your question!</div>
            ) : (
              faqs.map((faq: { id: string; question: string; answer: string }) => (
                <div key={faq.id} className={styles.faqItem}>
                  <button
                    type="button"
                    className={styles.faqQuestion}
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  >
                    {faq.question}
                    <ChevronDown open={openFaq === faq.id} />
                  </button>
                  {openFaq === faq.id && (
                    <div className={styles.faqAnswer}>{faq.answer}</div>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* ---- REVIEWS ---- */}
        {activeTab === 'reviews' && (
          <>
            {/* Summary */}
            <div className={styles.reviewSummary}>
              <div className={styles.reviewBigRating}>
                <div className={styles.reviewBigNum}>{reviewSummary.averageRating?.toFixed(1) || '0.0'}</div>
                <Stars rating={reviewSummary.averageRating || 0} />
                <div className={styles.reviewCount}>{reviewSummary.totalReviews || 0} reviews</div>
              </div>
              <div className={styles.reviewBreakdown}>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviewSummary.breakdown?.[star] || 0;
                  const pct = reviewSummary.totalReviews > 0 ? (count / reviewSummary.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className={styles.reviewBar}>
                      <span className={styles.reviewBarLabel}>{star}</span>
                      <StarIcon filled />
                      <div className={styles.reviewBarTrack}>
                        <div className={styles.reviewBarFill} style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ width: 24, textAlign: 'right' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review Cards */}
            {reviewList.length === 0 ? (
              <div className={styles.reviewEmpty}>No reviews yet. Be the first!</div>
            ) : (
              reviewList.map((r: { id: string; rating: number; comment?: string; createdAt: string; user?: { id?: string; name?: string } }) => {
                const isOwn = !!(user?.id && r.user?.id === user.id);
                const isEditing = editingReviewId === r.id;
                const isDeleting = deletingReviewId === r.id;
                return (
                  <div key={r.id} className={styles.reviewCard} style={isOwn ? { border: '1px solid #fecaca', background: '#fff5f5' } : {}}>
                    <div className={styles.reviewUser}>
                      <div className={styles.reviewAvatar}>{r.user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
                      <div style={{ flex: 1 }}>
                        <div className={styles.reviewName}>{r.user?.name || 'Anonymous'}{isOwn && <span style={{ fontSize: 10, fontWeight: 700, color: '#ff3e48', background: '#fff', border: '1px solid #fecaca', borderRadius: 4, padding: '1px 6px', marginLeft: 6 }}>You</span>}</div>
                        <div className={styles.reviewDate}>
                          <Stars rating={r.rating} size={12} />
                          {' '}{new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      {isOwn && !isEditing && (
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <button type="button" onClick={() => handleStartEdit(r)}
                            style={{ fontSize: 12, fontWeight: 600, color: '#ff3e48', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDeleteReview(r.id)} disabled={isDeleting}
                            style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', cursor: isDeleting ? 'not-allowed' : 'pointer', padding: 0, opacity: isDeleting ? 0.5 : 1 }}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} type="button"
                              onClick={() => setEditRating(star)}
                              onMouseEnter={() => setEditHover(star)}
                              onMouseLeave={() => setEditHover(0)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                              <svg viewBox="0 0 20 20" width="24" height="24">
                                <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27 5.23 15.71l.91-5.32L2.27 6.62l5.34-.78z"
                                  fill={star <= (editHover || editRating) ? '#fbbf24' : '#e5e7eb'} />
                              </svg>
                            </button>
                          ))}
                        </div>
                        <textarea value={editText} onChange={(e) => setEditText(e.target.value)}
                          placeholder="Share your experience (optional)" rows={3}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ede8e3', fontSize: 13, resize: 'vertical', fontFamily: 'inherit', outline: 'none', background: '#fff', marginBottom: 10 }} />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="button" onClick={() => handleSaveEdit(r.id)} disabled={!editRating || editSubmitting}
                            style={{ padding: '6px 16px', borderRadius: 8, background: !editRating ? '#d1d5db' : 'linear-gradient(135deg, #ff5b1f, #ff3e48)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: !editRating ? 'not-allowed' : 'pointer' }}>
                            {editSubmitting ? 'Saving...' : 'Save'}
                          </button>
                          <button type="button" onClick={handleCancelEdit}
                            style={{ padding: '6px 16px', borderRadius: 8, background: '#fff', border: '1px solid #ede8e3', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : r.comment ? (
                      <p className={styles.reviewComment}>{r.comment}</p>
                    ) : isOwn ? (
                      <p className={styles.reviewComment} style={{ color: '#9ca3af', fontStyle: 'italic' }}>No comment left</p>
                    ) : null}
                  </div>
                );
              })
            )}

            {/* Write a new Review */}
            <div className={styles.sectionCard} style={{ marginTop: 20 }}>
              {!isAuthenticated ? (
                <p style={{ fontSize: 14, color: '#9ca3af' }}>
                  <Link to="/login" style={{ color: '#ff3e48', fontWeight: 600 }}>Sign in</Link> to leave a review
                </p>
              ) : (
                <div>
                  <h3 className={styles.sectionTitle}>Write a Review</h3>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHover(star)}
                        onMouseLeave={() => setReviewHover(0)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                        <svg viewBox="0 0 20 20" width="28" height="28">
                          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27 5.23 15.71l.91-5.32L2.27 6.62l5.34-.78z"
                            fill={star <= (reviewHover || reviewRating) ? '#fbbf24' : '#e5e7eb'}
                            style={{ transition: 'fill 0.1s' }} />
                        </svg>
                      </button>
                    ))}
                    {reviewRating > 0 && (
                      <span style={{ fontSize: 13, color: '#6b7280', alignSelf: 'center', marginLeft: 8 }}>
                        {reviewRating === 5 ? 'Excellent' : reviewRating === 4 ? 'Great' : reviewRating === 3 ? 'Good' : reviewRating === 2 ? 'Fair' : 'Poor'}
                      </span>
                    )}
                  </div>
                  <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience (optional)" rows={3}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #ede8e3', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', outline: 'none', background: '#fafaf8', marginBottom: 12 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button type="button" onClick={handleSubmitReview} disabled={!reviewRating || reviewSubmitting}
                      style={{ padding: '10px 24px', borderRadius: 10, background: !reviewRating ? '#d1d5db' : 'linear-gradient(135deg, #ff5b1f, #ff3e48)', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: !reviewRating ? 'not-allowed' : 'pointer' }}>
                      {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                    {reviewMsg && (
                      <span style={{ fontSize: 13, color: reviewMsg.includes('Failed') ? '#ef4444' : '#10b981' }}>{reviewMsg}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
