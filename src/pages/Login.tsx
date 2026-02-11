import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2
} from 'lucide-react';
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
          <div className="brand-logo-container" style={{ marginBottom: '32px' }}>
            <img src="/Logo.png" alt="CodeSpire" style={{ height: '56px', width: 'auto' }} />
          </div>
          <h1 className="brand-headline">
            Join 10,000+ creators <br />
            monetizing their expertise
          </h1>
          <p className="brand-subtext">
            The all-in-one platform for AI creators to build, sell, and grow their community.
          </p>

          <ul className="benefit-list">
            <li className="benefit-item">
              <span className="check-icon">
                <CheckCircle size={14} color="#ffffff" strokeWidth={3} />
              </span>
              Free to start, cancel anytime
            </li>
            <li className="benefit-item">
              <span className="check-icon">
                <CheckCircle size={14} color="#ffffff" strokeWidth={3} />
              </span>
              No credit card required
            </li>
            <li className="benefit-item">
              <span className="check-icon">
                <CheckCircle size={14} color="#ffffff" strokeWidth={3} />
              </span>
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
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> SSL Secured
            </span>
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
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <Mail className="field-icon" size={18} strokeWidth={2} />
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
                <Lock className="field-icon" size={18} strokeWidth={2} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="custom-input"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#4a5565' }}>
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid #e5e7eb' }}
                />
                Remember me
              </label>
              <Link to="/forgot-password" style={{ color: '#1268ff', fontSize: '0.875rem', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Loader2 className="animate-spin" size={20} />
                  Signing in...
                </div>
              ) : 'Sign In'}
            </button>
          </form>


          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <span style={{ color: '#6a7282', fontSize: '0.95rem' }}>New here? </span>
            <Link to="/register" style={{ color: '#1268ff', fontWeight: 600, fontSize: '0.95rem' }}>Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
