// Global type declarations for import.meta and assets

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  // === CANONICAL (NEXT_PUBLIC_*) - Use these ===
  readonly NEXT_PUBLIC_SUPABASE_URL: string;
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  readonly NEXT_PUBLIC_MAPBOX_TOKEN: string;
  readonly NEXT_PUBLIC_API_BASE_URL: string;
  readonly NEXT_PUBLIC_BASE_URL: string;
  readonly NEXT_PUBLIC_INVITE_ONLY: string;
  readonly NEXT_PUBLIC_APP_VERSION: string;
  readonly NEXT_PUBLIC_ANNOUNCE_ENABLED: string;
  readonly NEXT_PUBLIC_ANNOUNCE_TEXT: string;
  readonly NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID: string;
  readonly NEXT_PUBLIC_STATUS_ENABLED: string;
  readonly NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;

  // === LEGACY (VITE_*) - Deprecated, kept for backward compatibility ===
  /** @deprecated Use NEXT_PUBLIC_SUPABASE_URL */
  readonly VITE_SUPABASE_URL: string;
  /** @deprecated Use NEXT_PUBLIC_SUPABASE_ANON_KEY */
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** @deprecated Use NEXT_PUBLIC_SUPABASE_ANON_KEY */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  /** @deprecated Use NEXT_PUBLIC_MAPBOX_TOKEN */
  readonly VITE_MAPBOX_TOKEN: string;
  /** @deprecated Use NEXT_PUBLIC_API_BASE_URL */
  readonly VITE_API_BASE_URL: string;
  /** @deprecated Use NEXT_PUBLIC_BASE_URL */
  readonly VITE_BASE_URL: string;
  /** @deprecated Use NEXT_PUBLIC_APP_VERSION */
  readonly VITE_APP_VERSION: string;
  /** @deprecated Use NEXT_PUBLIC_ANNOUNCE_ENABLED */
  readonly VITE_ANNOUNCE_ENABLED: string;
  /** @deprecated Use NEXT_PUBLIC_ANNOUNCE_TEXT */
  readonly VITE_ANNOUNCE_TEXT: string;
  /** @deprecated Use NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID */
  readonly VITE_GOOGLE_WEB_CLIENT_ID: string;
  /** @deprecated Use NEXT_PUBLIC_STATUS_ENABLED */
  readonly VITE_STATUS_ENABLED: string;
  /** @deprecated Use NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY */
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;

  // === Internal / Server-side ===
  readonly DEV: boolean;
  readonly JE_MOCK: string;
  readonly RESEND_API_KEY: string;
  readonly JE_SHAW_API_URL: string;
  readonly JE_SHAW_API_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
