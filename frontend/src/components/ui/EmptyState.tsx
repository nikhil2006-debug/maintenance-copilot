import type { ReactNode } from 'react'

export default function EmptyState(props: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-700 p-10 text-center">
      <div className="text-base font-medium text-white">{props.title}</div>
      {props.description && <p className="mt-1 text-sm text-slate-400">{props.description}</p>}
      {props.action && <div className="mt-4">{props.action}</div>}
    </div>
  )
}