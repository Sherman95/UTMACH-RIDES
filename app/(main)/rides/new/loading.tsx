export default function NewRideLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Title skeleton */}
      <div className="h-6 w-44 bg-zinc-800 rounded-lg" />

      {/* Form skeleton */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 bg-zinc-800/60 rounded" />
              <div className="h-10 w-full bg-zinc-800 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="h-12 w-full bg-zinc-800 rounded-xl" />
      </div>
    </div>
  )
}
