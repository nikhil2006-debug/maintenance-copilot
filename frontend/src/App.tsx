import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AgentPipeline from './pages/AgentPipeline'
import Architecture from './pages/Architecture'
import FileRisk from './pages/FileRisk'
import NewAnalysis from './pages/NewAnalysis'
import Overview from './pages/Overview'
import PlaceholderPage from './pages/PlaceholderPage'
import Recommendations from './pages/Recommendations'
import TechnicalDebt from './pages/TechnicalDebt'

const placeholders = [
  { path: 'evolution', title: 'Bug evolution', phase: 'Not built' },
  { path: 'data-sources', title: 'Data sources', phase: 'Not built' },
  { path: 'evaluation', title: 'Evaluation', phase: 'Not built' },
  { path: 'history', title: 'History & feedback', phase: 'Not built' },
]

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="new" element={<NewAnalysis />} />
        <Route path="files" element={<FileRisk />} />
        <Route path="debt" element={<TechnicalDebt />} />
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