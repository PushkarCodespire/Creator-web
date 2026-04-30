/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_UPLOAD_PUBLIC_PATH?: string;
  readonly VITE_SOCKET_URL?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
