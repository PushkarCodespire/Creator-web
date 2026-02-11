import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  CheckCircle,
  ShieldCheck,
  EyeOff,
  Eye,
  Loader2,
  LayoutGrid,
  Building2
} from 'lucide-react';
import { message } from 'antd';
import { RootState, AppDispatch } from '../store';
import { register, clearError } from '../store/slices/authSlice';
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

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading: authLoading, error, isProfileComplete } = useSelector((state: RootState) => state.auth);

  // Form State
  const [role, setRole] = useState<'USER' | 'CREATOR' | 'COMPANY'>('USER');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    terms: false
  });

  // Validation State
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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
    if (isAuthenticated) {
      let path = '/dashboard';

      if (role === 'CREATOR') {
        path = isProfileComplete ? '/creator-dashboard' : '/onboarding/creator';
      } else if (role === 'COMPANY') {
        path = '/company-dashboard';
      }

      navigate(path);
    }
  }, [isAuthenticated, role, navigate, isProfileComplete]);

  // Handle API Errors
  useEffect(() => {
    if (error) {
      // Parse error message for better UX
      let errorMessage = error;

      if (error.includes('email') || error.includes('Email')) {
        setErrors({ email: 'This email is already registered' });
        errorMessage = 'Email already exists';
      } else if (error.includes('password') || error.includes('Password')) {
        setErrors({ password: 'Password does not meet requirements' });
        errorMessage = 'Invalid password format';
      } else if (error.includes('name') || error.includes('Name')) {
        setErrors({ name: 'Invalid name format' });
        errorMessage = 'Invalid name format';
      } else if (error.includes('validation')) {
        errorMessage = 'Please check all fields and try again';
      }

      message.error(errorMessage);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Real-time Email Validation (Simulated)
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      setEmailStatus('idle');
      return;
    }

    if (emailRegex.test(formData.email)) {
      setEmailStatus('checking');
      const timer = setTimeout(() => {
        // Simulate API check
        setEmailStatus('available');
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setEmailStatus('idle');
    }
  }, [formData.email]);

  // Password Strength Calculation
  useEffect(() => {
    const pwd = formData.password;
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 10;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 20;
    if (/[0-9]/.test(pwd)) strength += 20;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 10;
    setPasswordStrength(Math.min(strength, 100));
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    // Trim whitespace for name and email fields
    const processedValue = type === 'checkbox' ? checked :
      (name === 'name' || name === 'email') ? value.trimStart() : value;

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Name validation: 2-100 characters, letters and spaces only
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
      newErrors.name = "Name must be between 2 and 100 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // Email validation: Valid email format
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation: Minimum 8 characters with uppercase, lowercase, and number
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else {
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);

      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        newErrors.password = "Password must contain uppercase, lowercase, and a number";
      }
    }

    // Terms validation
    if (!formData.terms) {
      newErrors.terms = "You must agree to the Terms of Service";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(register({
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
        role: role || 'USER'
      })).unwrap();

      // Success - show message and redirect
      message.success('Account created successfully! Welcome to AI Creator Platform.');

      // Redirect based on role
      setTimeout(() => {
        const path = role === 'CREATOR'
          ? (isProfileComplete ? '/creator-dashboard' : '/onboarding/creator')
          : role === 'COMPANY' ? '/company-dashboard' : '/dashboard';
        navigate(path);
      }, 500);
    } catch (error: any) {
      // Error handling is done in useEffect via Redux error state
      // But we can add more specific error messages here if needed
      if (error?.includes('already exists')) {
        setErrors({ email: 'An account with this email already exists' });
      }
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return '#EF4444'; // Red
    if (passwordStrength < 80) return '#F59E0B'; // Orange
    return '#10B981'; // Green
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
              <span className="check-icon"><CheckCircle size={14} /></span>
              Free to start, cancel anytime
            </li>
            <li className="benefit-item">
              <span className="check-icon"><CheckCircle size={14} /></span>
              No credit card required
            </li>
            <li className="benefit-item">
              <span className="check-icon"><CheckCircle size={14} /></span>
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
            <span><ShieldCheck size={14} /> SSL Secured</span>
            <span>GDPR Compliant</span>
            <span>Verified by Stripe</span>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="form-panel">
        <div className="form-wrapper">
          <div className="form-header">
            <h2 className="form-title">Create your account</h2>
            <p className="form-subtitle">Choose how you want to use the platform</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Account Type Selector */}
            <div className="account-type-grid">
              <div
                className={`account-type-card ${role === 'USER' ? 'selected' : ''}`}
                onClick={() => setRole('USER')}
              >
                <div className="type-icon"><User size={20} /></div>
                <div className="type-info">
                  <h4>Fan / User</h4>
                  <p>Chat with AI creators</p>
                </div>
              </div>

              <div
                className={`account-type-card ${role === 'CREATOR' ? 'selected' : ''}`}
                onClick={() => setRole('CREATOR')}
              >
                <div className="type-icon"><LayoutGrid size={20} /></div>
                <div className="type-info">
                  <h4>AI Creator</h4>
                  <p>Monetize your expertise</p>
                </div>
              </div>

              <div
                className={`account-type-card ${role === 'COMPANY' ? 'selected' : ''}`}
                onClick={() => setRole('COMPANY')}
              >
                <div className="type-icon"><Building2 size={20} /></div>
                <div className="type-info">
                  <h4>Company</h4>
                  <p>Find partners & talent</p>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div className="input-wrapper">
                <User className="field-icon" size={18} />
                <input
                  type="text"
                  name="name"
                  className={`custom-input ${errors.name ? 'error' : ''}`}
                  placeholder={role === 'COMPANY' ? "Company Name" : "John Doe"}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <Mail className="field-icon" size={18} />
                <input
                  type="email"
                  name="email"
                  className={`custom-input ${errors.email ? 'error' : emailStatus === 'available' ? 'success' : ''}`}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {emailStatus === 'checking' && <Loader2 className="validation-icon animate-spin" size={16} />}
                {emailStatus === 'available' && <CheckCircle className="validation-icon success" size={16} />}
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <Lock className="field-icon" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`custom-input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>

              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar" style={{
                    width: `${passwordStrength}%`,
                    backgroundColor: getStrengthColor(),
                    opacity: passwordStrength > 0 ? 1 : 0,
                    transition: 'all 0.3s ease'
                  }} />
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ color: formData.password.length >= 8 ? '#10B981' : '#9CA3AF' }}>
                      {formData.password.length >= 8 ? '✓' : '○'} 8+ characters
                    </span>
                    <span style={{ color: /[A-Z]/.test(formData.password) ? '#10B981' : '#9CA3AF' }}>
                      {/[A-Z]/.test(formData.password) ? '✓' : '○'} Uppercase
                    </span>
                    <span style={{ color: /[a-z]/.test(formData.password) ? '#10B981' : '#9CA3AF' }}>
                      {/[a-z]/.test(formData.password) ? '✓' : '○'} Lowercase
                    </span>
                    <span style={{ color: /[0-9]/.test(formData.password) ? '#10B981' : '#9CA3AF' }}>
                      {/[0-9]/.test(formData.password) ? '✓' : '○'} Number
                    </span>
                  </div>
                </div>
              )}
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#4B5563' }}>
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px' }}
                />
                I agree to the Terms of Service and Privacy Policy
              </label>
              {errors.terms && <span className="error-message">{errors.terms}</span>}
            </div>

            <button type="submit" className="submit-btn" disabled={authLoading}>
              {authLoading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>



          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <span style={{ color: '#6B7280' }}>Already have an account? </span>
            <Link to="/login" style={{ color: '#667EEA', fontWeight: 600 }}>Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
