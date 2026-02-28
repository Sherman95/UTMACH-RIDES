'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { TripWithDetails } from '@/types/database'
import { TripCard } from './TripCard'
import { CANTONES_EL_ORO, ALL_CAMPUS_NAMES, CAMPUS_UTMACH } from '@/lib/constants'
import { SearchX, MapPin, ChevronDown, X, RefreshCw, GraduationCap, Building2, LayoutGrid, AlertCircle } from 'lucide-react'

type DirectionFilter = 'all' | 'to_campus' | 'from_campus'

function TripSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 skeleton" />
          <div className="h-3 w-40 skeleton" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-6 h-16 skeleton" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 skeleton" />
          <div className="h-4 w-36 skeleton" />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="h-3 w-20 skeleton" />
        <div className="h-3 w-16 skeleton" />
        <div className="h-3 w-14 skeleton" />
      </div>
      <div className="h-10 w-full skeleton" />
    </div>
  )
}

export function TripFeed() {
  const [trips, setTrips] = useState<TripWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [filter, setFilter] = useState<string>('')
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all')
  const [campusFilter, setCampusFilter] = useState<string>('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchTrips()
  }, [])

  async function fetchTrips() {
    setFetchError(false)
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('id, origin, destination, departure_time, seats_available, price_contribution, status, users(full_name, whatsapp_number), vehicles(brand, model, color)')
        .eq('status', 'active')
        .gte('departure_time', new Date().toISOString())
        .order('departure_time', { ascending: true })
        .limit(50)

      if (error) throw error
      if (data) {
        setTrips(data as unknown as TripWithDetails[])
      }
    } catch {
      setFetchError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function handleRefresh() {
    setRefreshing(true)
    fetchTrips()
  }

  function isCampusName(name: string) {
    return ALL_CAMPUS_NAMES.some(
      (campus) => name.toLowerCase().includes(campus.toLowerCase()) || campus.toLowerCase().includes(name.toLowerCase())
    )
  }

  const filteredTrips = trips.filter((t) => {
    // Direction filter
    if (directionFilter === 'to_campus' && !isCampusName(t.destination)) return false
    if (directionFilter === 'from_campus' && !isCampusName(t.origin)) return false

    // Campus filter
    if (campusFilter) {
      const matchesOrigin = t.origin.toLowerCase().includes(campusFilter.toLowerCase())
      const matchesDest = t.destination.toLowerCase().includes(campusFilter.toLowerCase())
      if (!matchesOrigin && !matchesDest) return false
    }

    // Canton filter
    if (filter) {
      if (t.origin !== filter && t.destination !== filter) return false
    }

    return true
  })

  const directionTabs: { key: DirectionFilter; label: string; icon: typeof LayoutGrid }[] = [
    { key: 'all', label: 'Todos', icon: LayoutGrid },
    { key: 'to_campus', label: 'Ir a la U', icon: GraduationCap },
    { key: 'from_campus', label: 'Volver', icon: Building2 },
  ]

  return (
    <div className="space-y-4">
      {/* Direction Tabs */}
      <div className="flex rounded-xl bg-zinc-800/50 p-1 border border-zinc-700">
        {directionTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setDirectionFilter(key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              directionFilter === key
                ? 'bg-brand text-white shadow-lg shadow-brand/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Campus Pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setCampusFilter('')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            campusFilter === ''
              ? 'bg-brand/20 text-brand border-brand/30'
              : 'bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:text-zinc-200'
          }`}
        >
          Todos
        </button>
        {CAMPUS_UTMACH.map((campus) => (
          <button
            key={campus.id}
            onClick={() => setCampusFilter(campusFilter === campus.name ? '' : campus.name)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              campusFilter === campus.name
                ? 'bg-brand/20 text-brand border-brand/30'
                : 'bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:text-zinc-200'
            }`}
          >
            {campus.shortName}
          </button>
        ))}
      </div>

      {/* Canton Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700 text-sm font-medium text-white appearance-none focus:outline-none focus:ring-2 focus:ring-brand transition"
          >
            <option value="">Todas las ciudades</option>
            {CANTONES_EL_ORO.map((canton) => (
              <option key={canton} value={canton}>
                {canton}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>
        {filter && (
          <button
            onClick={() => setFilter('')}
            className="p-2.5 rounded-xl bg-red-900/30 text-red-400 hover:bg-red-900/50 transition"
            title="Limpiar filtro"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleRefresh}
          className={`p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:text-brand transition ${refreshing ? 'animate-spin' : ''}`}
          title="Actualizar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Active filters summary */}
      {(filter || campusFilter || directionFilter !== 'all') && (
        <div className="flex items-center gap-1.5 text-xs text-brand font-medium">
          <MapPin className="w-3 h-3" />
          {filteredTrips.length} viaje{filteredTrips.length !== 1 ? 's' : ''} encontrado{filteredTrips.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Trip list */}
      {loading ? (
        <div className="space-y-3">
          <TripSkeleton />
          <TripSkeleton />
          <TripSkeleton />
        </div>
      ) : fetchError ? (
        <div className="text-center py-10 space-y-3">
          <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <p className="text-zinc-400 font-medium">Error al cargar viajes</p>
          <p className="text-zinc-600 text-sm">Verifica tu conexion e intenta de nuevo</p>
          <button
            onClick={handleRefresh}
            className="mx-auto mt-2 px-4 py-2 rounded-lg bg-brand/20 text-brand text-sm font-medium hover:bg-brand/30 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto mb-2">
            <SearchX className="w-8 h-8 text-zinc-600" />
          </div>
          <p className="text-zinc-400 font-medium">No hay viajes disponibles</p>
          <p className="text-zinc-600 text-sm">
            Se el primero en publicar uno
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrips.map((trip, i) => (
            <div key={trip.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}>
              <TripCard trip={trip} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
