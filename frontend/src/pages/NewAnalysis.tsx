import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import ErrorState from '../components/ui/ErrorState'
import StatusBadge from '../components/ui/StatusBadge'
import { createAnalysis, getAnalysisStatus } from '../api/endpoints'
import { setCurrentAnalysisId } from '../lib/currentAnalysis'

const GITHUB_URL = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+?(\.git)?\/?$/

export default function NewAnalysis() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: createAnalysis,
    onSuccess: (res) => {
      setCurrentAnalysisId(res.analysis_id)
      setActiveId(res.analysis_id)
    },
  })

  const status = useQuery({
    queryKey: ['status', activeId],
    queryFn: () => getAnalysisStatus(activeId as string),
    enabled: activeId !== null,
    refetchInterval: (query) => {
      const s = query.state.data?.status
      return s === 'queued' || s === 'running' ? 1500 : false
    },
  })

  function submit() {
    const trimmed = url.trim()
    if (!GITHUB_URL.test(trimmed)) {
      setFormError('Enter a public GitHub repository URL, e.g. https://github.com/owner/repo')
      return
    }
    setFormError(null)
    setActiveId(null)
    create.mutate(trimmed)
  }

  const s = status.data
  const finished = s && (s.status === 'completed' || s.status === 'partial')

  return (
    <PageShell
      title="New analysis"
      description="Analysis runs in the background. This page polls the backend for progress."
    >
      <Card>
        <label htmlFor="repo" className="text-sm font-medium text-white">
          GitHub repository URL
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="repo"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="https://github.com/owner/repo"
            className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={create.isPending}
            className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            {create.isPending ? 'Starting…' : 'Analyze'}
          </button>
        </div>
        {formError && <p className="mt-2 text-sm text-red-300">{formError}</p>}
      </Card>

      {create.isError && (
        <div className="mt-4">
          <ErrorState message={(create.error as Error).message} onRetry={submit} />
        </div>
      )}

      {activeId && (
        <div className="mt-6 space-y-4">
          {status.isError && (
            <ErrorState message={(status.error as Error).message} onRetry={() => status.refetch()} />
          )}

          {s && (
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-slate-300">{s.repo_url}</div>
                <StatusBadge status={s.status} />
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded bg-slate-800">
                <div
                  className="h-full bg-indigo-500 transition-all"
                  style={{ width: `${Math.round((s.progress ?? 0) * 100)}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {s.progress === null ? 'Progress unknown' : `${Math.round(s.progress * 100)}%`}
                {s.stage ? ` · ${s.stage}` : ''}
              </div>

              <ul className="mt-4 divide-y divide-slate-800">
                {s.agents.map((a) => (
                  <li key={a.agent} className="flex items-center justify-between py-2 text-sm">
                    <span className="capitalize text-slate-200">{a.agent.replace(/_/g, ' ')}</span>
                    <span className="flex items-center gap-2">
                      {a.error && <span className="text-xs text-red-300">{a.error}</span>}
                      <StatusBadge status={a.status} />
                    </span>
                  </li>
                ))}
              </ul>

              {s.error && <p className="mt-3 text-sm text-red-300">{s.error}</p>}

              {finished && (
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 rounded-md bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-500/30"
                >
                  View results
                </button>
              )}
            </Card>
          )}
        </div>
      )}
    </PageShell>
  )
}