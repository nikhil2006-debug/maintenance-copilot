import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import PageShell from '../components/layout/PageShell'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Skeleton from '../components/ui/Skeleton'
import { getAgents, getEvolution } from '../api/endpoints'
import type { AgentFinding } from '../api/types'
import { useCurrentAnalysisId } from '../lib/currentAnalysis'

const pct = (v: number | null) => (v === null ? 'Unavailable' : `${Math.round(v * 100)}%`)

export default function BugEvolution() {
  const id = useCurrentAnalysisId()

  const evo = useQuery({
    queryKey: ['evolution', id],
    queryFn: () => getEvolution(id as string),
    enabled: id !== null,
  })
  const agents = useQuery({
    queryKey: ['agents', id],
    queryFn: () => getAgents(id as string),
    enabled: id !== null,
  })

  const agent = agents.data?.agents.find((a) => a.agent === 'bug_evolution')
  const finding = ((agent?.findings ?? []) as AgentFinding[])[0]
  const months = evo.data?.months ?? []

  return (
    <PageShell
      title="Bug evolution"
      description="Bug-fix commits per month. Counts use a commit-message keyword heuristic, not SZZ, and are not a forecast."
    >
      {id === null && (
        <EmptyState
          title="No analysis yet"
          description="Submit a GitHub repository to see its history here."
          action={
            <Link to="/new" className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400">
              Start an analysis
            </Link>
          }
        />
      )}

      {id !== null && evo.isLoading && <Skeleton className="h-64" />}
      {evo.isError && <ErrorState message={(evo.error as Error).message} onRetry={() => evo.refetch()} />}

      {evo.data && months.length === 0 && (
        <EmptyState
          title="No monthly data for this analysis"
          description={`This analysis has no monthly counts (${evo.data.unavailable_reason ?? 'unknown'}). Re-run it from the New analysis page.`}
        />
      )}

      {evo.data && months.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={evo.data.data_source === 'live' ? 'success' : 'warning'}>
              {evo.data.data_source === 'live' ? 'Live analysis' : 'Sample data'}
            </Badge>
            <Badge tone="warning">Heuristic indicator</Badge>
            <Badge tone="neutral">Rule-based agent</Badge>
          </div>

          {agent && (
            <Card>
              <div className="text-sm font-medium text-white">Bug Evolution agent</div>
              {agent.status === 'completed' && finding ? (
                <>
                  <p className="mt-2 text-sm text-slate-200">{finding.summary}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Rule: {String(finding.evidence.rule)}. {agent.note}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-400">
                  Not computed: {agent.error ?? 'the agent did not complete.'}
                </p>
              )}
            </Card>
          )}

          <Card>
            <div className="text-sm font-medium text-white">Commits per month (source files only)</div>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={months}>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  <Bar dataKey="commits" name="All commits" fill="#6366f1" />
                  <Bar dataKey="bugfix_commits" name="Bug-fix commits" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Only commits that touched at least one source file are counted (docs, changelogs and config are excluded).
              The oldest month may be partial, and months with few commits are noisy.
            </p>
          </Card>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Commits</th>
                  <th className="px-4 py-3">Bug-fix commits</th>
                  <th className="px-4 py-3">Bug-fix share</th>
                </tr>
              </thead>
              <tbody>
                {months.map((m) => (
                  <tr key={m.month} className="border-t border-slate-800">
                    <td className="px-4 py-3 text-white">{m.month}</td>
                    <td className="px-4 py-3 text-slate-200">{m.commits.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-200">{m.bugfix_commits.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-200">{pct(m.bugfix_share)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageShell>
  )
}