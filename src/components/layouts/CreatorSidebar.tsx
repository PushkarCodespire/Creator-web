import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { getImageUrl } from '../../services/api';

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', path: '/creator-dashboard' },
  { icon: 'yourai', label: 'Your AI', path: '/creator-dashboard/your-ai' },
  { icon: 'content', label: 'Bookings', path: '/creator-dashboard/content' },
  { icon: 'messages', label: 'Revenue', path: '/creator-dashboard/revenue' },
  { icon: 'deals', label: 'Products', path: '/creator-dashboard/products' },
  { icon: 'payouts', label: 'Payouts', path: '/creator-dashboard/payouts' },
];

function NavIcon({ type, size = 20 }: { type: string; size?: number }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (type) {
    case 'dashboard': return (<svg viewBox="0 0 20 20" width={size} height={size}><rect x="2" y="2" width="7" height="7" rx="1.5" {...s} /><rect x="11" y="2" width="7" height="7" rx="1.5" {...s} /><rect x="2" y="11" width="7" height="7" rx="1.5" {...s} /><rect x="11" y="11" width="7" height="7" rx="1.5" {...s} /></svg>);
    case 'yourai': return (<svg viewBox="0 0 20 20" width={size} height={size}><circle cx="10" cy="7" r="4" {...s} /><path d="M3 18c0-3.3 3.1-6 7-6s7 2.7 7 6" {...s} /><path d="M14 3l2 2-2 2" {...s} /></svg>);
    case 'analytics': return (<svg viewBox="0 0 20 20" width={size} height={size}><path d="M2 16L7 9L11 13L18 4" {...s} /><path d="M14 4H18V8" {...s} /></svg>);
    case 'content': return (<svg viewBox="0 0 20 20" width={size} height={size}><rect x="3" y="2" width="14" height="16" rx="2" {...s} /><path d="M7 6H13M7 10H13M7 14H10" {...s} /></svg>);
    case 'messages': return (<svg viewBox="0 0 20 20" width={size} height={size}><rect x="2" y="3" width="16" height="12" rx="2" {...s} /><path d="M6 9H14M6 12H10" {...s} /></svg>);
    case 'deals': return (<svg viewBox="0 0 20 20" width={size} height={size}><path d="M16 11L10 17L4 11V5C4 3.9 4.9 3 6 3H14C15.1 3 16 3.9 16 5V11Z" {...s} /><circle cx="10" cy="7.5" r="1.5" {...s} /></svg>);
    case 'payouts': return (<svg viewBox="0 0 20 20" width={size} height={size}><path d="M10 2V18" {...s} /><path d="M14 5H8C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11H12C13.66 11 15 12.34 15 14C15 15.66 13.66 17 12 17H6" {...s} /></svg>);
    case 'posts': return (<svg viewBox="0 0 20 20" width={size} height={size}><line x1="15" y1="18" x2="15" y2="8" {...s} /><line x1="10" y1="18" x2="10" y2="2" {...s} /><line x1="5" y1="18" x2="5" y2="12" {...s} /></svg>);
    case 'settings': return (<svg viewBox="0 0 20 20" width={size} height={size}><circle cx="10" cy="10" r="2.5" {...s} /><path d="M16.2 12.8a1.2 1.2 0 00.24 1.32l.04.04a1.44 1.44 0 11-2.04 2.04l-.04-.04a1.2 1.2 0 00-1.32-.24 1.2 1.2 0 00-.72 1.08v.12a1.44 1.44 0 11-2.88 0v-.06a1.2 1.2 0 00-.78-1.08 1.2 1.2 0 00-1.32.24l-.04.04a1.44 1.44 0 11-2.04-2.04l.04-.04a1.2 1.2 0 00.24-1.32 1.2 1.2 0 00-1.08-.72H4.2a1.44 1.44 0 010-2.88h.06a1.2 1.2 0 001.08-.78 1.2 1.2 0 00-.24-1.32l-.04-.04a1.44 1.44 0 112.04-2.04l.04.04a1.2 1.2 0 001.32.24h.06a1.2 1.2 0 00.72-1.08V4.2a1.44 1.44 0 012.88 0v.06a1.2 1.2 0 00.72 1.08 1.2 1.2 0 001.32-.24l.04-.04a1.44 1.44 0 112.04 2.04l-.04.04a1.2 1.2 0 00-.24 1.32v.06a1.2 1.2 0 001.08.72h.12a1.44 1.44 0 010 2.88h-.06a1.2 1.2 0 00-1.08.72z" {...s} /></svg>);
    default: return null;
  }
}

export default function CreatorSidebar({ expanded, onToggle }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const profileImg = user?.creator?.profileImage || user?.avatar;
  const width = expanded ? 200 : 70;

  const isActive = (path: string) => {
    if (path === '/creator-dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <aside style={{
      width,
      height: 'calc(100vh - 24px)',
      position: 'fixed',
      top: 12,
      left: 12,
      background: '#111111',
      borderRadius: 20,
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 0 16px',
      zIndex: 40,
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    }}>
      {/* Logo + Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: expanded ? '4px 14px 4px 16px' : '4px 14px',
        marginBottom: 16,
        minHeight: 44,
      }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', minWidth: 0 }}
          onClick={() => navigate('/creator-dashboard')}
        >
          <img src="/website/figma/cplogo.png" alt="CP" style={{ height: 20, width: 'auto', flexShrink: 0 }} />
          {expanded && <span style={{ color: '#fff', fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap' }}>CreatorPal</span>}
        </div>
        <button
          type="button"
          onClick={onToggle}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          <img
            src="/website/figma/arrows.png"
            alt=""
            style={{
              height: 12, width: 'auto', opacity: 0.5,
              transition: 'transform 0.25s ease',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, width: '100%', padding: expanded ? '0 10px' : '0 14px' }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              title={!expanded ? item.label : undefined}
              style={{
                width: '100%',
                height: 44,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: expanded ? 'flex-start' : 'center',
                gap: 12,
                padding: expanded ? '0 14px' : 0,
                background: active ? '#ff3e48' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}><NavIcon type={item.icon} size={20} /></span>
              {expanded && <span style={{ fontSize: 14, fontWeight: active ? 600 : 500 }}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom: Settings + Avatar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: expanded ? '0 10px' : '0 14px' }}>
        <button
          type="button"
          onClick={() => navigate('/creator-dashboard/settings')}
          title={!expanded ? 'Settings' : undefined}
          style={{
            width: '100%', height: 44, borderRadius: 10,
            display: 'flex', alignItems: 'center',
            justifyContent: expanded ? 'flex-start' : 'center',
            gap: 12, padding: expanded ? '0 14px' : 0,
            background: location.pathname.includes('/settings') ? '#ff3e48' : 'transparent',
            color: location.pathname.includes('/settings') ? '#fff' : 'rgba(255,255,255,0.45)',
            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden',
          }}
        >
          <span style={{ flexShrink: 0, display: 'flex' }}><NavIcon type="settings" size={20} /></span>
          {expanded && <span style={{ fontSize: 14, fontWeight: 500 }}>Settings</span>}
        </button>

        <button
          type="button"
          onClick={() => { dispatch(logout()); navigate('/'); }}
          title={!expanded ? 'Log out' : undefined}
          style={{
            width: '100%', height: 44, borderRadius: 10,
            display: 'flex', alignItems: 'center',
            justifyContent: expanded ? 'flex-start' : 'center',
            gap: 12, padding: expanded ? '0 14px' : 0,
            background: 'transparent',
            color: 'rgba(255,100,100,0.6)',
            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden',
            transition: 'color 0.15s ease',
          }}
        >
          <span style={{ flexShrink: 0, display: 'flex' }}>
            <svg viewBox="0 0 20 20" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3M13 14l4-4-4-4M17 10H7" />
            </svg>
          </span>
          {expanded && <span style={{ fontSize: 14, fontWeight: 500 }}>Log out</span>}
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: expanded ? '8px 10px' : '8px 0',
          justifyContent: expanded ? 'flex-start' : 'center',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, overflow: 'hidden',
            background: '#333', border: '2px solid rgba(255,255,255,0.15)', flexShrink: 0,
          }}>
            {profileImg ? (
              <img src={getImageUrl(profileImg)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 700 }}>
                {user?.name?.[0] || 'C'}
              </div>
            )}
          </div>
          {expanded && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Creator'}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#ff3e48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PRO CREATOR</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
