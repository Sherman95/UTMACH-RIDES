'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { formatDate, formatTime } from '@/lib/utils'
import {
  Clock,
  MapPin,
  DollarSign,
  Loader2,
  AlertCircle,
  Inbox,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock3,
  Users,
} from 'lucide-react'
import RateButton from './RateButton'

type PassengerTrip = {
  requestId: string
  requestStatus: 'pending' | 'accepted' | 'rejected'
  tripId: string
  origin: string
  destination: string
  departureTime: string
  priceContribution: number
  tripStatus: string
  driverName: string
  driverId: string
  vehicleBrand: string
  vehicleModel: string
  vehicleColor: string
}

const PREVIEW_COUNT = 3

export function MyPassengerTrips() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<PassengerTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!user) return

    async function load() {
      try {
        const { data, error } = await supabase
          .from('trip_requests')
          .select(`
            id,
            status,
            trips:trip_id (
              id,
              origin,
              destination,
              departure_time,
              price_contribution,
              status,
              driver_id,
              users:driver_id (full_name),
              vehicles:vehicle_id (brand, model, color)
            )
          `)
          .eq('passenger_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        const mapped: PassengerTrip[] = (data ?? [])
          .filter((r: Record<string, unknown>) => r.trips != null)
          .map((r: Record<string, unknown>) => {
            const t = r.trips as Record<string, unknown>
            const u = t.users as Record<string, unknown> | null
            const v = t.vehicles as Record<string, unknown> | null
            return {
              requestId: r.id as string,
              requestStatus: r.status as 'pending' | 'accepted' | 'rejected',
              tripId: t.id as string,
              origin: t.origin as string,
              destination: t.destination as string,
              departureTime: t.departure_time as string,
              priceContribution: t.price_contribution as number,
              tripStatus: t.status as string,
              driverName: (u?.full_name as string) ?? 'Conductor',
              driverId: t.driver_id as string,
              vehicleBrand: (v?.brand as string) ?? '',
              vehicleModel: (v?.model as string) ?? '',
              vehicleColor: (v?.color as string) ?? '',
            }
          })

        setTrips(mapped)
      } catch {
        setFetchError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-brand" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="text-center py-6 space-y-2">
        <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
        <p className="text-sm text-zinc-400">Error al cargar historial</p>
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-6 space-y-2">
        <Inbox className="w-8 h-8 text-zinc-600 mx-auto" />
        <p className="text-sm text-zinc-500">No has solicitado viajes aun</p>
      </div>
    )
  }

  function getRequestBadge(status: string) {
    switch (status) {
      case 'accepted':
        return { label: 'Aceptado', icon: CheckCircle, className: 'bg-emerald-900/30 text-emerald-400' }
      case 'rejected':
        return { label: 'Rechazado', icon: XCircle, className: 'bg-red-900/30 text-red-400' }
      default:
        return { label: 'Pendiente', icon: Clock3, className: 'bg-amber-900/30 text-amber-400' }
    }
  }

  function getTripBadge(status: string) {
    switch (status) {
      case 'completed':
        return { label: 'Completado', className: 'bg-blue-900/30 text-blue-400' }
      case 'cancelled':
        return { label: 'Cancelado', className: 'bg-red-900/30 text-red-400' }
      default:
        return { label: 'Activo', className: 'bg-brand/20 text-brand' }
    }
  }

  const visible = showAll ? trips : trips.slice(0, PREVIEW_COUNT)
  const hasMore = trips.length > PREVIEW_COUNT

  return (
    <div className="space-y-3">
      {visible.map((t) => {
        const req = getRequestBadge(t.requestStatus)
        const trip = getTripBadge(t.tripStatus)
        const ReqIcon = req.icon
        const canRate = t.requestStatus === 'accepted' && t.tripStatus === 'completed'

        return (
          <div key={t.requestId} className="glass-card rounded-xl p-4 space-y-2.5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white truncate flex-1">
                {t.origin} → {t.destination}
              </p>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${req.className}`}>
                  <ReqIcon className="w-3 h-3" /> {req.label}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${trip.className}`}>
                  {trip.label}
                </span>
              </div>
            </div>

            {/* Driver info */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand/20 rounded-full flex items-center justify-center ring-1 ring-brand/30">
                <span className="text-brand font-bold text-[10px]">
                  {t.driverName[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-white">{t.driverName}</p>
                <p className="text-[10px] text-zinc-500">
                  {t.vehicleBrand} {t.vehicleModel} · {t.vehicleColor}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(t.departureTime)} · {formatTime(t.departureTime)}
              </span>
              {Number(t.priceContribution) > 0 && (
                <span className="flex items-center gap-1 text-brand font-medium">
                  <DollarSign className="w-3 h-3" />
                  ${Number(t.priceContribution).toFixed(2)}
                </span>
              )}
            </div>

            {/* Rate driver - only for completed & accepted */}
            {canRate && (
              <div className="border-t border-zinc-800 pt-2">
                <RateButton
                  tripId={t.tripId}
                  toUserId={t.driverId}
                  toUserName={t.driverName}
                />
              </div>
            )}
          </div>
        )
      })}

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2.5 rounded-xl border border-zinc-800 text-zinc-400 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-zinc-800/50 transition-colors"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          {showAll ? 'Ver menos' : `Ver todos (${trips.length})`}
        </button>
      )}
    </div>
  )
}
