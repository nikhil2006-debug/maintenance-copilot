import { USE_MOCKS } from '../lib/config'
import { request } from './client'
import type { AnalysisStatusResponse, AnalysisSummary, CreateAnalysisResponse } from './types'
import { getMockStatus, mockSummary, startMockRun } from '../mocks/fixtures'

const mockDelay = <T,>(data: T, ms = 400) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(data), ms))

export function createAnalysis(repoUrl: string): Promise<CreateAnalysisResponse> {
  if (USE_MOCKS) {
    startMockRun()
    return mockDelay({ analysis_id: 'demo', status: 'queued' as const })
  }
  return request<CreateAnalysisResponse>('/api/analyses', {
    method: 'POST',
    body: JSON.stringify({ repo_url: repoUrl }),
  })
}

export function getAnalysisStatus(id: string): Promise<AnalysisStatusResponse> {
  if (USE_MOCKS) return mockDelay(getMockStatus(), 150)
  return request<AnalysisStatusResponse>(`/api/analyses/${id}`)
}

export function getAnalysisSummary(id: string): Promise<AnalysisSummary> {
  if (USE_MOCKS) return mockDelay(mockSummary)
  return request<AnalysisSummary>(`/api/analyses/${id}/summary`)
}