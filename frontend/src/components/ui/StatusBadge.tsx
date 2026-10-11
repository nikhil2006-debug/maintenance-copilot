import Badge from './Badge'

const TONE_BY_STATUS = {
  completed: 'success',
  partial: 'warning',
  failed: 'danger',
  running: 'info',
  queued: 'neutral',
  pending: 'neutral',
  skipped: 'neutral',
} as const

export default function StatusBadge({ status }: { status: string }) {
  const tone = TONE_BY_STATUS[status as keyof typeof TONE_BY_STATUS] ?? 'neutral'
  return <Badge tone={tone}>{status}</Badge>
}