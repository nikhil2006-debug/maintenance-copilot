# API Contract v0.1 (DRAFT)

## Conventions
- All responses include `data_source` ("live" | "mock") and `generated_at` (ISO 8601).
- Unavailable values are `null` plus a reason in `provenance.unavailable`. Never 0.
- Errors use FastAPI's shape: `{ "detail": "message" }`.
- Analysis is asynchronous: POST returns an id; the client polls.

## Enums
- Analysis status: queued | running | completed | partial | failed
  (partial = an agent failed but the orchestrator still produced a result)
- Agent status: pending | running | completed | failed | skipped
- Risk level / severity / priority / trend: defined by Member 1 in metric-definitions.md

## Score semantics
- `value`: float 0..1 or null.
- `method`: "model_probability" = trained classifier output; "heuristic" = rule-based formula.
- `validated`: true ONLY IF the model was evaluated on a temporal held-out set and the
  metrics are retrievable via `evaluation_ref`. Heuristics are always false.
- `confidence`: separate from `value`. A predicted probability is NOT confidence.
  Non-null only if measured (e.g. calibration or ensemble agreement), else null.
- `label_method` must say what was actually implemented (e.g. "keyword-based bug-fix
  commit heuristic"), and only say "SZZ" if SZZ was actually implemented.

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| POST | /api/analyses | body {repo_url} → {analysis_id} |
| GET | /api/analyses | history list |
| GET | /api/analyses/{id} | status, progress, per-agent status, errors |
| GET | /api/analyses/{id}/summary | provenance, counts, headline scores |
| GET | /api/analyses/{id}/files | paginated, sortable, filterable file risk |
| GET | /api/analyses/{id}/files/{path} | metrics, evidence, factors |
| GET | /api/analyses/{id}/agents | findings, evidence, conflicts, agent_errors |
| GET | /api/analyses/{id}/evolution | bug evolution timeline |
| GET | /api/analyses/{id}/debt | debt indicators, heatmap, trend |
| GET | /api/analyses/{id}/recommendations | ranked actions with explanations |
| GET | /api/analyses/{id}/evaluation | metrics, baseline comparison, timings |
| POST | /api/analyses/{id}/feedback | {target_type, target_id, verdict, comment} |
| POST | /api/analyses/{id}/reanalyze | triggers a new analysis |
| GET | /api/analyses/{id}/compare/{other_id} | deltas between analyses |

Sample `/summary` response: see `frontend/src/mocks/fixtures.ts` (synthetic).