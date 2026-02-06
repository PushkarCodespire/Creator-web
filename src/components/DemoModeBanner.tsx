// ===========================================
// DEMO MODE BANNER COMPONENT
// Displays a dismissible banner indicating the platform is in demo mode
// ===========================================

import { Alert } from 'antd';
import { useState, useEffect } from 'react';

interface DemoModeBannerProps {
  message?: string;
  storageKey?: string;
}

const DemoModeBanner = ({
  message = '🎬 DEMO MODE - Payments, emails, and payouts are simulated for demonstration purposes. All features are fully functional for local testing.',
  storageKey = 'demo-mode-banner-dismissed'
}: DemoModeBannerProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const isDismissed = localStorage.getItem(storageKey) === 'true';

    // Check if DEMO_MODE is enabled (via environment variable)
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

    // Show banner if demo mode is enabled and not dismissed
    if (isDemoMode && !isDismissed) {
      setVisible(true);
    }
  }, [storageKey]);

  const handleClose = () => {
    // Hide banner and store dismissal in localStorage
    setVisible(false);
    localStorage.setItem(storageKey, 'true');
  };

  if (!visible) return null;

  return (
    <Alert
      message={message}
      type="warning"
      banner
      closable
      onClose={handleClose}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        textAlign: 'center',
        fontWeight: 500,
        borderRadius: 0
      }}
    />
  );
};

export default DemoModeBanner;
