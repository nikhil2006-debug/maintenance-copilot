import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Skeleton from '../components/ui/Skeleton'
import { getFiles } from '../api/endpoints'
import { useCurrentAnalysisId } from '../lib/currentAnalysis'
import { fmtScore } from '../lib/format'

type SortKey = 'risk' | 'commits' | 'churn' | 'bugfix' | 'contributors'
const PAGE = 100

function tone(v: number | null) {
  if (v === null) return 'neutral' as const
  if (v >= 0.7) return 'danger' as const // matches the backend's high-risk threshold
  if (v >= 0.4) return 'warning' as const // display choice only
  return 'success' as const
}

export default function FileRisk() {
  const id = useCurrentAnalysisId()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('risk')
  const [minRisk, setMinRisk] = useState(0)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['files', id],
    queryFn: () => getFiles(id as string),
    enabled: id !== null,
  })

  const rows = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    const key = (f: (typeof data.items)[number]) =>
      sort === 'risk' ? f.bug_risk.value ?? -1
      : sort === 'commits' ? f.commits
      : sort === 'churn' ? f.churn
      : sort === 'bugfix' ? f.bugfix_commits
      : f.contributors
    return data.items
      .filter((f) => (q ? f.path.toLowerCase().includes(q) : true))
      .filter((f) => (f.bug_risk.value ?? 0) >= minRisk)
      .sort((a, b) => key(b) - key(a))
  }, [data, search, sort, minRisk])

  return (
    <PageShell
      title="File risk"
      description="Per-file heuristic ranking from commit history. Not a validated prediction."
    >
      {id === null && (
        <EmptyState
          title="No analysis yet"
          action={<Link to="/new" className="rounded-md bg-indigo-500 px-4 py-2 text-sm text-white">Start an analysis</Link>}
        />
      )}
      {id !== null && isLoading && <Skeleton className="h-64" />}
      {isError && <ErrorState message={(error as Error).message} onRetry={() => refetch()} />}

      {data && (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="text-xs uppercase tracking-wide text-slate-400">Search path</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. core.py"
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-slate-400">Sort by</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                >
                  <option value="risk">Risk score</option>
                  <option value="commits">Commits</option>
                  <option value="churn">Churn</option>
                  <option value="bugfix">Bug-fix commits</option>
                  <option value="contributors">Contributors</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-slate-400">Min risk</label>
                <select
                  value={minRisk}
                  onChange={(e) => setMinRisk(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                >
                  <option value={0}>All</option>
                  <option value={0.4}>0.4+</option>
                  <option value={0.7}>0.7+ (high)</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="text-xs text-slate-400">
            Showing {Math.min(rows.length, PAGE)} of {rows.length} matching files ({data.total} total)
          </div>

          {rows.length === 0 ? (
            <EmptyState title="No files match" description="Try clearing the search or filter." />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-3 py-2">File</th>
                    <th className="px-3 py-2">Risk</th>
                    <th className="px-3 py-2">Commits</th>
                    <th className="px-3 py-2">Churn</th>
                    <th className="px-3 py-2">Authors</th>
                    <th className="px-3 py-2">Bug-fix commits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {rows.slice(0, PAGE).map((f) => (
                    <tr key={f.path} className="hover:bg-slate-900/60">
                      <td className="max-w-md break-all px-3 py-2 text-slate-100">{f.path}</td>
                      <td className="px-3 py-2">
                        <Badge tone={tone(f.bug_risk.value)}>{fmtScore(f.bug_risk.value)}</Badge>
                      </td>
                      <td className="px-3 py-2">{f.commits}</td>
                      <td className="px-3 py-2">{f.churn.toLocaleString()}</td>
                      <td className="px-3 py-2">{f.contributors}</td>
                      <td className="px-3 py-2">{f.bugfix_commits}</td>
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