// ===========================================
// URL DETECTOR UTILITY
// ===========================================

/**
 * Detects URLs in text
 * @param text - The text to search for URLs
 * @returns Array of detected URLs
 */
export const detectUrls = (text: string): string[] => {
  if (!text) return [];

  // URL regex pattern
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlPattern);

  return matches || [];
};

/**
 * Checks if a string is a valid URL
 * @param string - The string to check
 * @returns boolean
 */
export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Extracts the first URL from text
 * @param text - The text to search
 * @returns First URL found or null
 */
export const extractFirstUrl = (text: string): string | null => {
  const urls = detectUrls(text);
  return urls.length > 0 ? urls[0] : null;
};
