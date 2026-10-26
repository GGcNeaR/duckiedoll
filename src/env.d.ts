/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** optional override; defaults to the streams.json deployed with the site */
  readonly VITE_STREAMS_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
