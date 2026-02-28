import { Loader2 } from 'lucide-react'

export default function MainLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-7 h-7 animate-spin text-brand" />
      <p className="text-sm text-zinc-500">Cargando...</p>
    </div>
  )
}
