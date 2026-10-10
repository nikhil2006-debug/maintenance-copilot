import type { ReactNode } from 'react'

export default function PageShell(props: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold text-white">{props.title}</h1>
      {props.description && <p className="mt-1 text-sm text-slate-400">{props.description}</p>}
      <div className="mt-6">{props.children}</div>
    </div>
  )
}