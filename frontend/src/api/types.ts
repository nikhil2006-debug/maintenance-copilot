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
export interface AgentProgress {
  agent: string
  status: AgentStatus
  started_at: string | null
  finished_at: string | null
  error: string | null
}

export interface AnalysisStatusResponse {
  analysis_id: string
  status: AnalysisStatus
  data_source: DataSource
  generated_at: string
  repo_url: string
  progress: number | null // 0..1, null if unknown
  stage: string | null
  agents: AgentProgress[]
  error: string | null
}

export interface CreateAnalysisResponse {
  analysis_id: string
  status: AnalysisStatus
}
export interface FileItem {
  path: string
  commits: number
  churn: number
  contributors: number
  bugfix_commits: number
  last_modified: string | null
  bug_risk: Score
}

export interface FilesResponse {
  analysis_id: string
  data_source: DataSource
  total: number
  items: FileItem[]
}

export interface AgentFinding {
  file: string
  summary: string
  evidence: Record<string, string | number | null>
}

export interface Recommendation {
  file: string
  rank: number
  risk: number | null
  actions: string[]
  flagged_by: string[]
}

export interface AgentReport {
  agent: string
  status: AgentStatus
  method: string
  findings: unknown[]
  note?: string
  error?: string
}

export interface Conflict {
  file: string
  agents: string[]
  description: string
  resolution: string
}

export interface AgentsResponse {
  analysis_id: string
  data_source: DataSource
  generated_at: string
  agents: AgentReport[]
  orchestrator: { conflicts: Conflict[]; agent_errors: { agent: string; message: string }[] }
  recommendations: Recommendation[]
}
export interface AnalysisListItem {
  analysis_id: string
  repo_url: string
  status: AnalysisStatus
  created_at: string
  total_commits: number | null
  files: number | null
}

export interface AnalysisListResponse {
  items: AnalysisListItem[]
}

export type FeedbackVerdict = 'useful' | 'not_useful'

export interface FeedbackItem {
  file: string
  verdict: FeedbackVerdict
}

export interface FeedbackResponse {
  analysis_id: string
  items: FeedbackItem[]
}