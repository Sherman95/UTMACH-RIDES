'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Users,
  Star,
  GraduationCap,
  AlertCircle,
  Inbox,
} from 'lucide-react'

type PassengerInfo = {
  requestId: string
  passengerId: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  fullName: string
  carrera: string | null
  whatsappNumber: string | null
  averageRating: number | null
}

interface TripRequestsProps {
  tripId: string
  origin: string
  destination: string
  departureTime: string
}

export default function TripRequests({
  tripId,
  origin,
  destination,
  departureTime,
}: TripRequestsProps) {
  const [requests, setRequests] = useState<PassengerInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const loadRequests = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('trip_requests')
        .select('id, passenger_id, status, created_at, users:passenger_id(full_name, carrera, whatsapp_number, average_rating)')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      const mapped: PassengerInfo[] = (data ?? []).map((r: Record<string, unknown>) => {
        const u = r.users as Record<string, unknown> | null
        return {
          requestId: r.id as string,
          passengerId: r.passenger_id as string,
          status: r.status as 'pending' | 'accepted' | 'rejected',
          createdAt: r.created_at as string,
          fullName: (u?.full_name as string) ?? 'Usuario',
          carrera: (u?.carrera as string) ?? null,
          whatsappNumber: (u?.whatsapp_number as string) ?? null,
          averageRating: (u?.average_rating as number) ?? null,
        }
      })
      setRequests(mapped)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar solicitudes')
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => { loadRequests() }, [loadRequests])

  async function handleAction(requestId: string, action: 'accepted' | 'rejected') {
    setActionLoading(requestId)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('trip_requests')
        .update({ status: action })
        .eq('id', requestId)

      if (updateError) throw updateError

      // If accepting, decrement seat count
      if (action === 'accepted') {
        const { data: trip } = await supabase
          .from('trips')
          .select('seats_available')
          .eq('id', tripId)
          .single()

        if (trip && trip.seats_available > 0) {
          await supabase
            .from('trips')
            .update({ seats_available: trip.seats_available - 1 })
            .eq('id', tripId)
        }
      }

      await loadRequests()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    } finally {
      setActionLoading(null)
    }
  }

  function buildWhatsAppUrl(passenger: PassengerInfo): string {
    const phone = (passenger.whatsappNumber ?? '').replace(/\D/g, '').replace(/^0/, '593')
    const time = new Date(departureTime).toLocaleString('es-EC', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })
    const msg = encodeURIComponent(
      `Hola ${passenger.fullName.split(' ')[0]}! Acepte tu solicitud en UTMACH Rides ` +
      `para el viaje ${origin} -> ${destination} el ${time}. Coordinamos punto de encuentro?`
    )
    return `https://wa.me/${phone}?text=${msg}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-4">
        <Inbox className="w-6 h-6 text-zinc-600 mx-auto mb-1.5" />
        <p className="text-xs text-zinc-500">Sin solicitudes aun</p>
      </div>
    )
  }

  const pending = requests.filter((r) => r.status === 'pending')
  const accepted = requests.filter((r) => r.status === 'accepted')
  const rejected = requests.filter((r) => r.status === 'rejected')

  return (
    <div className="space-y-3 border-t border-zinc-800 pt-3">
      <div className="flex items-center gap-2">
        <Users className="w-3.5 h-3.5 text-brand" />
        <h4 className="text-xs font-semibold text-white">
          Solicitudes ({requests.length})
        </h4>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 rounded-lg p-2 border border-red-800/30">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-amber-400 uppercase tracking-wide">
            Pendientes ({pending.length})
          </p>
          {pending.map((r) => (
            <div key={r.requestId} className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-white truncate">{r.fullName}</p>
                    {r.averageRating != null && (
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        {r.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {r.carrera && (
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-2.5 h-2.5" /> {r.carrera}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAction(r.requestId, 'rejected')}
                    disabled={actionLoading === r.requestId}
                    className="p-1.5 rounded-lg bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 text-red-400 transition disabled:opacity-50"
                    title="Rechazar"
                  >
                    {actionLoading === r.requestId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleAction(r.requestId, 'accepted')}
                    disabled={actionLoading === r.requestId}
                    className="p-1.5 rounded-lg bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-800/30 text-emerald-400 transition disabled:opacity-50"
                    title="Aceptar"
                  >
                    {actionLoading === r.requestId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accepted */}
      {accepted.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-emerald-400 uppercase tracking-wide">
            Aceptados ({accepted.length})
          </p>
          {accepted.map((r) => (
            <div key={r.requestId} className="p-2.5 rounded-xl bg-emerald-900/10 border border-emerald-800/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">{r.fullName}</p>
                  {r.carrera && (
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-2.5 h-2.5" /> {r.carrera}
                    </p>
                  )}
                </div>
                <a
                  href={buildWhatsAppUrl(r)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold transition flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3" /> WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <details className="group">
          <summary className="text-[10px] font-medium text-zinc-500 cursor-pointer hover:text-zinc-400 transition">
            Rechazados ({rejected.length})
          </summary>
          <div className="space-y-1.5 mt-1.5">
            {rejected.map((r) => (
              <div key={r.requestId} className="p-2 rounded-lg bg-zinc-800/30 border border-zinc-800 opacity-60">
                <p className="text-xs text-zinc-400">{r.fullName}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
