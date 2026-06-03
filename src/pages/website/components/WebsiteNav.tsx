import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useRef, useEffect } from 'react';
import { RootState, AppDispatch } from '../../../store';
import { logout, fetchCurrentUser } from '../../../store/slices/authSlice';
import styles from '../WebsiteHome.module.css';

const LOGO_SRC = "/website/figma/Maskgroup3.png";

function UserIcon() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden>
      <circle cx="10" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 18c0-3.3 3.6-6 8-6s8 2.7 8 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function WebsiteNav() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    setMenuClosing(true);
    setTimeout(() => {
      setMenuOpen(false);
      setMenuClosing(false);
    }, 220);
  };

  // Fetch user if authenticated but user data is missing (stale localStorage)
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (isAuthenticated && !user && !fetchedRef.current) {
      fetchedRef.current = true;
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, user, dispatch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  return (
    <>
    <header className={styles.nav}>
      <div className={styles.navInner}>
        <div />
        <Link to="/" className={styles.logo}>
          <img src={LOGO_SRC} alt="CreatorPal" className={styles.logoImg} />
        </Link>
        {/* Hamburger — only visible on mobile via CSS; becomes × when open */}
        <button
          type="button"
          className={`${styles.hamburger}${menuOpen ? ` ${styles.hamburgerOpen}` : ''}`}
          onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span /><span /><span />
        </button>
        <nav className={styles.navLinks}>
          <Link to="/about">About</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/become-creator" style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '8px 16px', borderRadius: 8,
            background: '#111', color: '#fff',
            fontSize: 13, fontWeight: 600,
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            Apply as a creator
          </Link>
          {isAuthenticated ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--card-cream)',
                  border: '1px solid var(--line)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--ink)',
                  transition: 'background 120ms ease',
                }}
                aria-label="User menu"
              >
                <UserIcon />
              </button>
              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px -8px rgba(0,0,0,0.15)',
                  minWidth: 180,
                  padding: '8px 0',
                  zIndex: 50,
                }}>
                  <Link
                    to="/user/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{ display: 'block', padding: '10px 16px', borderBottom: '1px solid #f3f4f6', textDecoration: 'none', transition: 'background 120ms ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{user?.name || 'Profile'}</div>
                    {user?.email && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{user.email}</div>}
                  </Link>
                  {user?.role === 'CREATOR' && (
                    <Link
                      to="/creator-dashboard"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontSize: 14,
                        color: '#111827',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        background: 'none',
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background 120ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      Dashboard
                    </Link>
                  )}
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin/home-page"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontSize: 14,
                        color: '#111827',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        background: 'none',
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background 120ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => { dispatch(logout()); setDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: 14,
                      color: '#ef4444',
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      transition: 'background 120ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">Sign in</Link>
          )}
          {/* Create your AI CTA hidden — not ready for public users yet
          <Link to="/create-your-ai" className={styles.navCta}>
            Create your AI
          </Link>
          */}
        </nav>
      </div>
    </header>

    {/* Mobile menu — slides in below sticky nav */}
    {menuOpen && (
      <div className={`${styles.navMobileMenu}${menuClosing ? ` ${styles.navMobileMenuClosing}` : ''}`}>
        <Link to="/about"           className={styles.navMobileLink} onClick={closeMenu}>About</Link>
        <Link to="/pricing"         className={styles.navMobileLink} onClick={closeMenu}>Pricing</Link>
        <Link to="/become-creator"  className={styles.navMobileLink} onClick={closeMenu}>Apply as a creator</Link>
        {isAuthenticated ? (
          <>
            <Link to="/user/profile" className={styles.navMobileLink} onClick={closeMenu}>Profile</Link>
            {user?.role === 'CREATOR' && (
              <Link to="/creator-dashboard" className={styles.navMobileLink} onClick={closeMenu}>Dashboard</Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link to="/admin/home-page" className={styles.navMobileLink} onClick={closeMenu}>Admin</Link>
            )}
            <button
              type="button"
              className={styles.navMobileLink}
              onClick={() => { dispatch(logout()); closeMenu(); }}
              style={{ color: '#ef4444' }}
            >
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" className={styles.navMobileCta} onClick={closeMenu}>Sign in</Link>
        )}
      </div>
    )}
    </>
  );
}
