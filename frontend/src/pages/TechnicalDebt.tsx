import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Skeleton from '../components/ui/Skeleton'
import { getAgents } from '../api/endpoints'
import type { AgentFinding } from '../api/types'
import { useCurrentAnalysisId } from '../lib/currentAnalysis'

const num = (v: string | number | null | undefined) =>
  typeof v === 'number' ? v.toLocaleString() : 'Unavailable'

export default function TechnicalDebt() {
  const id = useCurrentAnalysisId()
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['agents', id],
    queryFn: () => getAgents(id as string),
    enabled: id !== null,
  })

  const debt = data?.agents.find((a) => a.agent === 'technical_debt')
  const findings = (debt?.findings ?? []) as AgentFinding[]
  const rule = findings[0]?.evidence.rule

  return (
    <PageShell
      title="Technical debt"
      description="Files with large changes per commit spread across several authors. A churn-based proxy, not a measured debt score."
    >
      {id === null && (
        <EmptyState
          title="No analysis yet"
          description="Submit a GitHub repository to see its results here."
          action={
            <Link to="/new" className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400">
              Start an analysis
            </Link>
          }
        />
      )}

      {id !== null && isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
        </div>
      )}

      {isError && <ErrorState message={(error as Error).message} onRetry={() => refetch()} />}

      {data && !debt && (
        <EmptyState title="Technical debt agent did not report" description="No result for this agent in this analysis." />
      )}

      {data && debt && debt.status !== 'completed' && (
        <EmptyState
          title="Technical debt not computed"
          description={debt.error ?? 'The agent did not complete, so no value is shown.'}
        />
      )}

      {data && debt && debt.status === 'completed' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={data.data_source === 'live' ? 'success' : 'warning'}>
              {data.data_source === 'live' ? 'Live analysis' : 'Sample data'}
            </Badge>
            <Badge tone="warning">Heuristic indicator</Badge>
            <Badge tone="neutral">Rule-based agent</Badge>
          </div>

          <Card>
            <div className="text-sm font-medium text-white">How this was computed</div>
            <p className="mt-2 text-sm text-slate-400">
              {debt.note ?? 'Proxy indicator from churn and author spread.'} Complexity, test coverage and
              code-smell data were not analysed, and this is not a validated measure of technical debt.
            </p>
            {typeof rule === 'string' && (
              <p className="mt-2 text-xs text-slate-500">Rule: {rule}. Showing at most the top 15 files.</p>
            )}
          </Card>

          {findings.length === 0 ? (
            <EmptyState
              title="No files met the rule"
              description="This means no file passed the thresholds above, not that the repository has no debt."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">File</th>
                    <th className="px-4 py-3">Churn / commit</th>
                    <th className="px-4 py-3">Commits</th>
                    <th className="px-4 py-3">Authors</th>
                  </tr>
                </thead>
                <tbody>
                  {findings.map((f, i) => (
                    <tr key={f.file} className="border-t border-slate-800 align-top">
                      <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{f.file}</div>
                        <div className="mt-1 text-xs text-slate-400">{f.summary}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-200">{num(f.evidence.churn_per_commit)}</td>
                      <td className="px-4 py-3 text-slate-200">{num(f.evidence.commits)}</td>
                      <td className="px-4 py-3 text-slate-200">{num(f.evidence.contributors)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </PageShell>
  )
}