import type { ReactNode } from 'react'

const TONES = {
  neutral: 'bg-slate-700/40 text-slate-300 border-slate-600/50',
  info: 'bg-sky-500/10 text-sky-300 border-sky-500/40',
  success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40',
  warning: 'bg-amber-500/10 text-amber-300 border-amber-500/40',
  danger: 'bg-red-500/10 text-red-300 border-red-500/40',
}

export default function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: keyof typeof TONES
  children: ReactNode
}) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {children}
    </span>
  )
}