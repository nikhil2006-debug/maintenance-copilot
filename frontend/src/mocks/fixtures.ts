import type { AnalysisSummary } from '../api/types'

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