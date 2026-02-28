'use client'

import { memo, useMemo } from 'react'
import { TripWithDetails } from '@/types/database'
import { generateWhatsAppUrl, formatDate, formatTime, getRelativeTime } from '@/lib/utils'
import { ALL_CAMPUS_NAMES } from '@/lib/constants'
import { MapPin, Clock, Users, DollarSign, MessageCircle, GraduationCap, Building2 } from 'lucide-react'

interface TripCardProps {
  trip: TripWithDetails
}

const campusSet = new Set(ALL_CAMPUS_NAMES.map((n) => n.toLowerCase()))

function checkCampus(name: string) {
  const lower = name.toLowerCase()
  for (const campus of campusSet) {
    if (lower.includes(campus) || campus.includes(lower)) return true
  }
  return false
}

export const TripCard = memo(function TripCard({ trip }: TripCardProps) {
  const whatsappUrl = useMemo(
    () =>
      generateWhatsAppUrl(
        trip.users.whatsapp_number || '',
        trip.users.full_name || 'Conductor',
        trip.origin,
        formatTime(trip.departure_time)
      ),
    [trip.users.whatsapp_number, trip.users.full_name, trip.origin, trip.departure_time]
  )

  const relativeTime = getRelativeTime(trip.departure_time)
  const goesToCampus = checkCampus(trip.destination)

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      {/* Header: Driver info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand/20 rounded-full flex items-center justify-center ring-2 ring-brand/30">
          <span className="text-brand font-bold text-sm">
            {(trip.users.full_name || 'U')[0].toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-white truncate">{trip.users.full_name || 'Conductor'}</p>
          <p className="text-xs text-zinc-500 truncate">
            {trip.vehicles.brand} {trip.vehicles.model} · {trip.vehicles.color}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs text-brand bg-brand/10 px-2 py-1 rounded-full font-medium">
            {relativeTime}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
            goesToCampus
              ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/30'
              : 'bg-amber-900/30 text-amber-400 border border-amber-800/30'
          }`}>
            {goesToCampus ? <GraduationCap className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
            {goesToCampus ? 'Ir a la U' : 'Volver'}
          </span>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <div className="w-2.5 h-2.5 bg-brand rounded-full" />
          <div className="w-0.5 h-6 bg-gradient-to-b from-brand to-red-500 rounded-full" />
          <MapPin className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex-1 space-y-3">
          <p className="text-sm font-medium text-white">{trip.origin}</p>
          <p className="text-sm font-medium text-white">{trip.destination}</p>
        </div>
      </div>

      {/* Details */}
      <div className="flex items-center gap-4 text-xs text-zinc-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {formatDate(trip.departure_time)} · {formatTime(trip.departure_time)}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {trip.seats_available}
        </span>
        <span className="flex items-center gap-1 text-brand font-medium">
          <DollarSign className="w-3.5 h-3.5" />
          ${Number(trip.price_contribution).toFixed(2)}
        </span>
      </div>

      {/* WhatsApp CTA */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm transition-colors shadow-lg shadow-brand/20"
      >
        <MessageCircle className="w-4 h-4" />
        Me apunto
      </a>
    </div>
  )
})
