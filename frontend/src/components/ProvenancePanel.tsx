import type { ReactNode } from 'react'
import type { Provenance } from '../api/types'
import Card from './ui/Card'
import { fmtDate } from '../lib/format'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-3">
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="break-words text-sm text-slate-100 sm:col-span-2">{children}</dd>
    </div>
  )
}

export default function ProvenancePanel({ p }: { p: Provenance }) {
  const unavailable = Object.entries(p.unavailable)
  return (
    <Card>
      <h2 className="mb-1 text-sm font-semibold text-white">Data provenance</h2>
      <dl className="divide-y divide-slate-800">
        <Row label="Repository">{p.repo}</Row>
        <Row label="Commit">{p.commit_sha}</Row>
        <Row label="Analyzed at">{fmtDate(p.analyzed_at)}</Row>
        <Row label="Prediction target">{p.prediction_target}</Row>
        <Row label="Label method">{p.label_method}</Row>
        <Row label="Train/test split">
          {p.split
            ? `${p.split.type}, cutoff ${p.split.cutoff}, train ${p.split.train_n}, test ${p.split.test_n}`
            : 'No held-out split reported'}
        </Row>
        <Row label="Unavailable data">
          {unavailable.length === 0
            ? 'None reported'
            : unavailable.map(([k, why]) => `${k}: ${why}`).join('; ')}
        </Row>
      </dl>
    </Card>
  )
}