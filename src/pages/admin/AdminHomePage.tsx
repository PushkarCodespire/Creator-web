// ===========================================
// ADMIN — HOME PAGE MANAGEMENT
// Configure the 3 featured creators + 1 main highlight shown on the public home page
// ===========================================

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Home, Star, Save, Check, LogOut, Search, Eye, Users, Layers } from 'lucide-react';
import { adminApi, getImageUrl } from '../../services/api';
import { logout as logoutAction } from '../../store/slices/authSlice';
import UserDetailModal from '../../components/admin/UserDetailModal';
import CreatorDetailModal from '../../components/admin/CreatorDetailModal';

interface Creator {
  id: string;
  displayName: string;
  category?: string | null;
  tagline?: string | null;
  profileImage?: string | null;
  tags?: string[];
  isFeatured: boolean;
  featuredOrder: number | null;
  isMainHighlight: boolean;
}

const card: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #ede8e3',
  borderRadius: 16,
  padding: 24,
};

const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: '#9ca3af',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 10,
  display: 'block',
};

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #ede8e3',
  fontSize: 14,
  outline: 'none',
  background: '#fff',
  fontFamily: 'inherit',
};

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 22px',
  background: '#ff3e48',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const AdminHomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creators, setCreators] = useState<Creator[]>([]);

  // View mode toggle: curate (home page) | users | allcreators
  const [viewMode, setViewMode] = useState<'curate' | 'users' | 'allcreators'>('curate');

  // Users panel state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userList, setUserList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [debouncedUsersSearch, setDebouncedUsersSearch] = useState('');
  const [usersPagination, setUsersPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);

  // Creators panel state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [creatorList, setCreatorList] = useState<any[]>([]);
  const [creatorsLoading, setCreatorsLoading] = useState(false);
  const [creatorsSearch, setCreatorsSearch] = useState('');
  const [debouncedCreatorsSearch, setDebouncedCreatorsSearch] = useState('');
  const [creatorsPagination, setCreatorsPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [isCreatorModalVisible, setIsCreatorModalVisible] = useState(false);

  const handleLogout = () => {
    dispatch(logoutAction());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  // Local edit state for curate mode
  const [featured, setFeatured] = useState<Record<string, number>>({}); // creatorId -> order (1..3)
  const [mainHighlightId, setMainHighlightId] = useState<string | null>(null);

  const [msg, setMsg] = useState<{ text: string; kind: 'success' | 'error' } | null>(null);
  const showMsg = (text: string, kind: 'success' | 'error' = 'success') => {
    setMsg({ text, kind });
    setTimeout(() => setMsg(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getHomeCreators();
      const list: Creator[] = res.data?.data || [];
      setCreators(list);

      const initialFeatured: Record<string, number> = {};
      list.forEach(c => {
        if (c.isFeatured && c.featuredOrder) initialFeatured[c.id] = c.featuredOrder;
      });
      setFeatured(initialFeatured);

      const currentHighlight = list.find(c => c.isMainHighlight);
      setMainHighlightId(currentHighlight?.id || null);
    } catch {
      showMsg('Failed to load creators', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Debounce users search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedUsersSearch(usersSearch);
      setUsersPagination(p => ({ ...p, current: 1 }));
    }, 500);
    return () => clearTimeout(t);
  }, [usersSearch]);

  // Debounce creators search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedCreatorsSearch(creatorsSearch);
      setCreatorsPagination(p => ({ ...p, current: 1 }));
    }, 500);
    return () => clearTimeout(t);
  }, [creatorsSearch]);

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const res = await adminApi.getUsers({
        page: usersPagination.current,
        limit: usersPagination.pageSize,
        search: debouncedUsersSearch || undefined,
      });
      setUserList(res.data.data.users || []);
      setUsersPagination(p => ({ ...p, total: res.data.data.pagination.total }));
    } catch {
      showMsg('Failed to load users', 'error');
    } finally {
      setUsersLoading(false);
    }
  }, [usersPagination.current, usersPagination.pageSize, debouncedUsersSearch]);

  const fetchAllCreators = useCallback(async () => {
    try {
      setCreatorsLoading(true);
      const res = await adminApi.getCreators({
        page: creatorsPagination.current,
        limit: creatorsPagination.pageSize,
        search: debouncedCreatorsSearch || undefined,
      });
      setCreatorList(res.data.data.creators || []);
      setCreatorsPagination(p => ({ ...p, total: res.data.data.pagination?.total || 0 }));
    } catch {
      showMsg('Failed to load creators', 'error');
    } finally {
      setCreatorsLoading(false);
    }
  }, [creatorsPagination.current, creatorsPagination.pageSize, debouncedCreatorsSearch]);

  useEffect(() => {
    if (viewMode === 'users') fetchUsers();
  }, [viewMode, fetchUsers]);

  useEffect(() => {
    if (viewMode === 'allcreators') fetchAllCreators();
  }, [viewMode, fetchAllCreators]);

  const toggleFeatured = (creatorId: string, checked: boolean) => {
    setFeatured(prev => {
      const next = { ...prev };
      if (checked) {
        const used = new Set(Object.values(next));
        let nextOrder = 1;
        while (used.has(nextOrder)) nextOrder++;
        next[creatorId] = nextOrder;
      } else {
        delete next[creatorId];
        if (mainHighlightId === creatorId) setMainHighlightId(null);
      }
      return next;
    });
  };

  const changeOrder = (creatorId: string, order: number) => {
    if (!Number.isInteger(order) || order < 1) return;
    setFeatured(prev => {
      const next = { ...prev };
      const conflict = Object.entries(next).find(([id, o]) => id !== creatorId && o === order);
      if (conflict) next[conflict[0]] = next[creatorId];
      next[creatorId] = order;
      return next;
    });
  };

  const handleSave = async () => {
    const entries = Object.entries(featured).map(([creatorId, order]) => ({ creatorId, order }));

    if (entries.length === 0) return showMsg('Select at least one creator to feature', 'error');
    if (mainHighlightId && !entries.some(e => e.creatorId === mainHighlightId)) {
      return showMsg('Main highlight must also be one of the featured creators', 'error');
    }

    try {
      setSaving(true);
      await adminApi.updateHomeFeatured({ featured: entries, mainHighlightId });
      showMsg('Home page updated', 'success');
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string | { message?: string } } } };
      const raw = e?.response?.data?.error;
      const text = typeof raw === 'string' ? raw : raw?.message || 'Failed to save';
      showMsg(text, 'error');
    } finally {
      setSaving(false);
    }
  };

  const featuredIds = new Set(Object.keys(featured));
  const highlightOptions = creators.filter(c => featuredIds.has(c.id));

  // Sort: featured first (by order), then rest alphabetically
  const sorted = [...creators].sort((a, b) => {
    const aOrder = featured[a.id];
    const bOrder = featured[b.id];
    if (aOrder && bOrder) return aOrder - bOrder;
    if (aOrder) return -1;
    if (bOrder) return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  // Segmented-style toggle
  const toggleBtn = (mode: 'curate' | 'users' | 'allcreators', label: string, icon: React.ReactNode) => {
    const active = viewMode === mode;
    return (
      <button
        type="button"
        onClick={() => setViewMode(mode)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 16px',
          fontSize: 13, fontWeight: 600,
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontFamily: 'inherit',
          background: active ? '#ff3e48' : 'transparent',
          color: active ? '#fff' : '#6b7280',
          transition: 'all 0.15s',
        }}
      >
        {icon}
        {label}
      </button>
    );
  };

  const pageShell = (children: React.ReactNode) => (
    <div style={{ minHeight: '100vh', background: '#faf6f1' }}>
      {/* TOP BAR */}
      <header style={{
        height: 60,
        background: '#fff',
        borderBottom: '1px solid #ede8e3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #ff3e48 0%, #ff6b48 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Home size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Admin Page</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            to="/"
            aria-label="Back to Home"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8,
              background: '#fff', border: '1px solid #ede8e3',
              color: '#374151', fontSize: 13, fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <Home size={14} /> Back to Home
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8,
              background: '#fff', border: '1px solid #ede8e3',
              color: '#b91c1c', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </header>
      {children}
    </div>
  );

  if (loading) {
    return pageShell(
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)', color: '#9ca3af', fontSize: 15 }}>
        Loading creators…
      </div>
    );
  }

  // ── Users panel ──────────────────────────────────────────────────────────
  const renderUsersPanel = () => (
    <div>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={usersSearch}
            onChange={e => setUsersSearch(e.target.value)}
            placeholder="Search name or email…"
            style={{ ...inputStyle, width: '100%', paddingLeft: 38, boxSizing: 'border-box' }}
          />
        </div>
        <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>{usersPagination.total} users</span>
      </div>

      {/* Table */}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {usersLoading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading…</div>
        ) : userList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>No users found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#faf6f1' }}>
                {['Name', 'Email', 'Role', 'Status', 'Joined', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #ede8e3' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {userList.map((u, idx) => (
                <tr key={u.id} style={{ borderTop: idx === 0 ? 'none' : '1px solid #f3f0ec', background: '#fff' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#111827' }}>{u.name}</td>
                  <td style={{ padding: '14px 16px', color: '#6b7280' }}>{u.email}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                      background: u.role === 'ADMIN' ? '#ede9fe' : u.role === 'CREATOR' ? '#dbeafe' : '#f3f4f6',
                      color: u.role === 'ADMIN' ? '#7c3aed' : u.role === 'CREATOR' ? '#1d4ed8' : '#4b5563',
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {u.isBanned ? (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#fee2e2', color: '#b91c1c' }}>BANNED</span>
                    ) : u.isSuspended ? (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#fef3c7', color: '#92400e' }}>SUSPENDED</span>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: u.isVerified ? '#d1fae5' : '#f3f4f6', color: u.isVerified ? '#047857' : '#6b7280' }}>
                        {u.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      type="button"
                      onClick={() => { setSelectedUserId(u.id); setIsUserModalVisible(true); }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, border: '1px solid #ede8e3', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {usersPagination.total > usersPagination.pageSize && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button
            type="button"
            disabled={usersPagination.current === 1}
            onClick={() => setUsersPagination(p => ({ ...p, current: p.current - 1 }))}
            style={{ ...primaryBtn, background: '#fff', color: '#374151', border: '1px solid #ede8e3', opacity: usersPagination.current === 1 ? 0.4 : 1, cursor: usersPagination.current === 1 ? 'not-allowed' : 'pointer' }}
          >
            ← Prev
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: '#6b7280', padding: '0 8px' }}>
            Page {usersPagination.current} of {Math.ceil(usersPagination.total / usersPagination.pageSize)}
          </span>
          <button
            type="button"
            disabled={usersPagination.current >= Math.ceil(usersPagination.total / usersPagination.pageSize)}
            onClick={() => setUsersPagination(p => ({ ...p, current: p.current + 1 }))}
            style={{ ...primaryBtn, background: '#fff', color: '#374151', border: '1px solid #ede8e3', opacity: usersPagination.current >= Math.ceil(usersPagination.total / usersPagination.pageSize) ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );

  // ── All Creators panel ───────────────────────────────────────────────────
  const renderCreatorsPanel = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={creatorsSearch}
            onChange={e => setCreatorsSearch(e.target.value)}
            placeholder="Search creators…"
            style={{ ...inputStyle, width: '100%', paddingLeft: 38, boxSizing: 'border-box' }}
          />
        </div>
        <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>{creatorsPagination.total} creators</span>
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {creatorsLoading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading…</div>
        ) : creatorList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>No creators found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#faf6f1' }}>
                {['Creator', 'Email', 'Category', 'Status', 'Joined', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #ede8e3' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {creatorList.map((c, idx) => (
                <tr key={c.id} style={{ borderTop: idx === 0 ? 'none' : '1px solid #f3f0ec', background: '#fff' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#111827' }}>{c.displayName}</td>
                  <td style={{ padding: '14px 16px', color: '#6b7280' }}>{c.user?.email || '-'}</td>
                  <td style={{ padding: '14px 16px', color: '#6b7280' }}>{c.category || '-'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: c.isVerified ? '#d1fae5' : '#f3f4f6', color: c.isVerified ? '#047857' : '#6b7280' }}>
                      {c.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: 13 }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      type="button"
                      onClick={() => { setSelectedCreatorId(c.id); setIsCreatorModalVisible(true); }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, border: '1px solid #ede8e3', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {creatorsPagination.total > creatorsPagination.pageSize && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button
            type="button"
            disabled={creatorsPagination.current === 1}
            onClick={() => setCreatorsPagination(p => ({ ...p, current: p.current - 1 }))}
            style={{ ...primaryBtn, background: '#fff', color: '#374151', border: '1px solid #ede8e3', opacity: creatorsPagination.current === 1 ? 0.4 : 1, cursor: creatorsPagination.current === 1 ? 'not-allowed' : 'pointer' }}
          >
            ← Prev
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: '#6b7280', padding: '0 8px' }}>
            Page {creatorsPagination.current} of {Math.ceil(creatorsPagination.total / creatorsPagination.pageSize)}
          </span>
          <button
            type="button"
            disabled={creatorsPagination.current >= Math.ceil(creatorsPagination.total / creatorsPagination.pageSize)}
            onClick={() => setCreatorsPagination(p => ({ ...p, current: p.current + 1 }))}
            style={{ ...primaryBtn, background: '#fff', color: '#374151', border: '1px solid #ede8e3', opacity: creatorsPagination.current >= Math.ceil(creatorsPagination.total / creatorsPagination.pageSize) ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );

  return pageShell(
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* HEADER with toggle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #ff3e48 0%, #ff6b48 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Home size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.2 }}>Admin</h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>
              {viewMode === 'curate' ? 'Curate the creators shown on the public home page' : viewMode === 'users' ? 'Manage and delete user accounts' : 'Manage and delete creator accounts'}
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 4 }}>
          {toggleBtn('curate', 'Curate Home', <Star size={14} />)}
          {toggleBtn('users', 'Users', <Users size={14} />)}
          {toggleBtn('allcreators', 'Creators', <Layers size={14} />)}
        </div>
      </div>

      {/* INLINE TOAST */}
      {msg && (
        <div style={{
          marginTop: 20,
          padding: '12px 16px',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 500,
          background: msg.kind === 'success' ? '#ecfdf5' : '#fef2f2',
          color: msg.kind === 'success' ? '#047857' : '#b91c1c',
          border: `1px solid ${msg.kind === 'success' ? '#a7f3d0' : '#fecaca'}`,
        }}>
          {msg.text}
        </div>
      )}

      {/* ── CURATE MODE ────────────────────────────────────────────────────── */}
      {viewMode === 'curate' && (
        <>
          {/* MAIN HIGHLIGHT */}
          <div style={{ ...card, marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Star size={16} color="#eab308" fill="#eab308" />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Main Highlight</span>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px', lineHeight: 1.5 }}>
              The single large creator shown in the &ldquo;Interact, don&rsquo;t just consume&rdquo; section. Must be one of the featured creators below.
            </p>
            <select
              value={mainHighlightId || ''}
              onChange={(e) => setMainHighlightId(e.target.value || null)}
              style={{ ...inputStyle, width: '100%', maxWidth: 420, cursor: 'pointer' }}
            >
              <option value="">— None —</option>
              {highlightOptions.map(c => (
                <option key={c.id} value={c.id}>
                  {c.displayName}{c.category ? ` (${c.category})` : ''}
                </option>
              ))}
            </select>
            {highlightOptions.length === 0 && (
              <p style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>
                Mark creators as featured below to make them available here.
              </p>
            )}
          </div>

          {/* FEATURED CREATORS */}
          <div style={{ ...card, marginTop: 20, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f0ec' }}>
              <span style={sectionLabel}>Featured Creators</span>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                Orders 1–3 show in the home page hero; every featured creator appears in the Find-Expert featured strip.
              </p>
            </div>

            {sorted.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                No active creators available.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {sorted.map((c, idx) => {
                  const isChecked = featuredIds.has(c.id);
                  return (
                    <li
                      key={c.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '16px 24px',
                        borderTop: idx === 0 ? 'none' : '1px solid #f3f0ec',
                        background: isChecked ? '#fffafa' : '#fff',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleFeatured(c.id, !isChecked)}
                        aria-pressed={isChecked}
                        aria-label={`${isChecked ? 'Unfeature' : 'Feature'} ${c.displayName}`}
                        style={{
                          width: 22, height: 22, flexShrink: 0,
                          borderRadius: 6,
                          border: `2px solid ${isChecked ? '#ff3e48' : '#d1d5db'}`,
                          background: isChecked ? '#ff3e48' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'all 0.12s',
                        }}
                      >
                        {isChecked && <Check size={14} color="#fff" strokeWidth={3} />}
                      </button>

                      {/* Avatar */}
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                        background: c.profileImage ? '#f3f0ec' : '#ffb4b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {c.profileImage ? (
                          <img src={getImageUrl(c.profileImage)} alt={c.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: 18, fontWeight: 700, color: '#ff3e48' }}>
                            {c.displayName?.[0]?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>

                      {/* Name + category */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{c.displayName}</span>
                          {c.isMainHighlight && mainHighlightId === c.id && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '2px 8px', borderRadius: 999, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                              Highlight
                            </span>
                          )}
                        </div>
                        {(c.category || c.tagline) && (
                          <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.category || c.tagline}
                          </p>
                        )}
                      </div>

                      {/* Order */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Order</span>
                        <select
                          value={featured[c.id] ?? ''}
                          disabled={!isChecked}
                          onChange={(e) => changeOrder(c.id, parseInt(e.target.value, 10))}
                          style={{
                            ...inputStyle,
                            padding: '6px 10px',
                            fontSize: 13,
                            width: 64,
                            cursor: isChecked ? 'pointer' : 'not-allowed',
                            opacity: isChecked ? 1 : 0.4,
                          }}
                        >
                          <option value="">—</option>
                          {Array.from({ length: Math.max(Object.keys(featured).length, 1) }, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* SAVE */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{ ...primaryBtn, opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              <Save size={16} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </>
      )}

      {/* ── USERS MODE ──────────────────────────────────────────────────────── */}
      {viewMode === 'users' && (
        <div style={{ marginTop: 28 }}>{renderUsersPanel()}</div>
      )}

      {/* ── CREATORS MODE ───────────────────────────────────────────────────── */}
      {viewMode === 'allcreators' && (
        <div style={{ marginTop: 28 }}>{renderCreatorsPanel()}</div>
      )}

      {/* Modals */}
      <UserDetailModal
        userId={selectedUserId}
        visible={isUserModalVisible}
        onClose={() => setIsUserModalVisible(false)}
        onSuccess={fetchUsers}
      />
      <CreatorDetailModal
        creatorId={selectedCreatorId}
        visible={isCreatorModalVisible}
        onClose={() => setIsCreatorModalVisible(false)}
        onSuccess={fetchAllCreators}
      />
    </div>
  );
};

export default AdminHomePage;
