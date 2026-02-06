// ===========================================
// RESET PASSWORD PAGE
// ===========================================

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LockOutlined,
  CheckCircleFilled,
  SafetyCertificateFilled,
  LoadingOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { message } from 'antd';
import api from '../services/api';
import '../styles/Auth.css';

const TESTIMONIALS = [
  {
    text: "AI Creator Platform helped me monetize my knowledge in ways I never imagined. The AI tools are incredible!",
    name: "Sarah Jenkins",
    role: "Digital Artist",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    text: "The best community for creators. I've found amazing partnerships here that boosted my career.",
    name: "David Chen",
    role: "Tech Educator",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    text: "Setting up my profile took minutes. Now I'm earning recurring revenue from my AI workshops.",
    name: "Elena Rodriguez",
    role: "AI Consultant",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
  }
];

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Rotate Testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      message.error('Reset token is missing. Please use the link from your email.');
      return;
    }

    if (!formData.newPassword || !formData.confirmPassword) {
      message.error('Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      message.error('Password must be at least 8 characters');
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/auth/reset-password', {
        token,
        newPassword: formData.newPassword
      });

      setIsSuccess(true);
      message.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      message.error(
        error.response?.data?.error ||
        'Failed to reset password. The link may be invalid or expired.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Left Brand Panel */}
      <div className="brand-panel">
        <div className="brand-content">
          <div className="brand-icon">✨</div>
          <h1 className="brand-headline">
            Secure your <br />
            account profile
          </h1>
          <p className="brand-subtext">
            Choose a strong password to protect your community and creative assets.
          </p>

          <ul className="benefit-list">
            <li className="benefit-item">
              <span className="check-icon"><CheckCircleFilled /></span>
              Free to start, cancel anytime
            </li>
            <li className="benefit-item">
              <span className="check-icon"><CheckCircleFilled /></span>
              No credit card required
            </li>
            <li className="benefit-item">
              <span className="check-icon"><CheckCircleFilled /></span>
              Military-grade encryption
            </li>
          </ul>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="testimonial-card"
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

          <div className="trust-badges">
            <span><SafetyCertificateFilled /> SSL Secured</span>
            <span>GDPR Compliant</span>
            <span>Verified by Stripe</span>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="form-panel">
        <div className="form-wrapper">
          {!token ? (
            <div className="form-header">
              <h2 className="form-title">Invalid Link ❌</h2>
              <p className="form-subtitle">This password reset link is invalid or missing.</p>
              <Link to="/forgot-password" style={{ display: 'block', marginTop: '24px' }}>
                <button type="button" className="submit-btn">Request New Link</button>
              </Link>
            </div>
          ) : isSuccess ? (
            <div className="form-header">
              <CheckCircleFilled style={{ fontSize: '64px', color: '#10B981', marginBottom: '24px' }} />
              <h2 className="form-title">Password Reset! 🎉</h2>
              <p className="form-subtitle">Your password has been changed. Use your new password to login. Redirecting...</p>
              <Link to="/login" style={{ display: 'block', marginTop: '32px' }}>
                <button type="button" className="submit-btn" onClick={() => navigate('/login')}>Sign Into Account</button>
              </Link>
            </div>
          ) : (
            <>
              <div className="form-header">
                <h2 className="form-title">Reset Password 🔑</h2>
                <p className="form-subtitle">Choose a powerful new password for your account.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="input-label">New Password</label>
                  <div className="input-wrapper">
                    <LockOutlined className="field-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      className="custom-input"
                      placeholder="••••••••••••"
                      value={formData.newPassword}
                      onChange={handleChange}
                      autoFocus
                    />
                    <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Confirm New Password</label>
                  <div className="input-wrapper">
                    <UnlockOutlined className="field-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      className="custom-input"
                      placeholder="••••••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '24px' }}>
                  Use at least 8 characters with at least one uppercase letter, one lowercase letter, and one number.
                </p>

                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Link to="/login" style={{ color: '#667EEA', fontWeight: 600 }}>Back to Login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
