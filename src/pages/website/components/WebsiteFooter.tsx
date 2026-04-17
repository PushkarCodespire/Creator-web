import { Link } from 'react-router-dom';
import styles from '../WebsiteHome.module.css';

const LOGO_SRC = "/website/figma/logo1.png";
const LINKEDIN_ICON = "/website/figma/80c543d44aafb9064606e35cf0b8fff0c3f08937.png";
const INSTAGRAM_ICON = "/website/figma/60ed9a79cead92b94beb4b78ba089afdebe7970a.png";

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "Find Expert", to: "/find-expert" },
  { label: "Create Your AI", to: "/create-your-ai" },
  { label: "Pricing", to: "/pricing" },
];

const ADDRESS =
  "25th Floor, Gold Tower, Wave One, 2514, Sector 18, Noida, Uttar Pradesh 201301, India";

function MailIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden className={styles.footerContactIcon}>
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 4l6 4.5L14 4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden className={styles.footerContactIcon}>
      <path d="M14.5 11.5v2a1.5 1.5 0 0 1-1.64 1.5 14.5 14.5 0 0 1-6.3-2.24 14.3 14.3 0 0 1-4.4-4.4A14.5 14.5 0 0 1 .92 2.04 1.5 1.5 0 0 1 2.42.4h2a1.5 1.5 0 0 1 1.5 1.29 9.6 9.6 0 0 0 .52 2.1 1.5 1.5 0 0 1-.34 1.58l-.85.85a11.5 11.5 0 0 0 4.4 4.4l.85-.85a1.5 1.5 0 0 1 1.58-.34 9.6 9.6 0 0 0 2.1.52 1.5 1.5 0 0 1 1.3 1.55z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden className={styles.footerContactIcon}>
      <path d="M13.5 6.8c0 4.2-5.5 8.2-5.5 8.2s-5.5-4-5.5-8.2a5.5 5.5 0 1 1 11 0z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="6.8" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function WebsiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTopRow}>
        <Link to="/create-your-ai" className={styles.footerCtaPrimary}>
          Create your AI
        </Link>
        <Link to="/find-expert" className={styles.footerCtaOutline}>
          Browse Experts
        </Link>
      </div>

      <div className={styles.footerInner}>
        <div className={styles.footerColumns}>
          <div className={styles.footerBrand}>
            <Link to="/" className={styles.footerLogo} aria-label="CreatorPal home">
              <img src={LOGO_SRC} alt="CreatorPal" className={styles.footerLogoImg} />
            </Link>
            <p className={styles.footerTagline}>
              Turn your knowledge into an AI that talks to your audience and earns for you
            </p>
          </div>

          <div>
            <h3 className={styles.footerHeading}>Contact Us</h3>
            <ul className={styles.footerList}>
              <li className={styles.footerContactItem}>
                <MailIcon />
                <a href="mailto:raghav@peakpals.in" className={styles.footerContactText}>raghav@peakpals.in</a>
              </li>
              <li className={styles.footerContactItem}>
                <PhoneIcon />
                <a href="tel:9958092012" className={styles.footerContactText}>9958092012</a>
              </li>
              <li className={styles.footerContactItem}>
                <LocationIcon />
                <span className={styles.footerContactText}>{ADDRESS}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={styles.footerHeading}>Quick Links</h3>
            <ul className={styles.footerList}>
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={styles.footerHeading}>Social</h3>
            <div className={styles.footerSocial}>
              <a href="#linkedin" aria-label="LinkedIn">
                <img src={LINKEDIN_ICON} alt="" width={30} height={30} className={styles.footerSocialImg} />
              </a>
              <a href="#instagram" aria-label="Instagram">
                <img src={INSTAGRAM_ICON} alt="" width={30} height={30} className={styles.footerSocialImg} />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p className={styles.copyright}>&copy; 2026 CreatorPal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
