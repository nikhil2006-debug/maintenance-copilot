export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8000'

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

// Temporary until the New Analysis page exists (Phase 2)
export const DEMO_ANALYSIS_ID = 'demo'