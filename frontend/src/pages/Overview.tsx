import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import ProvenancePanel from '../components/ProvenancePanel'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import ScoreCard from '../components/ui/ScoreCard'
import Skeleton from '../components/ui/Skeleton'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import { getAnalysisSummary } from '../api/endpoints'
import { useCurrentAnalysisId } from '../lib/currentAnalysis'

const COUNT_LABELS: Record<string, string> = {
  files: 'Files',
  modules: 'Modules',
  commits: 'Commits',
  issues: 'Issues',
  contributors: 'Contributors',
}

export default function Overview() {
  const id = useCurrentAnalysisId()
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['summary', id],
    queryFn: () => getAnalysisSummary(id as string),
    enabled: id !== null,
  })

  return (
    <PageShell title="Repository health overview" description="Aggregated evidence from the agents.">
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
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-48" />
        </div>
      )}

      {isError && <ErrorState message={(error as Error).message} onRetry={() => refetch()} />}

      {data && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={data.status} />
            <Badge tone={data.data_source === 'live' ? 'success' : 'warning'}>
              {data.data_source === 'live' ? 'Live analysis' : 'Sample data'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {Object.entries(data.provenance.counts).map(([k, v]) => (
              <StatCard
                key={k}
                label={COUNT_LABELS[k] ?? k}
                value={v}
                reason={data.provenance.unavailable[k]}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard label="High-risk files" value={data.high_risk_files} />
            <ScoreCard label="Average bug risk" score={data.avg_bug_risk} />
            <ScoreCard label="Average technical debt" score={data.avg_debt} />
          </div>

          <ProvenancePanel p={data.provenance} />
        </div>
      )}
    </PageShell>
  )
}