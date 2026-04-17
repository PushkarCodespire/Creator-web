/**
 * Runtime configuration for the website chat feature.
 * All values come from VITE_* env vars baked into the client bundle at build time.
 */

export const CHAT_CONFIG = {
  /** Base URL of the creator-platform backend. Empty = demo mode. */
  apiUrl: (import.meta.env.VITE_CREATOR_API_URL || "").replace(/\/$/, ""),

  /** How many AI responses a visitor gets before the subscription wall. */
  freeTrialLimit: 5,

  /** Optional per-creator backend UUIDs. Key = creator slug. */
  creatorBackendIds: {
    raghav: import.meta.env.VITE_CHAT_ID_RAGHAV || "",
    krishansh: import.meta.env.VITE_CHAT_ID_KRISHANSH || "",
    ravya: import.meta.env.VITE_CHAT_ID_RAVYA || "",
  } as Record<string, string>,
} as const;

export function isChatWiredUp(): boolean {
  return Boolean(CHAT_CONFIG.apiUrl);
}

export function getBackendIdForSlug(slug: string): string {
  return CHAT_CONFIG.creatorBackendIds[slug] || "";
}
