import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { authApi } from '../../services/api';
import { updateUser } from '../../store/slices/authSlice';

export default function WebsiteBecomeCreator() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [about, setAbout] = useState('');
  const [expertise, setExpertise] = useState('');
  const [topics, setTopics] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (user?.role === 'CREATOR') {
    navigate('/creator-dashboard');
    return null;
  }

  const handleBecomeCreator = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.becomeCreator({ about, expertise, topics });
      const data = res.data.data;

      // Update token and user in localStorage + redux
      if (data.token) localStorage.setItem('token', data.token);
      dispatch(updateUser({ ...data.user, role: 'CREATOR' }));

      // Store prefilled data for onboarding
      sessionStorage.setItem('creatorPrefill', JSON.stringify({ about, expertise, topics }));

      // Navigate to onboarding
      navigate('/onboarding/creator');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setError(e?.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fbf7f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 480, width: '100%', padding: '0 24px' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 40, border: '1px solid #ede8e3', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #ff5b1f, #ff3e48)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26Z" />
              </svg>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Become a Creator</h1>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '8px 0 0', lineHeight: 1.5 }}>
              Hi {user?.name?.split(' ')[0]}! Fill in a few details to set up your AI.
            </p>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Your Expertise</label>
              <input type="text" value={expertise} onChange={(e) => setExpertise(e.target.value)}
                placeholder="e.g. Weight loss expert, Fitness coach"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #ede8e3', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fafaf8' }} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>About You</label>
              <textarea value={about} onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell us about your experience, credentials, and what you help people with..."
                rows={3}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #ede8e3', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fafaf8', resize: 'vertical' }} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Topics You Cover</label>
              <input type="text" value={topics} onChange={(e) => setTopics(e.target.value)}
                placeholder="e.g. Nutrition, Weight Loss, Strength Training"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #ede8e3', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fafaf8' }} />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}

          <button type="button" onClick={handleBecomeCreator} disabled={loading}
            style={{
              width: '100%', marginTop: 24, padding: '14px 0', borderRadius: 12,
              background: loading ? '#d1d5db' : 'linear-gradient(135deg, #ff5b1f, #ff3e48)',
              color: '#fff', fontSize: 15, fontWeight: 700, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(255,62,72,0.3)',
            }}>
            {loading ? 'Setting up...' : 'Continue to Setup'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 14 }}>
            You can always update these later in your dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
