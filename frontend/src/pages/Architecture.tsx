import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'

const LAYERS = [
  { name: '1. Input', items: ['Source code', 'Commit history', 'Issue / bug reports', 'Developer activity', 'Code metrics', 'Historical technical debt'] },
  { name: '2. Preprocessing', items: ['Data cleaning', 'Missing value handling', 'Feature extraction', 'Code / issue normalization', 'Temporal / history construction'] },
  { name: '3. Features', items: ['Code complexity', 'Code churn', 'Number of commits', 'Bug frequency', 'Bug severity', 'Developer activity', 'Change frequency', 'Previous defect history', 'Debt indicators'] },
  { name: '4. Agentic AI', items: ['Bug Analysis Agent', 'Bug Evolution Agent', 'Technical Debt Agent', 'Recommendation Agent', 'Orchestrator / Decision Agent'] },
  { name: '5. Output', items: ['Bug evolution prediction', 'Technical debt prediction', 'Risk / priority score', 'Explanation (why)', 'Recommended action'] },
]

export default function Architecture() {
  return (
    <PageShell
      title="System architecture"
      description="Planned layered design from the Review 1 document (Figure 1). Implementation status of each agent is shown on the Agent pipeline page, not here."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {LAYERS.map((layer) => (
          <Card key={layer.name}>
            <h2 className="mb-3 text-sm font-semibold text-indigo-300">{layer.name}</h2>
            <ul className="space-y-2">
              {layer.items.map((item) => (
                <li key={item} className="rounded border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200">
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-dashed border-slate-600 p-4 text-center text-sm text-slate-400">
        Feedback loop: agent evaluation and reasoning review feed new repository data back into re-analysis.
      </div>
    </PageShell>
  )
}