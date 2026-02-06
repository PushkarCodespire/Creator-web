// ===========================================
// FORGOT PASSWORD PAGE
// ===========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MailOutlined,
  ArrowLeftOutlined,
  LoadingOutlined,
  CheckCircleFilled,
  SafetyCertificateFilled
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

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Rotate Testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      message.error('Please enter your email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      message.error('Please enter a valid email');
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/auth/forgot-password', { email: email.trim() });
      setIsSuccess(true);
      message.success('Password reset link sent! Check your email.');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to send reset email. Please try again.');
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
            Recover your access <br />
            in seconds
          </h1>
          <p className="brand-subtext">
            Get back to building your community. We will send a secure reset link to your inbox.
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
              Fast & secure verification
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
          {!isSuccess ? (
            <>
              <div className="form-header">
                <h2 className="form-title">Forgot Password? 🔐</h2>
                <p className="form-subtitle">Enter your email and we'll send a link to reset your password.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <div className="input-wrapper">
                    <MailOutlined className="field-icon" />
                    <input
                      type="email"
                      className="custom-input"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? (
                    <span><LoadingOutlined /> Sending...</span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Link to="/login" style={{ color: '#667EEA', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <ArrowLeftOutlined /> Back to Login
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="form-header">
                <h2 className="form-title">Check your email 📧</h2>
                <p className="form-subtitle">
                  We sent a reset link to <strong>{email}</strong>.
                </p>
              </div>

              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <p style={{ margin: 0, color: '#4B5563', fontSize: '1rem', lineHeight: '1.6' }}>
                  The link will expire in 1 hour. If you don’t see it within a few minutes, please check your spam folder.
                </p>
              </div>

              <button type="button" className="submit-btn" onClick={() => setIsSuccess(false)}>
                Send Another Email
              </button>

              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Link to="/login" style={{ color: '#667EEA', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <ArrowLeftOutlined /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
