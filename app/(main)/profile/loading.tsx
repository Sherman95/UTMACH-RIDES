export default function ProfileLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-zinc-800 rounded-2xl" />
        <div className="space-y-2">
          <div className="h-5 w-40 bg-zinc-800 rounded-lg" />
          <div className="h-3 w-56 bg-zinc-800/60 rounded-lg" />
        </div>
      </div>

      {/* Form skeleton */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="h-4 w-32 bg-zinc-800 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 bg-zinc-800/60 rounded" />
              <div className="h-10 w-full bg-zinc-800 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Vehicles skeleton */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="h-4 w-28 bg-zinc-800 rounded" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-zinc-800/40 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
