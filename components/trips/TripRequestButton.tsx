'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Loader2, Hand, CheckCircle2, XCircle, Clock, X } from 'lucide-react'

type RequestStatus = 'none' | 'pending' | 'accepted' | 'rejected'

interface TripRequestButtonProps {
  tripId: string
  driverId: string
  seatsAvailable: number
}

export default function TripRequestButton({
  tripId,
  driverId,
  seatsAvailable,
}: TripRequestButtonProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<RequestStatus>('none')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) { setChecking(false); return }

    async function check() {
      try {
        const { data } = await supabase
          .from('trip_requests')
          .select('status')
          .eq('trip_id', tripId)
          .eq('passenger_id', user!.id)
          .maybeSingle()

        if (data) setStatus(data.status as RequestStatus)
      } catch {
        // No existing request
      } finally {
        setChecking(false)
      }
    }
    check()
  }, [user, tripId])

  async function handleRequest() {
    if (!user || loading) return
    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('trip_requests')
        .insert({ trip_id: tripId, passenger_id: user.id })

      if (insertError) {
        if (insertError.message.includes('duplicate') || insertError.message.includes('unique')) {
          setStatus('pending')
        } else {
          throw insertError
        }
        return
      }
      setStatus('pending')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al solicitar')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    if (!user || loading) return
    setLoading(true)
    setError('')

    try {
      // If accepted, re-increment seat
      if (status === 'accepted') {
        const { data: trip } = await supabase
          .from('trips')
          .select('seats_available')
          .eq('id', tripId)
          .single()

        if (trip) {
          await supabase
            .from('trips')
            .update({ seats_available: trip.seats_available + 1 })
            .eq('id', tripId)
        }
      }

      const { error: deleteError } = await supabase
        .from('trip_requests')
        .delete()
        .eq('trip_id', tripId)
        .eq('passenger_id', user.id)

      if (deleteError) throw deleteError
      setStatus('none')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cancelar')
    } finally {
      setLoading(false)
    }
  }

  // Don't show for driver's own trips
  if (user?.id === driverId) return null

  if (checking) {
    return (
      <div className="py-2.5 px-4 rounded-xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (status === 'accepted') {
    return (
      <div className="space-y-1">
        <div className="py-2.5 px-4 rounded-xl bg-emerald-900/20 border border-emerald-800/30 flex items-center justify-between text-sm font-semibold">
          <span className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Aceptado
          </span>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="text-xs text-zinc-400 hover:text-red-400 transition flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-900/20"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
            No puedo ir
          </button>
        </div>
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="py-2.5 px-4 rounded-xl bg-red-900/20 border border-red-800/30 flex items-center justify-center gap-2 text-red-400 text-sm font-semibold">
        <XCircle className="w-4 h-4" />
        Solicitud rechazada
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="space-y-1">
        <div className="py-2.5 px-4 rounded-xl bg-amber-900/20 border border-amber-800/30 flex items-center justify-between text-sm font-semibold">
          <span className="flex items-center gap-2 text-amber-400">
            <Clock className="w-4 h-4" />
            Solicitud enviada
          </span>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="text-xs text-zinc-400 hover:text-red-400 transition flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-900/20"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
            Cancelar
          </button>
        </div>
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      </div>
    )
  }

  if (seatsAvailable <= 0) {
    return (
      <div className="py-2.5 px-4 rounded-xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center gap-2 text-zinc-500 text-sm font-semibold">
        Sin asientos disponibles
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleRequest}
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
        ) : (
          <><Hand className="w-4 h-4" /> Me apunto</>
        )}
      </button>
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  )
}
