import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AgentPipeline from './pages/AgentPipeline'
import Architecture from './pages/Architecture'
import DataSources from './pages/DataSources'
import Evaluation from './pages/Evaluation'
import FileRisk from './pages/FileRisk'
import NewAnalysis from './pages/NewAnalysis'
import Overview from './pages/Overview'
import PlaceholderPage from './pages/PlaceholderPage'
import Recommendations from './pages/Recommendations'
import TechnicalDebt from './pages/TechnicalDebt'
import History from './pages/History'

const placeholders = [
  { path: 'evolution', title: 'Bug evolution', phase: 'Not built' }
  
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
        <Route path="data-sources" element={<DataSources />} />
        <Route path="evaluation" element={<Evaluation />} />
        <Route path="architecture" element={<Architecture />} />
        <Route path="history" element={<History />} />
        {placeholders.map((p) => (
          <Route key={p.path} path={p.path} element={<PlaceholderPage title={p.title} phase={p.phase} />} />
        ))}
        <Route path="*" element={<PlaceholderPage title="Page not found" phase="never" />} />
      </Route>
    </Routes>
  )
}