import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Skeleton from '../components/ui/Skeleton'
import StatusBadge from '../components/ui/StatusBadge'
import { getFeedback, listAnalyses } from '../api/endpoints'
import { fmtCount, fmtDate } from '../lib/format'
import { setCurrentAnalysisId, useCurrentAnalysisId } from '../lib/currentAnalysis'

export default function History() {
  const navigate = useNavigate()
  const currentId = useCurrentAnalysisId()

  const list = useQuery({ queryKey: ['analyses'], queryFn: listAnalyses })
  const feedback = useQuery({
    queryKey: ['feedback', currentId],
    queryFn: () => getFeedback(currentId as string),
    enabled: currentId !== null,
  })

  const items = list.data?.items ?? []
  const useful = feedback.data?.items.filter((f) => f.verdict === 'useful').length ?? 0
  const notUseful = feedback.data?.items.filter((f) => f.verdict === 'not_useful').length ?? 0

  return (
    <PageShell
      title="History & feedback"
      description="Past analyses on this server, and the feedback collected on the current one."
    >
      <div className="space-y-6">
        <Card>
          <div className="text-sm font-medium text-white">Feedback collected (current analysis)</div>
          {currentId === null ? (
            <p className="mt-2 text-sm text-slate-400">No analysis selected.</p>
          ) : feedback.isLoading ? (
            <Skeleton className="mt-2 h-6" />
          ) : feedback.isError ? (
            <p className="mt-2 text-sm text-red-300">{(feedback.error as Error).message}</p>
          ) : (
            <p className="mt-2 text-sm text-slate-300">
              {useful} marked useful · {notUseful} marked not useful
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Feedback is stored for later review. It does not change any ranking or score in this version.
          </p>
        </Card>

        {list.isLoading && <Skeleton className="h-48" />}
        {list.isError && <ErrorState message={(list.error as Error).message} onRetry={() => list.refetch()} />}

        {list.data && items.length === 0 && (
          <EmptyState title="No analyses yet" description="Submit a repository on the New analysis page." />
        )}

        {items.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Repository</th>
                  <th className="px-4 py-3">Analysed</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Files</th>
                  <th className="px-4 py-3">Commits</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((a) => {
                  const done = a.status === 'completed' || a.status === 'partial'
                  const isCurrent = a.analysis_id === currentId
                  return (
                    <tr key={a.analysis_id} className="border-t border-slate-800 align-middle">
                      <td className="break-all px-4 py-3 text-white">{a.repo_url}</td>
                      <td className="px-4 py-3 text-slate-300">{fmtDate(a.created_at)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-200">{fmtCount(a.files)}</td>
                      <td className="px-4 py-3 text-slate-200">{fmtCount(a.total_commits)}</td>
                      <td className="px-4 py-3 text-right">
                        {isCurrent ? (
                          <span className="text-xs text-emerald-300">Current</span>
                        ) : (
                          done && (
                            <button
                              onClick={() => {
                                setCurrentAnalysisId(a.analysis_id)
                                navigate('/')
                              }}
                              className="rounded-md bg-slate-800 px-3 py-1 text-xs text-slate-100 hover:bg-slate-700"
                            >
                              Open
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  )
}