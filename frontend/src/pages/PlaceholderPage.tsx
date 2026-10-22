import PageShell from '../components/layout/PageShell'

export default function PlaceholderPage({ title }: { title: string; phase?: string }) {
  return (
    <PageShell title={title}>
      <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
        Not implemented in this version. Listed as future work.
      </div>
    </PageShell>
  )
}