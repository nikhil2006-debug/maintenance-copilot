import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Skeleton from '../components/ui/Skeleton'
import { getAgents } from '../api/endpoints'
import type { Recommendation } from '../api/types'
import { useCurrentAnalysisId } from '../lib/currentAnalysis'
import { fmtScore } from '../lib/format'

function toMarkdown(r: Recommendation) {
  return [
    `### Review \`${r.file}\``,
    `Heuristic risk: ${fmtScore(r.risk)} (not a validated prediction)`,
    `Flagged by: ${r.flagged_by.join(', ')}`,
    '',
    ...r.actions.map((a) => `- [ ] ${a}`),
  ].join('\n')
}

export default function Recommendations() {
  const id = useCurrentAnalysisId()
  const [copied, setCopied] = useState<string | null>(null)
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['agents', id],
    queryFn: () => getAgents(id as string),
    enabled: id !== null,
  })

  async function copy(r: Recommendation) {
    try {
      await navigator.clipboard.writeText(toMarkdown(r))
      setCopied(r.file)
    } catch {
      setCopied(null)
    }
  }

  return (
    <PageShell
      title="Explanation & actions"
      description="Ranked suggestions with the rule that triggered each one. Heuristic, not validated."
    >
      {id === null && (
        <EmptyState
          title="No analysis yet"
          action={<Link to="/new" className="rounded-md bg-indigo-500 px-4 py-2 text-sm text-white">Start an analysis</Link>}
        />
      )}
      {id !== null && isLoading && <Skeleton className="h-64" />}
      {isError && <ErrorState message={(error as Error).message} onRetry={() => refetch()} />}

      {data && data.recommendations.length === 0 && (
        <EmptyState title="No recommendations" description="No file met the agents' rules for this analysis." />
      )}

      {data && data.recommendations.length > 0 && (
        <div className="space-y-4">
          {data.recommendations.map((r) => (
            <Card key={r.file}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-400">Rank {r.rank}</div>
                  <div className="break-all text-sm font-semibold text-white">{r.file}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="warning">Risk {fmtScore(r.risk)} (heuristic)</Badge>
                  {r.flagged_by.map((x) => (
                    <Badge key={x} tone="info">{x.replace(/_/g, ' ')}</Badge>
                  ))}
                </div>
              </div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-200">
                {r.actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <button
                onClick={() => copy(r)}
                className="mt-3 rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
              >
                {copied === r.file ? 'Copied' : 'Copy as Markdown ticket'}
              </button>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  )
}