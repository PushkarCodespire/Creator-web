import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);

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
      message.success('Password reset link sent!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || 'Failed to send reset email');
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
            {!isSuccess ? (
              <>
                <div className="form-header">
                  <h2 className="form-title">Forgot Password</h2>
                  <p className="form-subtitle">Enter your email and we'll send a link to reset your password</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="input-group">
                    <label className="input-label" style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>Email Address</label>
                    <input
                      type="email"
                      className="custom-input"
                      style={{ paddingLeft: 16 }}
                      placeholder="john.doe@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <button type="submit" className="submit-btn" disabled={isLoading} style={{ background: '#ff3e48', borderRadius: 10 }}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 28 }}>
                  <span style={{ color: '#6B7280', fontSize: 14 }}>Remember your password? </span>
                  <Link to="/login" style={{ color: '#ff3e48', fontWeight: 600, fontSize: 14 }}>Log In</Link>
                </div>
              </>
            ) : (
              <>
                <div className="form-header">
                  <h2 className="form-title">Check Your Email</h2>
                  <p className="form-subtitle">
                    We sent a reset link to <strong>{email}</strong>
                  </p>
                </div>

                <div style={{ background: '#f9fafb', border: '1px solid #ede8e3', borderRadius: 12, padding: 24, marginBottom: 24 }}>
                  <p style={{ margin: 0, color: '#4B5563', fontSize: 14, lineHeight: 1.6 }}>
                    The link will expire in 1 hour. If you don't see it, check your spam folder.
                  </p>
                </div>

                <button type="button" className="submit-btn" onClick={() => setIsSuccess(false)} style={{ background: '#ff3e48', borderRadius: 10 }}>
                  Send Another Email
                </button>

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

export default ForgotPassword;
