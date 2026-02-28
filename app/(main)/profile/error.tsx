'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Profile Error]', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
      <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-lg font-semibold text-white text-center">
        Error al cargar el perfil
      </h2>
      <p className="text-sm text-zinc-500 text-center max-w-xs">
        No se pudo cargar tu perfil. Verifica tu conexion e intenta de nuevo.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-xl bg-brand/20 text-brand text-sm font-medium flex items-center gap-2 hover:bg-brand/30 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Reintentar
      </button>
    </div>
  )
}
