import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MailOutlined,
  LockOutlined,
  CheckCircleFilled,
  GoogleOutlined,
  FacebookFilled,
  SafetyCertificateFilled,
  EyeInvisibleOutlined,
  EyeOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { message } from 'antd';
import { RootState, AppDispatch } from '../store';
import { login, clearError } from '../store/slices/authSlice';
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

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, error, user, isProfileComplete } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Rotate Testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      let path = '/dashboard';

      if (user.role === 'CREATOR') {
        // use isProfileComplete to decide where to go
        path = isProfileComplete ? '/creator-dashboard' : '/onboarding/creator';
      } else if (user.role === 'COMPANY') {
        path = '/company-dashboard';
      } else if (user.role === 'ADMIN') {
        path = '/admin';
      }

      navigate(path);
    }
  }, [isAuthenticated, user, navigate, isProfileComplete]);

  // Handle API Errors
  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      message.error("Please fill in all fields");
      return;
    }
    dispatch(login({ email: formData.email, password: formData.password }));
  };

  return (
    <div className="register-container">
      {/* Left Brand Panel */}
      <div className="brand-panel">
        <div className="brand-content">
          <div className="brand-icon">✨</div>
          <h1 className="brand-headline">
            Join 10,000+ creators <br />
            monetizing their expertise
          </h1>
          <p className="brand-subtext">
            The all-in-one platform for AI creators to build, sell, and grow their community.
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
              Set up your profile in 2 minutes
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
          <div className="form-header">
            <h2 className="form-title">👋 Welcome Back!</h2>
            <p className="form-subtitle">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Inputs */}
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <MailOutlined className="field-icon" />
                <input
                  type="email"
                  name="email"
                  className="custom-input"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <LockOutlined className="field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="custom-input"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#4B5563' }}>
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px' }}
                />
                Remember me
              </label>
              <Link to="/forgot-password" style={{ color: '#667EEA', fontSize: '0.9rem', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="divider">OR</div>

          <div className="social-buttons">
            <button className="social-btn">
              <GoogleOutlined style={{ color: '#EA4335' }} /> Google
            </button>
            <button className="social-btn">
              <FacebookFilled style={{ color: '#1877F2' }} /> Facebook
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <span style={{ color: '#6B7280' }}>New here? </span>
            <Link to="/register" style={{ color: '#667EEA', fontWeight: 600 }}>Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
