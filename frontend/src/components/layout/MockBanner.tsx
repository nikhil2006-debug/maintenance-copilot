import { USE_MOCKS } from '../../lib/config'

export default function MockBanner() {
  if (!USE_MOCKS) return null
  return (
    <div
      role="status"
      className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-sm font-medium text-amber-300"
    >
      SAMPLE DATA: this is not a real analysis.
    </div>
  )
}