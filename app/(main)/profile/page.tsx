'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import {
  Loader2,
  User as UserIcon,
  Phone,
  LogOut,
  AlertCircle,
  ArrowLeft,
  Mail,
  MapPin,
  CheckCircle,
  Car,
  ChevronDown,
  Route,
  Star,
  GraduationCap,
  CreditCard,
  Building2,
  Users,
} from 'lucide-react'
import Link from 'next/link'

// Lazy load heavy sections - they render below the fold
const MyTrips = dynamic(() => import('@/components/trips/MyTrips').then(m => ({ default: m.MyTrips })), {
  loading: () => <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-brand" /></div>,
})
const MyPassengerTrips = dynamic(() => import('@/components/trips/MyPassengerTrips').then(m => ({ default: m.MyPassengerTrips })), {
  loading: () => <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-brand" /></div>,
})
const VehicleManager = dynamic(() => import('@/components/vehicles/VehicleManager').then(m => ({ default: m.VehicleManager })), {
  loading: () => <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-brand" /></div>,
})

const WHATSAPP_REGEX = /^(09\d{8}|\+?593\d{9})$/

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile: authProfile, refreshProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tripCount, setTripCount] = useState(0)
  const [loadingCount, setLoadingCount] = useState(true)

  const [fullName, setFullName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [showVehicles, setShowVehicles] = useState(false)
  const [showTrips, setShowTrips] = useState(false)
  const [showPassengerTrips, setShowPassengerTrips] = useState(false)

  // Sync form fields from auth context
  useEffect(() => {
    if (authProfile) {
      setFullName(authProfile.full_name || '')
      setWhatsapp(authProfile.whatsapp_number || '')
    }
  }, [authProfile])

  // Fetch trip count
  useEffect(() => {
    if (!user) return
    async function loadCount() {
      try {
        const { count } = await supabase
          .from('trips')
          .select('id', { count: 'exact', head: true })
          .eq('driver_id', user!.id)
        setTripCount(count || 0)
      } catch {
        // silently ignore
      } finally {
        setLoadingCount(false)
      }
    }
    loadCount()
  }, [user])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmedName = fullName.trim()
    const trimmedWhatsapp = whatsapp.trim()

    if (!trimmedName || trimmedName.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres')
      return
    }
    if (trimmedName.length > 100) {
      setError('El nombre no puede exceder 100 caracteres')
      return
    }
    if (!WHATSAPP_REGEX.test(trimmedWhatsapp)) {
      setError('Numero de WhatsApp invalido. Usa formato 09XXXXXXXX o +593XXXXXXXXX')
      return
    }
    if (!user) return

    setSaving(true)

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: trimmedName,
          whatsapp_number: trimmedWhatsapp,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      await refreshProfile()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loadingCount) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
        <Link
          href="/dashboard"
          className="p-2 -ml-2 rounded-xl hover:bg-zinc-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </Link>
        <h1 className="text-xl font-extrabold text-white">Mi perfil</h1>
      </div>

      {/* Profile Card */}
      <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-in-up stagger-1">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center ring-2 ring-brand/30">
            <span className="text-brand font-bold text-2xl">
              {(fullName || 'U')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{fullName || 'Usuario'}</h2>
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {authProfile?.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-extrabold text-brand">{authProfile?.total_trips ?? tripCount}</p>
            <p className="text-[10px] text-zinc-500">Viajes</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            {authProfile?.average_rating != null ? (
              <>
                <p className="text-lg font-extrabold text-amber-400 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400" /> {authProfile.average_rating.toFixed(1)}
                </p>
                <p className="text-[10px] text-zinc-500">{authProfile.total_ratings} calif.</p>
              </>
            ) : (
              <>
                <p className="text-lg font-extrabold text-zinc-500">--</p>
                <p className="text-[10px] text-zinc-500">Sin calif.</p>
              </>
            )}
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-extrabold text-brand">{tripCount}</p>
            <p className="text-[10px] text-zinc-500">Publicados</p>
          </div>
        </div>

        {/* Academic info */}
        {authProfile?.carrera && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <GraduationCap className="w-3.5 h-3.5 text-brand" />
              <span>{authProfile.carrera}</span>
            </div>
            {authProfile.facultad && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Building2 className="w-3.5 h-3.5 text-brand" />
                <span>{authProfile.facultad}</span>
              </div>
            )}
            {authProfile.cedula && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <CreditCard className="w-3.5 h-3.5 text-brand" />
                <span>CI: {authProfile.cedula.slice(0, 4)}******</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Form */}
      <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-in-up stagger-2">
        <h3 className="font-bold text-white mb-4">Editar datos</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4" /> Nombre completo
            </label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full py-3 px-4 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
              <Phone className="w-4 h-4" /> WhatsApp
            </label>
            <input
              type="tel"
              placeholder="0987654321"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              className="w-full py-3 px-4 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand transition"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 rounded-lg p-3 border border-red-800/30">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : success ? (
              <>
                <CheckCircle className="w-5 h-5" />
                ¡Guardado!
              </>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </form>
      </div>

      {/* My Vehicles - Collapsible */}
      <div className="mb-4 animate-fade-in-up stagger-2">
        <button
          onClick={() => setShowVehicles(!showVehicles)}
          className="w-full flex items-center justify-between py-3 px-4 glass-card rounded-xl hover:bg-zinc-800/30 transition-colors"
        >
          <span className="font-bold text-white flex items-center gap-2">
            <Car className="w-4 h-4 text-brand" />
            Mis vehiculos
          </span>
          <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${showVehicles ? 'rotate-180' : ''}`} />
        </button>
        {showVehicles && (
          <div className="mt-3">
            <VehicleManager />
          </div>
        )}
      </div>

      {/* My Trips - Collapsible */}
      <div className="mb-4 animate-fade-in-up stagger-2">
        <button
          onClick={() => setShowTrips(!showTrips)}
          className="w-full flex items-center justify-between py-3 px-4 glass-card rounded-xl hover:bg-zinc-800/30 transition-colors"
        >
          <span className="font-bold text-white flex items-center gap-2">
            <Route className="w-4 h-4 text-brand" />
            Mis viajes publicados
            {tripCount > 0 && (
              <span className="text-xs bg-brand/20 text-brand px-2 py-0.5 rounded-full">{tripCount}</span>
            )}
          </span>
          <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${showTrips ? 'rotate-180' : ''}`} />
        </button>
        {showTrips && (
          <div className="mt-3">
            <MyTrips />
          </div>
        )}
      </div>

      {/* My Passenger Trips - Collapsible */}
      <div className="mb-4 animate-fade-in-up stagger-2">
        <button
          onClick={() => setShowPassengerTrips(!showPassengerTrips)}
          className="w-full flex items-center justify-between py-3 px-4 glass-card rounded-xl hover:bg-zinc-800/30 transition-colors"
        >
          <span className="font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-brand" />
            Viajes como pasajero
          </span>
          <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${showPassengerTrips ? 'rotate-180' : ''}`} />
        </button>
        {showPassengerTrips && (
          <div className="mt-3">
            <MyPassengerTrips />
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="animate-fade-in-up stagger-3">
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border border-red-800/50 text-red-400 font-medium hover:bg-red-900/20 transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </main>
  )
}
