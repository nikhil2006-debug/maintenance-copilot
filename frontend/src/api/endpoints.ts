import { USE_MOCKS } from '../lib/config'
import { request } from './client'
import { getMockStatus, mockSummary, startMockRun } from '../mocks/fixtures'
import type {
  AgentsResponse,
  AnalysisStatusResponse,
  AnalysisSummary,
  CreateAnalysisResponse,
  FilesResponse,
} from './types'

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

export function getFiles(id: string): Promise<FilesResponse> {
  if (USE_MOCKS) {
    return mockDelay({
      analysis_id: 'demo',
      data_source: 'mock' as const,
      total: 1,
      items: [
        {
          path: 'SAMPLE/not-real-file.py',
          commits: 0,
          churn: 0,
          contributors: 0,
          bugfix_commits: 0,
          last_modified: null,
          bug_risk: {
            value: null,
            method: 'heuristic' as const,
            validated: false,
            evaluation_ref: null,
            confidence: null,
            confidence_kind: null,
          },
        },
      ],
    })
  }
  return request<FilesResponse>(`/api/analyses/${id}/files`)
}

export function getAgents(id: string): Promise<AgentsResponse> {
  if (USE_MOCKS) {
    return mockDelay({
      analysis_id: 'demo',
      data_source: 'mock' as const,
      generated_at: new Date().toISOString(),
      agents: [],
      orchestrator: { conflicts: [], agent_errors: [] },
      recommendations: [],
    })
  }
  return request<AgentsResponse>(`/api/analyses/${id}/agents`)
}