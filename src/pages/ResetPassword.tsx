import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { message } from 'antd';
import api from '../services/api';
import '../styles/Auth.css';

const TESTIMONIALS = [
  {
    text: "Creatorpal transformed how I organize my research. It's the first platform that understands the nuance of clinical pedagogy.",
    name: "Dr. Elena Rodriguez",
    role: "Clinical Curriculum Lead",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    text: "The best community for creators. I've found amazing partnerships here that boosted my career.",
    name: "David Chen",
    role: "Tech Educator",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
];

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      message.error('Reset token is missing');
      return;
    }
    if (!newPassword || !confirmPassword) {
      message.error('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      message.error('Password must be at least 8 characters');
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/auth/reset-password', { token, newPassword });
      setIsSuccess(true);
      message.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || 'Failed to reset password. The link may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="auth-card">
        {/* Left Brand Panel */}
        <div className="brand-panel">
          <div className="brand-content">
            <div style={{ marginBottom: 32 }}>
              <img src="/website/figma/logo11.png" alt="CreatorPal" style={{ height: 30, width: 'auto' }} />
            </div>
            <h1 className="brand-headline">
              Join <strong>10,000+</strong> Creators monetizing their expertise
            </h1>
            <p className="brand-subtext">
              The all-in-one platform for curriculum building, community management, and medical-grade data curation.
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="testimonial-card"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <p className="testimonial-text">"{TESTIMONIALS[activeTestimonial].text}"</p>
                <div className="testimonial-user">
                  <div
                    className="user-avatar"
                    style={{ backgroundImage: `url(${TESTIMONIALS[activeTestimonial].avatar})` }}
                  />
                  <div>
                    <div className="user-name">{TESTIMONIALS[activeTestimonial].name}</div>
                    <div className="user-role">{TESTIMONIALS[activeTestimonial].role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="form-panel">
          <div className="form-wrapper">
            {!token ? (
              <>
                <div className="form-header">
                  <h2 className="form-title">Invalid Link</h2>
                  <p className="form-subtitle">This password reset link is invalid or missing.</p>
                </div>
                <Link to="/forgot-password">
                  <button type="button" className="submit-btn" style={{ background: '#ff3e48', borderRadius: 10, width: '100%' }}>Request New Link</button>
                </Link>
                <div style={{ textAlign: 'center', marginTop: 28 }}>
                  <Link to="/login" style={{ color: '#ff3e48', fontWeight: 600, fontSize: 14 }}>Back to Login</Link>
                </div>
              </>
            ) : isSuccess ? (
              <>
                <div className="form-header">
                  <h2 className="form-title">Password Reset</h2>
                  <p className="form-subtitle">Your password has been changed successfully. Redirecting to login...</p>
                </div>
                <button type="button" className="submit-btn" onClick={() => navigate('/login')} style={{ background: '#ff3e48', borderRadius: 10 }}>
                  Go to Login
                </button>
              </>
            ) : (
              <>
                <div className="form-header">
                  <h2 className="form-title">Reset Password</h2>
                  <p className="form-subtitle">Choose a new password for your account</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="input-group">
                    <label className="input-label" style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>New Password</label>
                    <div className="input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="custom-input"
                        style={{ paddingLeft: 16 }}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoFocus
                      />
                      <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label" style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>Confirm Password</label>
                    <div className="input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="custom-input"
                        style={{ paddingLeft: 16 }}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
                    At least 8 characters with uppercase, lowercase, and a number.
                  </p>

                  <button type="submit" className="submit-btn" disabled={isLoading} style={{ background: '#ff3e48', borderRadius: 10 }}>
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 28 }}>
                  <Link to="/login" style={{ color: '#ff3e48', fontWeight: 600, fontSize: 14 }}>Back to Login</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
