import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store';
import { logout, updateUser } from '../../store/slices/authSlice';
import { notificationApi, userApi, getImageUrl } from '../../services/api';
import api from '../../services/api';

export default function WebsiteUserProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.avatar) setAvatarUrl(getImageUrl(user.avatar));
  }, [user?.avatar]);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    (async () => {
      try {
        const res = await notificationApi.getNotifications({ limit: 20 });
        setNotifications(res.data.data?.notifications || res.data.data || []);
      } catch {}
      finally { setLoadingNotifs(false); }
    })();
  }, [isAuthenticated, navigate]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead?.(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post('/upload/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data.data.url;
      const resolved = getImageUrl(url);
      setAvatarUrl(resolved);
      dispatch(updateUser({ avatar: url }));
      await userApi.updateProfile({ avatar: url });
    } catch {
      // silent fail — upload error doesn't break the page
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!user) return null;

  const initial = (user.name || '?').charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#fbf7f4' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Header */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>

        {/* Profile Card */}
        <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: 20, padding: 32, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Avatar with edit overlay */}
            <div
              style={{ position: 'relative', width: 72, height: 72, flexShrink: 0, cursor: 'pointer' }}
              onClick={() => !avatarUploading && fileInputRef.current?.click()}
              title="Change profile photo"
            >
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff5b1f, #ff3e48)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 28, fontWeight: 700,
                overflow: 'hidden',
                opacity: avatarUploading ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initial}
              </div>
              {/* Camera icon overlay */}
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 24, height: 24, borderRadius: '50%',
                background: '#111827', border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {avatarUploading
                  ? <div style={{ width: 10, height: 10, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  : <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 12.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h2l1.5-2h4L12 4.5h1.5a1 1 0 0 1 1 1z"/>
                      <circle cx="8" cy="8.5" r="2"/>
                    </svg>
                }
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>{user.name}</h1>
              <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>{user.email}</p>
            </div>
            <button type="button" onClick={() => { dispatch(logout()); navigate('/'); }}
              style={{ padding: '8px 20px', borderRadius: 10, border: '1px solid #fecaca', background: '#fff', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Log out
            </button>
          </div>
        </div>

        {/* Become a Creator CTA */}
        {user.role !== 'CREATOR' && (
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1f1a 60%, #ff3e48 100%)',
            borderRadius: 20, padding: 32, marginBottom: 24, color: '#fff',
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Become a Creator</h2>
            <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6, margin: '0 0 20px', maxWidth: 500 }}>
              Turn your knowledge into an AI that answers questions, helps your audience, and earns you money — on autopilot.
            </p>
            <button type="button" onClick={() => navigate('/create-your-ai')}
              style={{
                padding: '12px 28px', borderRadius: 12,
                background: '#ff3e48', color: '#fff', fontSize: 14, fontWeight: 600,
                border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,62,72,0.3)',
              }}>
              Create Your AI
            </button>
          </div>
        )}

        {/* Notifications */}
        <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: 20, padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Notifications</h2>
          {loadingNotifs ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>Loading...</div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 }}>
              No notifications yet. Start chatting with creators to get updates!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notifications.map((n) => {
                const isBooking = n.type?.includes('BOOKING');
                const isChat = n.type?.includes('CHAT');
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '14px 16px', borderRadius: 12,
                      background: n.isRead ? '#fff' : '#fff5f5',
                      border: `1px solid ${n.isRead ? '#f3f0ec' : '#fecaca'}`,
                      cursor: n.isRead ? 'default' : 'pointer',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: isBooking ? '#ecfdf5' : isChat ? '#eff6ff' : '#fff5f5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isBooking ? '#10b981' : isChat ? '#3b82f6' : '#ff3e48',
                      fontSize: 16,
                    }}>
                      {isBooking ? '📅' : isChat ? '💬' : '🔔'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{n.title}</div>
                      <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, marginTop: 2 }}>{n.message}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                        {new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} at {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {!n.isRead && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff3e48', flexShrink: 0, marginTop: 6 }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
