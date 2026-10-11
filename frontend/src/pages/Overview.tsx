import { useQuery } from '@tanstack/react-query'
import PageShell from '../components/layout/PageShell'
import { getAnalysisSummary } from '../api/endpoints'
import { DEMO_ANALYSIS_ID } from '../lib/config'

const fmt = (n: number | null) => (n === null ? 'Unavailable' : n.toLocaleString())

export default function Overview() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['summary', DEMO_ANALYSIS_ID],
    queryFn: () => getAnalysisSummary(DEMO_ANALYSIS_ID),
  })

  return (
    <PageShell title="Repository health overview" description="Aggregated evidence from the agents.">
      {isLoading && <p className="text-slate-400">Loading…</p>}

      {isError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4">
          <p className="text-sm text-red-300">{(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-md bg-red-500/20 px-3 py-1.5 text-sm text-red-200 hover:bg-red-500/30"
          >
            Retry
          </button>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {Object.entries(data.provenance.counts).map(([k, v]) => (
              <div key={k} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">{k}</div>
                <div className="mt-1 text-xl font-semibold text-white">{fmt(v)}</div>
                {v === null && data.provenance.unavailable[k] && (
                  <div className="text-xs text-amber-400">{data.provenance.unavailable[k]}</div>
                )}
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm">
            <div>Repo: <span className="text-white">{data.provenance.repo}</span></div>
            <div>Status: <span className="text-white">{data.status}</span></div>
            <div>Data source: <span className="text-white">{data.data_source}</span></div>
            <div>Target: <span className="text-white">{data.provenance.prediction_target}</span></div>
          </div>
        </div>
      )}
    </PageShell>
  )
}