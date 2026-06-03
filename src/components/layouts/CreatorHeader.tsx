import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Home } from 'lucide-react';
import { searchApi, notificationApi } from '../../services/api';
import { useDashboardFilter } from './DashboardFilterContext';

interface CreatorHeaderProps {
  isMobile?: boolean;
  onMenuOpen?: () => void;
}

export default function CreatorHeader({ isMobile, onMenuOpen }: CreatorHeaderProps) {
  const navigate = useNavigate();
  const { period: activeFilter, setPeriod: setActiveFilter } = useDashboardFilter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ type: string; name: string; id: string; path: string }[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch unread count on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await notificationApi.getUnreadCount();
        setUnreadCount(res.data.data?.count || 0);
      } catch {}
    })();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await searchApi.globalSearch({ q: searchQuery, limit: 5 });
        const data = res.data.data;
        const results = [
          ...(data?.creators || []).map((c: { displayName: string; id: string }) => ({ type: 'Creator', name: c.displayName, id: c.id, path: `/website-chat/${c.id}` })),
          ...(data?.posts || []).map((p: { content?: string; id: string }) => ({ type: 'Post', name: p.content?.substring(0, 50), id: p.id, path: '/creator-dashboard' })),
        ];
        setSearchResults(results);
        setShowSearch(true);
      } catch {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenNotifications = async () => {
    if (showNotif) { setShowNotif(false); return; }
    try {
      const res = await notificationApi.getNotifications({ limit: 10 });
      const items = res.data.data?.notifications || res.data.data || [];
      setNotifications(Array.isArray(items) ? items : []);
      // Only show dropdown if there are notifications
      if (items.length > 0) {
        setShowNotif(true);
        setUnreadCount(0);
      }
    } catch {}
  };

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 0' }}>
      {/* Hamburger (mobile only) */}
      {isMobile && (
        <button
          type="button"
          onClick={onMenuOpen}
          style={{
            width: 40, height: 40, borderRadius: 10, background: '#111',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, color: '#fff',
          }}
          aria-label="Open menu"
        >
          <svg viewBox="0 0 20 20" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
      )}

      {/* Search — hidden on mobile, visible on desktop */}
      {!isMobile && (
      <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
          background: '#fff', border: '1px solid #ede8e3', borderRadius: 10,
        }}>
          <svg viewBox="0 0 20 20" width={16} height={16} style={{ color: '#9ca3af', flexShrink: 0 }}>
            <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M14 14l4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search creators, content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowSearch(true)}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#111827', fontFamily: 'inherit' }}
          />
          {searchQuery && (
            <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearch(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </div>
        {showSearch && searchResults.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff',
            border: '1px solid #ede8e3', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            padding: '6px 0', zIndex: 50, maxHeight: 300, overflowY: 'auto',
          }}>
            {searchResults.map((r, i) => (
              <button key={i} type="button" onClick={() => { navigate(r.path); setShowSearch(false); setSearchQuery(''); }}
                style={{ width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#111827' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fafaf8')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', width: 50 }}>{r.type}</span>
                <span style={{ flex: 1 }}>{r.name}</span>
              </button>
            ))}
          </div>
        )}
        {showSearch && searchResults.length === 0 && searchQuery.trim() && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff',
            border: '1px solid #ede8e3', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            padding: '20px 16px', zIndex: 50, textAlign: 'center', color: '#9ca3af', fontSize: 13,
          }}>
            No results found
          </div>
        )}
      </div>
      )} {/* end !isMobile search */}

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
        {/* Home button — hidden on mobile (accessible via sidebar) */}
        {!isMobile && (
        <button type="button" onClick={() => navigate('/')} title="Go to Home" style={{
          width: 40, height: 40, borderRadius: 10, background: '#fff', border: '1px solid #ede8e3',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', cursor: 'pointer', transition: 'all 0.15s ease',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#ff3e48'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6b7280'; }}
        >
          <Home size={18} />
        </button>
        )} {/* end !isMobile home button */}

        {/* Time filters */}
        <div style={{ display: 'flex', background: '#fff', border: '1px solid #ede8e3', borderRadius: 10, padding: 3, gap: 2 }}>
          {(isMobile ? ['7D', '30D'] : ['7D', '30D', '90D']).map((f) => (
            <button key={f} type="button" onClick={() => setActiveFilter(f)}
              style={{ padding: isMobile ? '6px 10px' : '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: activeFilter === f ? '#ff3e48' : 'transparent', color: activeFilter === f ? '#fff' : '#6b7280', transition: 'all 0.15s ease' }}
            >{f}</button>
          ))}
        </div>

        {/* Notification */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button type="button" onClick={handleOpenNotifications} style={{
            width: 40, height: 40, borderRadius: 10, background: '#fff', border: '1px solid #ede8e3',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', cursor: 'pointer', position: 'relative',
          }}>
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#ff3e48', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotif && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 320, background: '#fff',
              border: '1px solid #ede8e3', borderRadius: 14, boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
              padding: '12px 0', zIndex: 50, maxHeight: 400, overflowY: 'auto',
            }}>
              <div style={{ padding: '8px 16px 12px', fontWeight: 700, fontSize: 15, color: '#111827', borderBottom: '1px solid #f0ebe6' }}>Notifications</div>
              {notifications.map((n, i: number) => {
                const getNotifRoute = (notif: { type?: string; actionUrl?: string }) => {
                  if (notif.actionUrl) return notif.actionUrl;
                  switch (notif.type) {
                    case 'CHAT_MESSAGE': return '/creator-dashboard';
                    case 'DEAL_APPLICATION': case 'DEAL_ACCEPTED': case 'DEAL_COMPLETED': return '/creator-dashboard/products';
                    case 'PAYMENT_SUCCESS': case 'PAYMENT_FAILED': return '/creator-dashboard/payouts';
                    case 'SUBSCRIPTION_UPGRADED': return '/creator-dashboard/revenue';
                    case 'CONTENT_PROCESSED': return '/creator-dashboard/your-ai';
                    case 'CREATOR_VERIFIED': return '/creator-dashboard';
                    case 'PAYOUT_COMPLETED': case 'PAYOUT_FAILED': return '/creator-dashboard/payouts';
                    default: return '/creator-dashboard';
                  }
                };
                return (
                  <button
                    key={n.id || i}
                    type="button"
                    onClick={() => { navigate(getNotifRoute(n)); setShowNotif(false); }}
                    style={{
                      width: '100%', padding: '12px 16px', textAlign: 'left', background: n.isRead ? 'none' : '#fef8f5',
                      border: 'none', borderBottom: i < notifications.length - 1 ? '1px solid #f5f0eb' : 'none',
                      cursor: 'pointer', display: 'block', transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fafaf8')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = n.isRead ? 'none' : '#fef8f5')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      {!n.isRead && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3e48', flexShrink: 0 }} />}
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{n.title || n.type?.replace(/_/g, ' ')}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
