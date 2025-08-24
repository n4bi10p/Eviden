/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APTOS_NETWORK: string;
  readonly VITE_CONTRACT_ADDRESS: string;
  readonly VITE_ENABLE_PWA: string;
  readonly VITE_ENABLE_NOTIFICATIONS: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_DEV_MODE: string;
  readonly VITE_LOG_LEVEL: string;
  readonly VITE_MAPBOX_ACCESS_TOKEN: string;
  readonly VITE_VAPID_PUBLIC_KEY: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_DESCRIPTION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
