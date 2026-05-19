import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { notificationApi } from '../../services/api';
import { Activity } from 'lucide-react';

export default function WebsiteUserProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

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

  if (!user) return null;

  const initial = (user.name || '?').charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#fbf7f4' }}>
      {/* Header */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>

        {/* Profile Card */}
        <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: 20, padding: 32, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff5b1f, #ff3e48)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 28, fontWeight: 700, flexShrink: 0,
            }}>
              {user.avatar ? (
                <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : initial}
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

        {/* Fitness Profile */}
        <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: 20, padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff3e48' }}>
                <Activity size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Fitness Profile</h2>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                  {user.onboardingCompleted ? 'Your goals & preferences' : 'Not set up yet'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/onboarding')}
              style={{ padding: '8px 20px', borderRadius: 10, border: '1px solid #ede8e3', background: '#fff', color: '#111827', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              {user.onboardingCompleted ? 'Edit' : 'Set up'}
            </button>
          </div>
          {user.onboardingCompleted && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {[user.fitnessGoal, user.dietPreference, user.ageRange, user.coachStyle].filter(Boolean).map(tag => (
                <span key={tag} style={{ padding: '4px 12px', borderRadius: 99, background: '#f3f4f6', fontSize: 12, color: '#374151', fontWeight: 500 }}>{tag}</span>
              ))}
            </div>
          )}
        </div>

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
    </div>
  );
}
