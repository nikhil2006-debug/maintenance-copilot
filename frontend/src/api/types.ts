export type DataSource = 'live' | 'mock'
export type AnalysisStatus = 'queued' | 'running' | 'completed' | 'partial' | 'failed'
export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

export interface Score {
  value: number | null // 0..1, null = unavailable (never 0 for "unknown")
  method: 'model_probability' | 'heuristic'
  validated: boolean // true only if evaluated on a temporal held-out set
  evaluation_ref: string | null // id of the evaluation record that backs "validated"
  confidence: number | null // separate from value; null if not measured
  confidence_kind: 'measured' | 'heuristic' | null
}

export interface Provenance {
  repo: string
  commit_sha: string
  analyzed_at: string
  counts: {
    files: number | null
    modules: number | null
    commits: number | null
    issues: number | null
    contributors: number | null
  }
  unavailable: Record<string, string> // e.g. { issues: "issues_disabled" }
  prediction_target: string
  label_method: string
  split: { type: 'temporal'; cutoff: string; train_n: number; test_n: number } | null
}

export interface AnalysisSummary {
  analysis_id: string
  status: AnalysisStatus
  data_source: DataSource
  generated_at: string
  provenance: Provenance
  high_risk_files: number | null
  avg_bug_risk: Score | null
  avg_debt: Score | null
}