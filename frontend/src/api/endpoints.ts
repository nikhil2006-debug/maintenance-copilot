import { USE_MOCKS } from '../lib/config'
import { request } from './client'
import type { AnalysisSummary } from './types'
import { mockSummary } from '../mocks/fixtures'

const mockDelay = <T,>(data: T, ms = 400) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(data), ms))

export function getAnalysisSummary(id: string): Promise<AnalysisSummary> {
  if (USE_MOCKS) return mockDelay(mockSummary)
  return request<AnalysisSummary>(`/api/analyses/${id}/summary`)
}