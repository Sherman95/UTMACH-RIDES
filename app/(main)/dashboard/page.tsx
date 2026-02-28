'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { TripFeed } from '@/components/trips/TripFeed'
import { Car, TrendingUp, Users, Route, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ trips: 0, riders: 0 })
  const [statsError, setStatsError] = useState(false)

  const userName = profile?.full_name?.split(' ')[0] || ''

  useEffect(() => {
    Promise.all([
      supabase.from('trips').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('users').select('id', { count: 'exact', head: true }),
    ]).then(([tripRes, userRes]) => {
      if (tripRes.error || userRes.error) {
        setStatsError(true)
        return
      }
      setStats({
        trips: tripRes.count || 0,
        riders: userRes.count || 0,
      })
    }).catch(() => setStatsError(true))
  }, [])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos dias'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <main className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div>
          <p className="text-zinc-500 text-sm">{greeting()}</p>
          <h1 className="text-2xl font-extrabold text-white">
            {userName || 'UTMACH Rides'}
          </h1>
        </div>
        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
          <Car className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Stats Row */}
      {statsError ? (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 rounded-lg p-3 border border-red-800/30 mb-6 animate-fade-in-up stagger-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Error al cargar estadisticas. Intenta recargar la pagina.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in-up stagger-1">
          <div className="glass-card rounded-xl p-3 text-center stat-glow">
            <Route className="w-5 h-5 text-brand mx-auto mb-1" />
            <p className="text-xl font-extrabold text-white">{stats.trips}</p>
            <p className="text-[10px] text-zinc-500 font-medium">Viajes</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center stat-glow">
            <Users className="w-5 h-5 text-brand mx-auto mb-1" />
            <p className="text-xl font-extrabold text-white">{stats.riders}</p>
            <p className="text-[10px] text-zinc-500 font-medium">Usuarios</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center stat-glow">
            <TrendingUp className="w-5 h-5 text-brand mx-auto mb-1" />
            <p className="text-xl font-extrabold text-white">14</p>
            <p className="text-[10px] text-zinc-500 font-medium">Cantones</p>
          </div>
        </div>
      )}

      {/* Section title */}
      <div className="flex items-center justify-between mb-4 animate-fade-in-up stagger-2">
        <h2 className="font-bold text-white">Viajes disponibles</h2>
        <span className="text-xs text-zinc-500">Tiempo real</span>
      </div>

      {/* Trip feed */}
      <TripFeed />
    </main>
  )
}
