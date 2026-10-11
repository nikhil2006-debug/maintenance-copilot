import type { AgentStatus, AnalysisStatusResponse, AnalysisSummary } from '../api/types'

export const mockSummary: AnalysisSummary = {
  analysis_id: 'demo',
  status: 'completed',
  data_source: 'mock',
  generated_at: '2026-10-10T00:00:00Z',
  provenance: {
    repo: 'sample/demo-repo (SYNTHETIC)',
    commit_sha: '0000000',
    analyzed_at: '2026-10-10T00:00:00Z',
    counts: { files: 12, modules: 4, commits: 30, issues: null, contributors: 3 },
    unavailable: { issues: 'issues_disabled' },
    prediction_target: 'SAMPLE: not a real prediction target',
    label_method: 'SAMPLE: not a real label method',
    split: null,
  },
  high_risk_files: 2,
  avg_bug_risk: {
    value: 0.31, method: 'heuristic', validated: false,
    evaluation_ref: null, confidence: null, confidence_kind: null,
  },
  avg_debt: {
    value: 0.22, method: 'heuristic', validated: false,
    evaluation_ref: null, confidence: null, confidence_kind: null,
  },
}
const MOCK_AGENTS = [
  'bug_analysis',
  'bug_evolution',
  'technical_debt',
  'recommendation',
  'orchestrator',
]
const STEP_MS = 1600

let mockStartedAt = 0

export function startMockRun() {
  mockStartedAt = Date.now()
}

export function getMockStatus(): AnalysisStatusResponse {
  const elapsed = mockStartedAt === 0 ? Infinity : Date.now() - mockStartedAt
  const total = MOCK_AGENTS.length * STEP_MS
  const done = elapsed >= total
  const now = new Date().toISOString()
  return {
    analysis_id: 'demo',
    status: done ? 'completed' : 'running',
    data_source: 'mock',
    generated_at: now,
    repo_url: 'https://github.com/sample/demo-repo',
    progress: done ? 1 : elapsed / total,
    stage: done ? 'Finished' : 'Simulated run',
    agents: MOCK_AGENTS.map((agent, i) => {
      let status: AgentStatus = 'pending'
      if (elapsed >= (i + 1) * STEP_MS) status = 'completed'
      else if (elapsed >= i * STEP_MS) status = 'running'
      return { agent, status, started_at: null, finished_at: null, error: null }
    }),
    error: null,
  }
}