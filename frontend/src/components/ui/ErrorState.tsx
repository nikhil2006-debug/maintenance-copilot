export default function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-4">
      <p className="text-sm text-red-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-md bg-red-500/20 px-3 py-1.5 text-sm text-red-200 hover:bg-red-500/30"
        >
          Retry
        </button>
      )}
    </div>
  )
}