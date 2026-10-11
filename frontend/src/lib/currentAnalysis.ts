import { useSyncExternalStore } from 'react'
import { DEMO_ANALYSIS_ID, USE_MOCKS } from './config'

const KEY = 'mc.currentAnalysisId'
const listeners = new Set<() => void>()

function read(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function setCurrentAnalysisId(id: string) {
  try {
    localStorage.setItem(KEY, id)
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l())
}

export function useCurrentAnalysisId(): string | null {
  const stored = useSyncExternalStore(subscribe, read, () => null)
  // A leftover mock id must never be sent to a real backend
  if (!USE_MOCKS && stored === DEMO_ANALYSIS_ID) return null
  return stored ?? (USE_MOCKS ? DEMO_ANALYSIS_ID : null)
}