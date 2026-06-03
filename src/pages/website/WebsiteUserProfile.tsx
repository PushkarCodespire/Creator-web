import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { notificationApi } from '../../services/api';
import { Activity } from 'lucide-react';
import styles from './WebsiteUserProfile.module.css';

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
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Profile Card ── */}
        <div className={styles.profileCard}>
          <div className={styles.profileRow}>
            <div className={styles.avatar}>
              {user.avatar
                ? <img src={user.avatar} alt="" className={styles.avatarImg} />
                : initial}
            </div>
            <div className={styles.profileMeta}>
              <h1 className={styles.profileName}>{user.name}</h1>
              <p className={styles.profileEmail}>{user.email}</p>
            </div>
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={() => { dispatch(logout()); navigate('/'); }}
            >
              Log out
            </button>
          </div>
        </div>

        {/* ── Become a Creator CTA ── */}
        {user.role !== 'CREATOR' && (
          <div className={styles.creatorCta}>
            <h2 className={styles.creatorCtaTitle}>Become a Creator</h2>
            <p className={styles.creatorCtaText}>
              Turn your knowledge into an AI that answers questions, helps your audience,
              and earns you money — on autopilot.
            </p>
            <button
              type="button"
              className={styles.creatorCtaBtn}
              onClick={() => navigate('/create-your-ai')}
            >
              Create Your AI
            </button>
          </div>
        )}

        {/* ── Fitness Profile ── */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionRow}>
            <div className={styles.sectionLeft}>
              <div className={styles.sectionIcon}>
                <Activity size={18} />
              </div>
              <div>
                <h2 className={styles.sectionTitle}>Fitness Profile</h2>
                <p className={styles.sectionSub}>
                  {user.onboardingCompleted ? 'Your goals & preferences' : 'Not set up yet'}
                </p>
              </div>
            </div>
            <button
              type="button"
              className={styles.sectionBtn}
              onClick={() => navigate('/onboarding')}
            >
              {user.onboardingCompleted ? 'Edit' : 'Set up'}
            </button>
          </div>
          {user.onboardingCompleted && (
            <div className={styles.fitnessTags}>
              {[user.fitnessGoal, user.dietPreference, user.ageRange, user.coachStyle]
                .filter(Boolean)
                .map(tag => (
                  <span key={tag} className={styles.fitnessTag}>{tag}</span>
                ))}
            </div>
          )}
        </div>

        {/* ── Notifications ── */}
        <div className={styles.sectionCard}>
          <h2 className={styles.notifTitle}>Notifications</h2>
          {loadingNotifs ? (
            <div className={styles.empty}>Loading...</div>
          ) : notifications.length === 0 ? (
            <div className={styles.empty}>
              No notifications yet.<br />Start chatting with creators to get updates!
            </div>
          ) : (
            <div className={styles.notifList}>
              {notifications.map((n) => {
                const isBooking = n.type?.includes('BOOKING');
                const isChat    = n.type?.includes('CHAT');
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                    className={`${styles.notifItem} ${n.isRead ? styles.notifItemRead : styles.notifItemUnread}`}
                  >
                    <div
                      className={styles.notifIcon}
                      style={{
                        background: isBooking ? '#ecfdf5' : isChat ? '#eff6ff' : '#fff5f5',
                        color:      isBooking ? '#10b981' : isChat ? '#3b82f6' : '#ff3e48',
                      }}
                    >
                      {isBooking ? '📅' : isChat ? '💬' : '🔔'}
                    </div>
                    <div className={styles.notifBody}>
                      <div className={styles.notifHeading}>{n.title}</div>
                      <div className={styles.notifMessage}>{n.message}</div>
                      <div className={styles.notifTime}>
                        {new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        {' '}at{' '}
                        {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {!n.isRead && <div className={styles.notifDot} />}
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
