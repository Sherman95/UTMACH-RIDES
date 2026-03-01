'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Trip, Vehicle } from '@/types/database'
import { formatDate, formatTime } from '@/lib/utils'
import { CANTONES_EL_ORO, CAMPUS_UTMACH } from '@/lib/constants'
import {
  Clock,
  Users,
  Loader2,
  XCircle,
  CheckCircle,
  MapPin,
  Pencil,
  X,
  DollarSign,
  Save,
  AlertCircle,
  ChevronDown,
} from 'lucide-react'
import TripRequests from './TripRequests'

interface TripWithVehicle extends Trip {
  vehicles: Vehicle
}

const PREVIEW_COUNT = 3

export function MyTrips() {
  const [trips, setTrips] = useState<TripWithVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [showAll, setShowAll] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    origin: '',
    destination: '',
    departure_date: '',
    departure_time: '',
    seats_available: 1,
    price_contribution: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { user } = useAuth()

  useEffect(() => {
    if (user) fetchMyTrips()
  }, [user])

  async function fetchMyTrips() {
    if (!user) return
    setFetchError(false)
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('id, origin, destination, departure_time, seats_available, price_contribution, status, driver_id, vehicle_id, created_at, vehicles(brand, model, color, id, driver_id, license_plate, created_at)')
        .eq('driver_id', user.id)
        .order('departure_time', { ascending: false })
        .limit(20)

      if (error) throw error
      if (data) setTrips(data as unknown as TripWithVehicle[])
    } catch {
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(
    tripId: string,
    status: 'completed' | 'cancelled'
  ) {
    try {
      const { error: err } = await supabase
        .from('trips')
        .update({ status })
        .eq('id', tripId)

      if (err) throw err
      setTrips(trips.map((t) => (t.id === tripId ? { ...t, status } : t)))
    } catch {
      setError('Error al actualizar el estado del viaje')
    }
  }

  function startEdit(trip: TripWithVehicle) {
    const dt = new Date(trip.departure_time)
    const dateStr = dt.toISOString().split('T')[0]
    const timeStr = dt.toTimeString().slice(0, 5)

    setEditForm({
      origin: trip.origin,
      destination: trip.destination,
      departure_date: dateStr,
      departure_time: timeStr,
      seats_available: trip.seats_available,
      price_contribution: String(trip.price_contribution),
    })
    setEditingId(trip.id)
    setError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setError('')
  }

  async function saveEdit(tripId: string) {
    setError('')

    if (!editForm.origin || !editForm.destination) {
      setError('Origen y destino son requeridos')
      return
    }
    if (editForm.origin === editForm.destination) {
      setError('Origen y destino no pueden ser iguales')
      return
    }
    if (!editForm.departure_date || !editForm.departure_time) {
      setError('Fecha y hora son requeridas')
      return
    }

    const price = parseFloat(editForm.price_contribution)
    if (isNaN(price) || price < 0) {
      setError('Aporte invalido')
      return
    }
    if (price > 50) {
      setError('El aporte maximo es $50')
      return
    }

    setSaving(true)

    const departureDateTime = new Date(
      `${editForm.departure_date}T${editForm.departure_time}`
    )

    if (departureDateTime <= new Date()) {
      setError('La fecha de salida debe ser futura')
      setSaving(false)
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('trips')
        .update({
          origin: editForm.origin,
          destination: editForm.destination,
          departure_time: departureDateTime.toISOString(),
          seats_available: editForm.seats_available,
          price_contribution: price,
        })
        .eq('id', tripId)

      if (updateError) throw updateError

      setTrips(
        trips.map((t) =>
          t.id === tripId
            ? {
                ...t,
                origin: editForm.origin,
                destination: editForm.destination,
                departure_time: departureDateTime.toISOString(),
                seats_available: editForm.seats_available,
                price_contribution: price,
              }
            : t
        )
      )
      setEditingId(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const allLocations = [
    ...CAMPUS_UTMACH.map((c) => c.name),
    ...CANTONES_EL_ORO,
  ]

  function getStatusConfig(status: string) {
    switch (status) {
      case 'active':
        return { label: 'Activo', className: 'bg-brand/20 text-brand' }
      case 'completed':
        return { label: 'Completado', className: 'bg-blue-900/30 text-blue-400' }
      case 'cancelled':
        return { label: 'Cancelado', className: 'bg-red-900/30 text-red-400' }
      default:
        return { label: status, className: 'bg-zinc-800 text-zinc-400' }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-brand" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="text-center py-6 space-y-3">
        <div className="w-10 h-10 glass rounded-xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-sm text-zinc-400">Error al cargar tus viajes</p>
        <button
          onClick={() => { setLoading(true); fetchMyTrips() }}
          className="text-xs px-4 py-2 rounded-lg bg-brand/20 text-brand font-medium hover:bg-brand/30 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-6 space-y-2">
        <div className="w-10 h-10 glass rounded-xl flex items-center justify-center mx-auto">
          <MapPin className="w-5 h-5 text-zinc-600" />
        </div>
        <p className="text-sm text-zinc-500">No has publicado viajes aun</p>
      </div>
    )
  }

  const visibleTrips = showAll ? trips : trips.slice(0, PREVIEW_COUNT)
  const hasMore = trips.length > PREVIEW_COUNT

  return (
    <div className="space-y-3">
      {visibleTrips.map((trip) => {
        const statusConfig = getStatusConfig(trip.status)
        const isEditing = editingId === trip.id
        const canEdit = trip.status === 'active'
        const canAct = trip.status === 'active'

        return (
          <div
            key={trip.id}
            className="glass-card rounded-xl p-4 space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  trip.status === 'active' ? 'bg-brand' : trip.status === 'completed' ? 'bg-blue-400' : 'bg-red-400'
                }`} />
                <p className="text-sm font-semibold text-white truncate">
                  {trip.origin} → {trip.destination}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {canEdit && !isEditing && (
                  <button
                    onClick={() => startEdit(trip)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-brand hover:bg-brand/10 transition-colors"
                    title="Editar viaje"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig.className}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>

            {/* Edit Form */}
            {isEditing ? (
              <div className="space-y-3 border-t border-zinc-800 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-medium">Origen</label>
                    <select
                      value={editForm.origin}
                      onChange={(e) => setEditForm({ ...editForm, origin: e.target.value })}
                      className="w-full py-2 px-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand transition"
                    >
                      {allLocations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-medium">Destino</label>
                    <select
                      value={editForm.destination}
                      onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                      className="w-full py-2 px-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand transition"
                    >
                      {allLocations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-medium">Fecha</label>
                    <input
                      type="date"
                      value={editForm.departure_date}
                      onChange={(e) => setEditForm({ ...editForm, departure_date: e.target.value })}
                      className="w-full py-2 px-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-medium">Hora</label>
                    <input
                      type="time"
                      value={editForm.departure_time}
                      onChange={(e) => setEditForm({ ...editForm, departure_time: e.target.value })}
                      className="w-full py-2 px-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                      <Users className="w-3 h-3" /> Asientos
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={editForm.seats_available}
                      onChange={(e) => setEditForm({ ...editForm, seats_available: parseInt(e.target.value) || 1 })}
                      className="w-full py-2 px-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Aporte $
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="50"
                      value={editForm.price_contribution}
                      onChange={(e) => setEditForm({ ...editForm, price_contribution: e.target.value })}
                      className="w-full py-2 px-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand transition"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 rounded-lg p-2.5 border border-red-800/30">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(trip.id)}
                    disabled={saving}
                    className="flex-1 text-xs py-2 rounded-lg bg-brand/20 text-brand font-medium flex items-center justify-center gap-1.5 hover:bg-brand/30 transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Guardar
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex-1 text-xs py-2 rounded-lg bg-zinc-800 text-zinc-400 font-medium flex items-center justify-center gap-1.5 hover:bg-zinc-700 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Trip details */}
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(trip.departure_time)} · {formatTime(trip.departure_time)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {trip.seats_available} asientos
                  </span>
                  {Number(trip.price_contribution) > 0 && (
                    <span className="flex items-center gap-1 text-brand font-medium">
                      <DollarSign className="w-3 h-3" />
                      ${Number(trip.price_contribution).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Action buttons — only for active trips */}
                {canAct && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => updateStatus(trip.id, 'completed')}
                      className="flex-1 text-xs py-2 rounded-lg bg-blue-900/20 text-blue-400 font-medium flex items-center justify-center gap-1.5 hover:bg-blue-900/40 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Completar
                    </button>
                    <button
                      onClick={() => updateStatus(trip.id, 'cancelled')}
                      className="flex-1 text-xs py-2 rounded-lg bg-red-900/20 text-red-400 font-medium flex items-center justify-center gap-1.5 hover:bg-red-900/40 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancelar
                    </button>
                  </div>
                )}

                {/* Trip requests — only for active trips */}
                {canAct && (
                  <TripRequests
                    tripId={trip.id}
                    origin={trip.origin}
                    destination={trip.destination}
                    departureTime={trip.departure_time}
                  />
                )}
              </>
            )}
          </div>
        )
      })}

      {/* Show more / less toggle */}
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
