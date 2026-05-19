// ===========================================
// VERIFY EMAIL PAGE
// ===========================================

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined, SafetyCertificateFilled, ArrowRightOutlined, RocketOutlined, MailOutlined } from '@ant-design/icons';
import { message, Spin } from 'antd';
import api from '../services/api';
import { loginSuccess } from '../store/slices/authSlice';
import type { RootState, AppDispatch } from '../store';
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
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const redirectParam = searchParams.get('redirect');

  const [isLoading, setIsLoading] = useState(!!token);
  const [isPending, setIsPending] = useState(!token);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [countdown, setCountdown] = useState(0);

  // Rotate Testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Redirect destination priority: URL param (cross-device) > localStorage (same-device) > role default
  const navigateAfterVerification = useCallback(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u?.role === 'CREATOR') { navigate('/onboarding/creator'); return; }
      if (u?.role === 'COMPANY') { navigate('/company-dashboard'); return; }
      if (u?.role === 'ADMIN') { navigate('/admin'); return; }
      // New users: send to fitness onboarding; returning users: honour redirect
      if (!u?.onboardingCompleted) { navigate('/onboarding'); return; }
      const savedRedirect = localStorage.getItem('postVerifyRedirect') || '/';
      localStorage.removeItem('postVerifyRedirect');
      navigate(redirectParam || savedRedirect);
    } catch {
      navigate('/login');
    }
  }, [navigate, redirectParam]);

  // Auto-redirect with countdown after successful verification
  useEffect(() => {
    if (!isSuccess) return;
    setCountdown(3);
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(id);
          navigateAfterVerification();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isSuccess, navigateAfterVerification]);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setIsPending(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.post('/auth/verify-email', { token });

        if (response.data.success) {
          // Log the user in on this device using the token returned by the server
          const { user: verifiedUser, token: jwtToken } = response.data.data || {};
          if (verifiedUser && jwtToken) {
            dispatch(loginSuccess({ user: verifiedUser, token: jwtToken }));
          }
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
    if (!isAuthenticated) {
      navigate('/login?redirect=/verify-email');
      return;
    }
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
      <div className="auth-card">
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
                <Spin indicator={<LoadingOutlined style={{ fontSize: 64, color: '#ff3e48' }} spin />} />
                <h2 className="form-title" style={{ marginTop: '32px' }}>Verifying Identity...</h2>
                <p className="form-subtitle">Please wait while we confirm your email address.</p>
              </div>
            </>
          ) : isPending ? (
            <>
              <div className="form-header">
                <MailOutlined style={{ fontSize: '64px', color: '#ff3e48', marginBottom: '24px' }} />
                <h2 className="form-title">Check your inbox</h2>
                <p className="form-subtitle">
                  We sent a verification link to your email address. Click the link to activate your account.
                </p>
              </div>

              <div style={{ background: 'rgba(255,62,72,0.06)', border: '1px solid rgba(255,62,72,0.2)', borderRadius: 12, padding: 24, marginBottom: 32 }}>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                  The link expires in <strong>24 hours</strong>. If you don't see it, check your spam folder.
                </p>
              </div>

              <button
                type="button"
                className="submit-btn"
                onClick={handleResend}
                disabled={resendStatus === 'sent' || resendStatus === 'sending'}
                style={{ marginBottom: '16px', background: resendStatus === 'sent' ? '#9CA3AF' : '#ff3e48' }}
              >
                {resendStatus === 'sending' ? (
                  <span><LoadingOutlined /> Resending...</span>
                ) : resendStatus === 'sent' ? (
                  'Email Sent'
                ) : (
                  'Resend Verification Email'
                )}
              </button>

              {resendMessage && (
                <div style={{ marginTop: '8px' }}>
                  <span style={{ color: resendStatus === 'error' ? '#EF4444' : '#10B981', fontSize: '0.875rem' }}>
                    {resendMessage}
                  </span>
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Link to="/login" style={{ color: '#4B5563', fontWeight: 500 }}>Back to Login</Link>
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

              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: 24, marginBottom: 32 }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', textAlign: 'left' }}>
                  <RocketOutlined style={{ fontSize: '24px', color: '#10B981' }} />
                  <div>
                    <h4 style={{ margin: 0 }}>Account Ready</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>You're all set to start your creative journey.</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="submit-btn"
                onClick={navigateAfterVerification}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: '#ff3e48', borderRadius: 10 }}
              >
                Let's Get Started <ArrowRightOutlined />
              </button>
              {countdown > 0 && (
                <p style={{ margin: '12px 0 0', fontSize: '0.85rem', color: '#6B7280' }}>
                  Redirecting in {countdown}s…
                </p>
              )}
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

              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: 24, marginBottom: 32 }}>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
                  If your link expired, you can request a new one below. Make sure to check your spam folder.
                </p>
              </div>

              <button
                type="button"
                className="submit-btn"
                onClick={handleResend}
                disabled={resendStatus === 'sent'}
                style={{ marginBottom: '16px', background: resendStatus === 'sent' ? '#9CA3AF' : '#ff3e48' }}
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
                <Link to="/register" style={{ color: '#ff3e48', fontWeight: 600 }}>
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
    </div>
  );
};

export default VerifyEmail;
