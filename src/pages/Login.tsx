import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { message } from 'antd';
import { RootState, AppDispatch } from '../store';
import { login, clearError } from '../store/slices/authSlice';
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
  {
    text: "Setting up my profile took minutes. Now I'm earning recurring revenue from my AI workshops.",
    name: "Sarah Jenkins",
    role: "Digital Artist",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  }
];

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, error, user, isProfileComplete } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'USER') {
        // Fan/User — go back to previous page
        navigate(-1);
      } else if (user.role === 'CREATOR') {
        navigate(isProfileComplete ? '/creator-dashboard' : '/onboarding/creator');
      } else if (user.role === 'COMPANY') {
        navigate('/company-dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate, isProfileComplete]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      message.error("Please fill in all fields");
      return;
    }
    dispatch(login({ email, password }));
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
          <div className="form-header">
            <h2 className="form-title">Welcome Back</h2>
            <p className="form-subtitle">Sign in to your CreatorPal account</p>
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
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="custom-input"
                  style={{ paddingLeft: 16 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <Link to="/forgot-password" style={{ color: '#ff3e48', fontSize: 13, fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading} style={{
              background: '#ff3e48',
              borderRadius: 10,
            }}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <span style={{ color: '#6B7280', fontSize: 14 }}>Don't have an account? </span>
            <Link to="/register" style={{ color: '#ff3e48', fontWeight: 600, fontSize: 14 }}>Sign Up</Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;
