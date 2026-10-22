import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Skeleton from '../components/ui/Skeleton'
import { getAnalysisSummary } from '../api/endpoints'
import { fmtCount, fmtDate } from '../lib/format'
import { useCurrentAnalysisId } from '../lib/currentAnalysis'

type CountKey = 'files' | 'modules' | 'commits' | 'issues' | 'contributors'

const SOURCES: { key: CountKey; label: string; note: string }[] = [
  { key: 'commits', label: 'Git commit history', note: 'Last 1,000 commits of the default branch.' },
  { key: 'files', label: 'Files with history', note: 'Source files only; docs, changelogs, config, binary and lock files are skipped.' },
  { key: 'contributors', label: 'Contributors', note: 'Counted per file; no repository-wide total.' },
  { key: 'modules', label: 'Modules', note: 'No module detection is implemented.' },
  { key: 'issues', label: 'Issue tracker', note: 'Issues are not fetched from GitHub.' },
]

const NOT_USED = [
  'Static analysis (complexity, code smells) and test coverage',
  'Issue and pull-request data',
  'A trained machine-learning model',
  'LLM-based agents',
]

export default function DataSources() {
  const id = useCurrentAnalysisId()
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['summary', id],
    queryFn: () => getAnalysisSummary(id as string),
    enabled: id !== null,
  })

  return (
    <PageShell
      title="Data sources"
      description="What this analysis collected, and what it did not."
    >
      {id === null && (
        <EmptyState
          title="No analysis yet"
          description="Submit a GitHub repository to see its data sources here."
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

      {data && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={data.data_source === 'live' ? 'success' : 'warning'}>
              {data.data_source === 'live' ? 'Live analysis' : 'Sample data'}
            </Badge>
          </div>

          <Card>
            <div className="text-sm font-medium text-white">Analysed repository</div>
            <dl className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
              <div>
                <dt className="text-xs uppercase text-slate-500">Repository</dt>
                <dd className="break-all text-slate-200">{data.provenance.repo}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Commit</dt>
                <dd className="break-all font-mono text-xs text-slate-200">{data.provenance.commit_sha}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Analysed at</dt>
                <dd className="text-slate-200">{fmtDate(data.provenance.analyzed_at)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-slate-500">{data.provenance.label_method}</p>
          </Card>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {SOURCES.map((s) => {
                  const value = data.provenance.counts[s.key]
                  const reason = data.provenance.unavailable[s.key]
                  return (
                    <tr key={s.key} className="border-t border-slate-800 align-top">
                      <td className="px-4 py-3 font-medium text-white">{s.label}</td>
                      <td className="px-4 py-3">
                        <Badge tone={value === null ? 'warning' : 'success'}>
                          {value === null ? 'Unavailable' : 'Collected'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-200">{fmtCount(value)}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {s.note}
                        {reason && <span className="block text-amber-300">Reason: {reason}</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <Card>
            <div className="text-sm font-medium text-white">Not used in this version</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-400">
              {NOT_USED.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </PageShell>
  )
}