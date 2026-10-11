import type { Score } from '../../api/types'
import Badge from './Badge'
import Card from './Card'
import { fmtScore } from '../../lib/format'

function kindOf(score: Score) {
  if (score.method === 'heuristic') return { text: 'Heuristic indicator', tone: 'warning' as const }
  return score.validated
    ? { text: 'Validated model', tone: 'success' as const }
    : { text: 'Unvalidated model', tone: 'warning' as const }
}

export default function ScoreCard({ label, score }: { label: string; score: Score | null }) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      {score === null ? (
        <div className="mt-1 text-xl font-semibold text-slate-500">Unavailable</div>
      ) : (
        <>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xl font-semibold text-white">{fmtScore(score.value)}</span>
            <Badge tone={kindOf(score).tone}>{kindOf(score).text}</Badge>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {score.confidence === null
              ? 'Confidence: not measured'
              : `Confidence: ${score.confidence.toFixed(2)} (${score.confidence_kind ?? 'unspecified'})`}
          </div>
        </>
      )}
    </Card>
  )
}