import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { register, clearError } from '../../store/slices/authSlice';
import styles from './WebsiteAuth.module.css';

export default function WebsiteRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [localError, setLocalError] = useState('');

  const redirectTo = searchParams.get('redirect') || '/';
  const plan = searchParams.get('plan') || '';

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      const target = plan ? `${redirectTo}?plan=${plan}` : redirectTo;
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo, plan]);

  // Clear errors on unmount
  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  // Map server-side errors to field-level errors
  useEffect(() => {
    if (!error) return;
    const isEmailError =
      error.toLowerCase().includes('email') ||
      error.toLowerCase().includes('domain') ||
      error.toLowerCase().includes('disposable') ||
      error.toLowerCase().includes('already') ||
      error.toLowerCase().includes('check your');
    if (isEmailError) {
      const friendlyMsg = error.toLowerCase().includes('already')
        ? 'This email is already registered'
        : error;
      setFieldErrors(p => ({ ...p, email: friendlyMsg }));
    }
    dispatch(clearError());
  }, [error, dispatch]);

  const handleEmailBlur = () => {
    if (!email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      setFieldErrors(p => ({ ...p, email: 'Please enter a valid email address' }));
  };

  const handlePhoneBlur = () => {
    if (!phone.trim()) return;
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    if (!/^\+?[0-9]{7,15}$/.test(cleaned))
      setFieldErrors(p => ({ ...p, phone: 'Please enter a valid phone number (e.g. +91 9876543210)' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email address';
    if (!password.trim()) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    else {
      const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
      if (!/^\+?[0-9]{7,15}$/.test(cleaned)) errs.phone = 'Please enter a valid phone number';
    }

    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

    dispatch(register({ name: name.trim(), email: email.trim(), password, phone: phone.trim(), role: 'USER' }));
  };

  const displayError = localError || error;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Join CreatorPal and start chatting</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {displayError && <div className={styles.error}>{displayError}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Full name</label>
            <input
              type="text"
              className={`${styles.input}${fieldErrors.name ? ` ${styles.inputError}` : ''}`}
              placeholder="John Doe"
              value={name}
              onChange={(e) => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: '' })); }}
              autoComplete="name"
            />
            {fieldErrors.name && <span className={styles.fieldError}>{fieldErrors.name}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={`${styles.input}${fieldErrors.email ? ` ${styles.inputError}` : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
              onBlur={handleEmailBlur}
              autoComplete="email"
            />
            {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={`${styles.input}${fieldErrors.password ? ` ${styles.inputError}` : ''}`}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
              autoComplete="new-password"
            />
            {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm password</label>
            <input
              type="password"
              className={`${styles.input}${fieldErrors.confirmPassword ? ` ${styles.inputError}` : ''}`}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(p => ({ ...p, confirmPassword: '' })); }}
              autoComplete="new-password"
            />
            {fieldErrors.confirmPassword && <span className={styles.fieldError}>{fieldErrors.confirmPassword}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Phone number</label>
            <input
              type="tel"
              className={`${styles.input}${fieldErrors.phone ? ` ${styles.inputError}` : ''}`}
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setFieldErrors(p => ({ ...p, phone: '' })); }}
              onBlur={handlePhoneBlur}
              autoComplete="tel"
            />
            {fieldErrors.phone && <span className={styles.fieldError}>{fieldErrors.phone}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link
            to={`/website-login?redirect=${encodeURIComponent(redirectTo)}${plan ? `&plan=${plan}` : ''}`}
            className={styles.footerLink}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
