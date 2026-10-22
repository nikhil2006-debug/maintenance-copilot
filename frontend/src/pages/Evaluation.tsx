import PageShell from '../components/layout/PageShell'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'

const ITEMS = [
  { item: 'Trained prediction model', status: 'Not built', detail: 'Scores are a rank-based heuristic, not model output.' },
  { item: 'Temporal train/test split', status: 'Not done', detail: 'No held-out period exists, so nothing is validated.' },
  { item: 'Accuracy metrics (precision, recall, AUC)', status: 'Not measured', detail: 'No metric is reported anywhere in this app.' },
  { item: 'Baseline comparison', status: 'Not done', detail: 'No comparison against a simple baseline such as file size or commit count.' },
  { item: 'Human review of recommendations', status: 'Not done', detail: 'Recommendations have not been checked by maintainers.' },
]

const NEEDED = [
  'Label bug-introducing changes with a recognised method such as SZZ, instead of a commit-message keyword match.',
  'Train on an earlier period and test on a later one, so results are not leaked from the future.',
  'Report precision, recall and ranking quality against simple baselines.',
  'Collect maintainer feedback on the recommendations and measure how often they are useful.',
]

export default function Evaluation() {
  return (
    <PageShell
      title="Evaluation"
      description="No evaluation has been run. This page lists what is missing, so scores are not read as validated."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Badge tone="warning">Heuristic scores</Badge>
          <Badge tone="danger">Not validated</Badge>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Detail</th>
              </tr>
            </thead>
            <tbody>
              {ITEMS.map((r) => (
                <tr key={r.item} className="border-t border-slate-800 align-top">
                  <td className="px-4 py-3 font-medium text-white">{r.item}</td>
                  <td className="px-4 py-3">
                    <Badge tone="warning">{r.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Card>
          <div className="text-sm font-medium text-white">What a real evaluation would need</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-400">
            {NEEDED.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Card>
      </div>
    </PageShell>
  )
}