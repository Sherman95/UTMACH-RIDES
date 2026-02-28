export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Greeting skeleton */}
      <div className="space-y-2">
        <div className="h-5 w-48 bg-zinc-800 rounded-lg" />
        <div className="h-4 w-64 bg-zinc-800/60 rounded-lg" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-xl p-4 space-y-2">
            <div className="h-3 w-16 bg-zinc-800 rounded" />
            <div className="h-6 w-10 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>

      {/* Feed skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-xl p-4 space-y-3">
            <div className="h-4 w-3/4 bg-zinc-800 rounded" />
            <div className="h-3 w-1/2 bg-zinc-800/60 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
