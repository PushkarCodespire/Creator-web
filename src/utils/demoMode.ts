// ===========================================
// DEMO MODE UTILITIES
// Helper functions for demo mode features
// ===========================================

import { logger } from './logger';

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
  logger.info(`[DEMO MODE] ${feature}: ${message}`);

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

  logger.info('DEMO MODE ACTIVE');
  logger.info('Features: AI Chat, Database, Real-time, Analytics all functional');
  logger.info('Simulated: Payments, Emails, Payouts');
  logger.info('Demo Data: 50 Creators, 200 Users, 1000+ Conversations, 50 Opportunities, 30 Deals');
};

// Auto-log demo info when module loads (if in demo mode)
if (isDemoMode()) {
  logDemoInfo();
}
