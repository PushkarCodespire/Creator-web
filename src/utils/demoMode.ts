// ===========================================
// DEMO MODE UTILITIES
// Helper functions for demo mode features
// ===========================================

/**
 * Check if the application is running in demo mode
 * @returns true if VITE_DEMO_MODE environment variable is set to 'true'
 */
export const isDemoMode = (): boolean => {
  return import.meta.env.VITE_DEMO_MODE === 'true';
};

/**
 * Get demo-specific message for a feature
 * @param feature - The feature name (e.g., 'payment', 'email', 'payout')
 * @returns Demo message for that feature
 */
export const getDemoMessage = (feature: string): string => {
  const messages: Record<string, string> = {
    payment: 'Payment processing is simulated in demo mode. In production, this integrates with Razorpay for real payments.',
    email: 'Email sending is disabled in demo mode. All email templates are available in the Admin > Email Preview page.',
    payout: 'Payouts are simulated in demo mode. In production, this integrates with Razorpay X for real bank transfers.',
    openai: 'AI chat is fully functional using OpenAI GPT-4o mini. Responses are real and contextual.',
    default: 'This feature is running in demo mode for demonstration purposes.'
  };

  return messages[feature.toLowerCase()] || messages.default;
};

/**
 * Show a demo tooltip for a specific feature
 * @param feature - The feature name
 * @param element - Optional DOM element to attach tooltip to
 */
export const showDemoTooltip = (feature: string, element?: HTMLElement): void => {
  if (!isDemoMode()) return;

  const message = getDemoMessage(feature);
  console.log(`[DEMO MODE] ${feature}: ${message}`);

  if (element) {
    element.title = `🎬 DEMO MODE: ${message}`;
  }
};

/**
 * Get demo data indicator text
 * @returns Text indicating demo data is being used
 */
export const getDemoDataIndicator = (): string => {
  if (!isDemoMode()) return '';
  return '(Demo Data)';
};

/**
 * Check if demo banner has been dismissed by user
 * @param storageKey - localStorage key for the banner
 * @returns true if banner was dismissed
 */
export const isDemoBannerDismissed = (storageKey = 'demo-mode-banner-dismissed'): boolean => {
  return localStorage.getItem(storageKey) === 'true';
};

/**
 * Reset demo banner dismissal (useful for testing)
 * @param storageKey - localStorage key for the banner
 */
export const resetDemoBanner = (storageKey = 'demo-mode-banner-dismissed'): void => {
  localStorage.removeItem(storageKey);
};

/**
 * Log demo mode info to console
 * Useful for debugging and investor presentations
 */
export const logDemoInfo = (): void => {
  if (!isDemoMode()) return;

  console.log('%c🎬 DEMO MODE ACTIVE', 'background: #ff9800; color: white; font-size: 16px; padding: 10px; font-weight: bold;');
  console.log('%cFeatures Status:', 'font-weight: bold; font-size: 14px;');
  console.log('✅ AI Chat: Fully functional (OpenAI GPT-4o mini)');
  console.log('✅ Database: PostgreSQL with comprehensive demo data');
  console.log('✅ Real-time: Socket.io for live updates');
  console.log('✅ Analytics: Full analytics dashboard with charts');
  console.log('🎬 Payments: Simulated (Razorpay integration ready)');
  console.log('🎬 Emails: Console logs (SendGrid integration ready)');
  console.log('🎬 Payouts: Simulated (Razorpay X integration ready)');
  console.log('\n📊 Demo Data:');
  console.log('   • 50 Creators across 7 categories');
  console.log('   • 200 Users (100 Premium, 100 Free)');
  console.log('   • 1000+ Conversations with realistic messages');
  console.log('   • 50 Brand Opportunities');
  console.log('   • 30 Completed Deals');
  console.log('   • Realistic earnings distribution');
  console.log('\n🔑 Test Accounts:');
  console.log('   Admin:   admin@platform.com / admin123');
  console.log('   User:    user1@test.com / user123 (Premium)');
  console.log('   Creator: ranveer@creator.com / creator123');
  console.log('   Company: tcs-tataconsultancyservices@company.com / company123');
  console.log('\n💡 Tip: Check Admin > Email Preview to see all email templates');
};

// Auto-log demo info when module loads (if in demo mode)
if (isDemoMode()) {
  logDemoInfo();
}
