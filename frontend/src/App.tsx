import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Overview from './pages/Overview'
import NewAnalysis from './pages/NewAnalysis'
import Architecture from './pages/Architecture'
import FileRisk from './pages/FileRisk'
import AgentPipeline from './pages/AgentPipeline'
import Recommendations from './pages/Recommendations'
import PlaceholderPage from './pages/PlaceholderPage'

const placeholders = [
  { path: 'debt', title: 'Technical debt', phase: 'not built yet' },
  { path: 'evolution', title: 'Bug evolution', phase: 'not built (needs per-commit history)' },
  { path: 'data-sources', title: 'Data sources', phase: 'not built yet' },
  { path: 'evaluation', title: 'Evaluation', phase: 'not built yet' },
  { path: 'history', title: 'History & feedback', phase: 'not built yet' },
]

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="new" element={<NewAnalysis />} />
        <Route path="files" element={<FileRisk />} />
        <Route path="agents" element={<AgentPipeline />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="architecture" element={<Architecture />} />
        {placeholders.map((p) => (
          <Route key={p.path} path={p.path} element={<PlaceholderPage title={p.title} phase={p.phase} />} />
        ))}
        <Route path="*" element={<PlaceholderPage title="Page not found" phase="never" />} />
      </Route>
    </Routes>
  )
}