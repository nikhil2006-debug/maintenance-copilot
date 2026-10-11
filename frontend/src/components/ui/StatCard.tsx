import Card from './Card'
import { fmtCount } from '../../lib/format'

export default function StatCard({
  label,
  value,
  reason,
}: {
  label: string
  value: number | null
  reason?: string
}) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${value === null ? 'text-slate-500' : 'text-white'}`}>
        {fmtCount(value)}
      </div>
      {value === null && reason && <div className="text-xs text-amber-400">{reason}</div>}
    </Card>
  )
}