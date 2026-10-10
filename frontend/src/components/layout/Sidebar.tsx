import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, PlayCircle, FileWarning, Activity, Landmark, Bot,
  Lightbulb, Database, FlaskConical, History, Network,
} from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/new', label: 'New analysis', icon: PlayCircle },
  { to: '/files', label: 'File risk', icon: FileWarning },
  { to: '/evolution', label: 'Bug evolution', icon: Activity },
  { to: '/debt', label: 'Technical debt', icon: Landmark },
  { to: '/agents', label: 'Agent pipeline', icon: Bot },
  { to: '/recommendations', label: 'Explanation & actions', icon: Lightbulb },
  { to: '/data-sources', label: 'Data sources', icon: Database },
  { to: '/evaluation', label: 'Evaluation', icon: FlaskConical },
  { to: '/history', label: 'History & feedback', icon: History },
  { to: '/architecture', label: 'Architecture', icon: Network },
]

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="text-base font-semibold text-white">Maintenance Copilot</div>
        <div className="text-xs text-slate-400">Agentic bug & debt analysis</div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-500/15 text-indigo-300'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}