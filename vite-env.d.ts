interface ImportMetaEnv {
  readonly VITE_BE_URL: string;
  readonly VITE_DEFAULT_AVATAR: string;
  readonly VITE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

