// ===========================================
// VERIFY EMAIL PAGE
// ===========================================

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined, SafetyCertificateFilled, ArrowRightOutlined, RocketOutlined } from '@ant-design/icons';
import { message, Spin } from 'antd';
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

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Rotate Testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Invalid or missing verification token.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.post('/auth/verify-email', { token });

        if (response.data.success) {
          setIsSuccess(true);
          setError(null);
          setSuccessMessage(response.data.message || 'Email verified successfully.');
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { error?: string; message?: string } } };
        const apiMessage =
          e.response?.data?.error ||
          e.response?.data?.message ||
          'Verification failed. The link may be invalid or expired.';

        if (typeof apiMessage === 'string' && apiMessage.toLowerCase().includes('already verified')) {
          setIsSuccess(true);
          setError(null);
          setSuccessMessage(apiMessage);
        } else {
          setIsSuccess(false);
          setError(apiMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  const handleResend = async () => {
    try {
      setResendStatus('sending');
      setResendMessage(null);
      const response = await api.post('/auth/resend-verification');
      if (response.data?.success) {
        setResendStatus('sent');
        setResendMessage(response.data?.message || 'Verification email sent. Check your inbox.');
        message.success('Verification email resent successfully.');
      } else {
        setResendStatus('error');
        setResendMessage(response.data?.message || 'Unable to resend verification email.');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      const apiMessage =
        e.response?.data?.error ||
        e.response?.data?.message ||
        'Unable to resend verification email. Please log in and try again.';
      setResendStatus('error');
      setResendMessage(apiMessage);
      message.error(apiMessage);
    }
  };

  return (
    <div className="register-container">
      {/* Left Brand Panel */}
      <div className="brand-panel">
        <div className="brand-content">
          <div className="brand-icon">✨</div>
          <h1 className="brand-headline">
            One step closer <br />
            to your community
          </h1>
          <p className="brand-subtext">
            Verifying your email ensures your account is secure and you receive important updates from other creators.
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
              Secure access to all features
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

      {/* Right Content Panel */}
      <div className="form-panel">
        <div className="form-wrapper" style={{ textAlign: 'center' }}>
          {isLoading ? (
            <>
              <div className="form-header">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 64, color: '#667EEA' }} spin />} />
                <h2 className="form-title" style={{ marginTop: '32px' }}>Verifying Identity...</h2>
                <p className="form-subtitle">Please wait while we confirm your email address.</p>
              </div>
            </>
          ) : isSuccess ? (
            <>
              <div className="form-header">
                <CheckCircleFilled style={{ fontSize: '64px', color: '#10B981', marginBottom: '24px' }} />
                <h2 className="form-title">Email Verified! 🎉</h2>
                <p className="form-subtitle">
                  {successMessage || 'Your email has been verified. You can now access all features of the platform.'}
                </p>
              </div>

              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: 24, marginBottom: 32 }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', textAlign: 'left' }}>
                  <RocketOutlined style={{ fontSize: '24px', color: '#10B981' }} />
                  <div>
                    <h4 style={{ margin: 0, color: '#064E3B' }}>Account Ready</h4>
                    <p style={{ margin: 0, color: '#065F46', fontSize: '0.9rem' }}>You're all set to start your creative journey.</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="submit-btn"
                onClick={() => navigate('/login')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
              >
                Go to Dashboard <ArrowRightOutlined />
              </button>
            </>
          ) : (
            <>
              <div className="form-header">
                <CloseCircleFilled style={{ fontSize: '64px', color: '#EF4444', marginBottom: '24px' }} />
                <h2 className="form-title">Verification Failed ❌</h2>
                <p className="form-subtitle">
                  {error || 'The verification link is invalid or has expired.'}
                </p>
              </div>

              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 24, marginBottom: 32 }}>
                <p style={{ margin: 0, color: '#991B1B', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  If your link expired, you can request a new one below. Make sure to check your spam folder.
                </p>
              </div>

              <button
                type="button"
                className="submit-btn"
                onClick={handleResend}
                disabled={resendStatus === 'sent'}
                style={{ marginBottom: '16px', background: resendStatus === 'sent' ? '#9CA3AF' : '#667EEA' }}
              >
                {resendStatus === 'sending' ? (
                  <span><LoadingOutlined /> Resending...</span>
                ) : resendStatus === 'sent' ? (
                  'Verification Email Sent'
                ) : (
                  'Resend Verification Link'
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Link to="/login" style={{ color: '#4B5563', fontWeight: 500 }}>
                  Back to Login
                </Link>
                <span style={{ margin: '0 12px', color: '#D1D5DB' }}>|</span>
                <Link to="/register" style={{ color: '#667EEA', fontWeight: 600 }}>
                  Create New Account
                </Link>
              </div>

              {resendMessage && resendStatus !== 'sent' && (
                <div style={{ marginTop: '16px' }}>
                  <span style={{ color: resendStatus === 'error' ? '#EF4444' : '#6B7280', fontSize: '0.875rem' }}>
                    {resendMessage}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
