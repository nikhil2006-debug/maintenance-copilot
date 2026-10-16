import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Skeleton from '../components/ui/Skeleton'
import StatusBadge from '../components/ui/StatusBadge'
import { getAgents } from '../api/endpoints'
import type { AgentFinding } from '../api/types'
import { useCurrentAnalysisId } from '../lib/currentAnalysis'

const SHOWS_FINDINGS = ['bug_analysis', 'technical_debt']

export default function AgentPipeline() {
  const id = useCurrentAnalysisId()
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['agents', id],
    queryFn: () => getAgents(id as string),
    enabled: id !== null,
  })

  return (
    <PageShell
      title="Agent pipeline"
      description="Rule-based agents and an orchestrator that merges their findings. No LLM is involved."
    >
      {id === null && (
        <EmptyState
          title="No analysis yet"
          action={<Link to="/new" className="rounded-md bg-indigo-500 px-4 py-2 text-sm text-white">Start an analysis</Link>}
        />
      )}
      {id !== null && isLoading && <Skeleton className="h-64" />}
      {isError && <ErrorState message={(error as Error).message} onRetry={() => refetch()} />}

      {data && data.agents.length === 0 && (
        <EmptyState title="No agent output" description="This response contained no agents." />
      )}

      {data && data.agents.length > 0 && (
        <div className="space-y-4">
          {data.agents.map((a) => (
            <Card key={a.agent}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold capitalize text-white">{a.agent.replace(/_/g, ' ')}</h2>
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">{a.method}</Badge>
                  <StatusBadge status={a.status} />
                </div>
              </div>
              {a.note && <p className="mt-2 text-xs text-slate-400">{a.note}</p>}
              {a.error && <p className="mt-2 text-xs text-amber-300">{a.error}</p>}
              <p className="mt-2 text-xs text-slate-400">{a.findings.length} finding(s)</p>

              {SHOWS_FINDINGS.includes(a.agent) && a.findings.length > 0 && (
                <ul className="mt-3 divide-y divide-slate-800">
                  {(a.findings as AgentFinding[]).map((f) => (
                    <li key={f.file} className="py-2">
                      <div className="break-all text-sm text-slate-100">{f.file}</div>
                      <div className="text-xs text-slate-300">{f.summary}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {Object.entries(f.evidence).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}

          <Card>
            <h2 className="text-sm font-semibold text-white">Orchestrator: conflicts and errors</h2>
            {data.orchestrator.conflicts.length === 0 && data.orchestrator.agent_errors.length === 0 ? (
              <p className="mt-2 text-xs text-slate-400">No conflicts or agent errors reported.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-xs text-slate-300">
                {data.orchestrator.conflicts.map((c) => (
                  <li key={c.file}>
                    <span className="break-all text-slate-100">{c.file}</span>: {c.description} Resolution: {c.resolution}
                  </li>
                ))}
                {data.orchestrator.agent_errors.map((e) => (
                  <li key={e.agent} className="text-red-300">{e.agent}: {e.message}</li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </PageShell>
  )
}