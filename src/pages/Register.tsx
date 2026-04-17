import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { message } from 'antd';
import { RootState, AppDispatch } from '../store';
import { register, clearError } from '../store/slices/authSlice';
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

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading: authLoading, error, isProfileComplete } = useSelector((state: RootState) => state.auth);

  const [role, setRole] = useState<'USER' | 'CREATOR'>('USER');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [location, setLocation] = useState('');
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'CREATOR') {
        navigate(isProfileComplete ? '/creator-dashboard' : '/onboarding/creator');
      } else {
        // Fan/User — go back to previous page
        navigate(-1);
      }
    }
  }, [isAuthenticated, role, navigate, isProfileComplete]);

  useEffect(() => {
    if (error) {
      if (error.includes('email') || error.includes('Email')) {
        setErrors({ email: 'This email is already registered' });
      }
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Min 8 characters";
    if (!dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!location.trim()) newErrors.location = "Location is required";
    if (!terms) newErrors.terms = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await dispatch(register({
        email: email.trim(),
        password,
        name: `${firstName.trim()} ${lastName.trim()}`,
        role,
        dateOfBirth: dateOfBirth || undefined,
        location: location.trim() || undefined,
      })).unwrap();
      message.success('Account created successfully!');
    } catch (err: unknown) {
      if (typeof err === 'string' && err.includes('already exists')) {
        setErrors({ email: 'An account with this email already exists' });
      }
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
          <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 className="form-title">Create Account</h2>
              <p className="form-subtitle">( Select Account Type )</p>
            </div>
            {/* Role toggle */}
            <div style={{
              display: 'flex',
              borderRadius: 8,
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              fontSize: 13,
              fontWeight: 600,
            }}>
              <button
                type="button"
                onClick={() => setRole('USER')}
                style={{
                  padding: '8px 16px',
                  background: role === 'USER' ? '#111827' : '#fff',
                  color: role === 'USER' ? '#fff' : '#374151',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Fan / User
              </button>
              <button
                type="button"
                onClick={() => setRole('CREATOR')}
                style={{
                  padding: '8px 16px',
                  background: role === 'CREATOR' ? '#111827' : '#fff',
                  color: role === 'CREATOR' ? '#fff' : '#374151',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                AI Creator
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* First + Last Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>First Name</label>
                <input type="text" className={`custom-input ${errors.firstName ? 'error' : ''}`} style={{ paddingLeft: 16 }} placeholder="John" value={firstName} onChange={(e) => { setFirstName(e.target.value); setErrors(p => ({ ...p, firstName: '' })); }} />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>Last Name</label>
                <input type="text" className={`custom-input ${errors.lastName ? 'error' : ''}`} style={{ paddingLeft: 16 }} placeholder="Doe" value={lastName} onChange={(e) => { setLastName(e.target.value); setErrors(p => ({ ...p, lastName: '' })); }} />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>Email Address</label>
              <input type="email" className={`custom-input ${errors.email ? 'error' : ''}`} style={{ paddingLeft: 16 }} placeholder="john.doe@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }} />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label className="input-label" style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>Password</label>
              <div className="input-wrapper">
                <input type={showPassword ? "text" : "password"} className={`custom-input ${errors.password ? 'error' : ''}`} style={{ paddingLeft: 16 }} placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }} />
                <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="input-label">Date of Birth</label>
                <input
                  type="date"
                  className={`custom-input ${errors.dateOfBirth ? 'error' : ''}`}
                  style={{ paddingLeft: 16, colorScheme: 'light' }}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                />
                {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
              </div>
              <div>
                <label className="input-label">Location</label>
                <input
                  type="text"
                  className={`custom-input ${errors.location ? 'error' : ''}`}
                  style={{ paddingLeft: 16 }}
                  placeholder="e.g. Mumbai, India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                {errors.location && <span className="error-message">{errors.location}</span>}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#4B5563' }}>
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} style={{ width: 14, height: 14 }} />
                I agree to the <a href="#terms" style={{ color: '#ff3e48', fontWeight: 500 }}>Terms of Service</a> and <a href="#privacy" style={{ color: '#ff3e48', fontWeight: 500 }}>Privacy Policy</a>.
              </label>
              {errors.terms && <span className="error-message">{errors.terms}</span>}
            </div>

            <button type="submit" className="submit-btn" disabled={authLoading} style={{
              background: '#ff3e48',
              borderRadius: 10,
            }}>
              {authLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <span style={{ color: '#6B7280', fontSize: 14 }}>Already have an account? </span>
            <Link to="/login" style={{ color: '#ff3e48', fontWeight: 600, fontSize: 14 }}>Log In</Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Register;
