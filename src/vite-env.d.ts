/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the Star Wars API. See .env.example. */
  readonly VITE_SWAPI_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
