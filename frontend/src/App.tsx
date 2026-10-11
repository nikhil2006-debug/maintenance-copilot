import NewAnalysis from './pages/NewAnalysis'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Overview from './pages/Overview'
import PlaceholderPage from './pages/PlaceholderPage'

const placeholders = [
  
  { path: 'files', title: 'File risk', phase: 'Oct 12' },
  { path: 'debt', title: 'Technical debt', phase: 'Oct 12' },
  { path: 'agents', title: 'Agent pipeline', phase: 'Oct 13' },
  { path: 'evolution', title: 'Bug evolution', phase: 'Oct 13' },
  { path: 'recommendations', title: 'Explanation & actions', phase: 'Oct 13' },
  { path: 'data-sources', title: 'Data sources', phase: 'Oct 15' },
  { path: 'evaluation', title: 'Evaluation', phase: 'Oct 15' },
  { path: 'history', title: 'History & feedback', phase: 'Oct 15' },
  { path: 'architecture', title: 'Architecture', phase: 'Oct 11' },
]

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="new" element={<NewAnalysis />} />
        {placeholders.map((p) => (
          <Route key={p.path} path={p.path} element={<PlaceholderPage title={p.title} phase={p.phase} />} />
        ))}
        <Route path="*" element={<PlaceholderPage title="Page not found" phase="never" />} />
      </Route>
    </Routes>
  )
}