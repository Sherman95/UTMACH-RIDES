'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { CANTONES_EL_ORO, CAMPUS_UTMACH, TRIP_DIRECTIONS } from '@/lib/constants'
import type { TripDirection, CampusInfo } from '@/lib/constants'
import { Vehicle } from '@/types/database'
import {
  Loader2,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Car,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  ArrowRightLeft,
  GraduationCap,
  Building2,
  Info,
} from 'lucide-react'
import Link from 'next/link'

export default function NewRidePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [showVehicleForm, setShowVehicleForm] = useState(false)

  // Direction & Campus
  const [direction, setDirection] = useState<TripDirection>('to_campus')
  const [selectedCampus, setSelectedCampus] = useState<CampusInfo>(CAMPUS_UTMACH[0])

  // Trip fields
  const [canton, setCanton] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [seatsAvailable, setSeatsAvailable] = useState(3)
  const [priceContribution, setPriceContribution] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('')

  // Vehicle fields
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [color, setColor] = useState('')
  const [licensePlate, setLicensePlate] = useState('')

  // Derived origin/destination based on direction
  const origin = direction === 'to_campus' ? canton : selectedCampus.name
  const destination = direction === 'to_campus' ? selectedCampus.name : canton

  useEffect(() => {
    if (!user) return
    async function loadVehicles() {
      try {
        const { data } = await supabase
          .from('vehicles')
          .select('id, brand, model, color, license_plate, driver_id, created_at')
          .eq('driver_id', user!.id)
        if (data && data.length > 0) {
          setVehicles(data)
          setSelectedVehicle(data[0].id)
        } else {
          setShowVehicleForm(true)
        }
      } catch {
        setShowVehicleForm(true)
      }
    }
    loadVehicles()
  }, [user])

  function fireConfetti() {
    import('canvas-confetti').then(({ default: confetti }) => {
      const duration = 3000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#204e99', '#5b8fd9', '#ffffff'],
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#204e99', '#5b8fd9', '#ffffff'],
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!canton) {
      setError('Selecciona un canton')
      return
    }

    if (origin === destination) {
      setError('El origen y destino no pueden ser iguales')
      return
    }

    const price = parseFloat(priceContribution)
    if (isNaN(price) || price < 0) {
      setError('Aporte invalido')
      return
    }
    if (price > 50) {
      setError('El aporte maximo es $50.00')
      return
    }

    if (showVehicleForm) {
      if (!brand.trim() || !model.trim() || !color.trim()) {
        setError('Marca, modelo y color del vehiculo son obligatorios')
        return
      }
      if (brand.length > 50 || model.length > 50 || color.length > 30) {
        setError('Los campos del vehiculo son demasiado largos')
        return
      }
    }

    setLoading(true)

    try {
      if (!user) throw new Error('No autenticado')

      let vehicleId = selectedVehicle

      if (showVehicleForm) {
        const { data: vehicle, error: vError } = await supabase
          .from('vehicles')
          .insert({
            driver_id: user.id,
            brand: brand.trim(),
            model: model.trim(),
            color: color.trim(),
            license_plate: licensePlate.trim() || null,
          })
          .select()
          .single()

        if (vError) throw vError
        vehicleId = vehicle.id
      }

      const departureDateTime = new Date(
        `${departureDate}T${departureTime}`
      )

      const { error: tError } = await supabase.from('trips').insert({
        driver_id: user.id,
        vehicle_id: vehicleId,
        origin,
        destination,
        departure_time: departureDateTime.toISOString(),
        seats_available: seatsAvailable,
        price_contribution: price,
      })

      if (tError) throw tError

      fireConfetti()
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al crear el viaje'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  const inputClass =
    'w-full py-3 px-4 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand transition'

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
        <div className="flex-1">
          <h1 className="text-xl font-extrabold text-white">Publicar viaje</h1>
          <p className="text-xs text-zinc-500">Comparte tu ruta con companeros</p>
        </div>
        <Sparkles className="w-6 h-6 text-brand animate-float" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up stagger-2">
        {/* Direction Toggle */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-brand" /> Direccion del viaje
          </label>
          <div className="flex rounded-xl bg-zinc-800/50 p-1 border border-zinc-700">
            {(Object.entries(TRIP_DIRECTIONS) as [TripDirection, { label: string; description: string }][]).map(
              ([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDirection(key)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    direction === key
                      ? 'bg-brand text-white shadow-lg shadow-brand/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {key === 'to_campus' ? (
                    <GraduationCap className="w-4 h-4" />
                  ) : (
                    <Building2 className="w-4 h-4" />
                  )}
                  {value.label}
                </button>
              )
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {TRIP_DIRECTIONS[direction].description}
          </p>
        </div>

        {/* Campus Selector */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-brand" /> Campus
          </label>
          <select
            value={selectedCampus.id}
            onChange={(e) => {
              const campus = CAMPUS_UTMACH.find((c) => c.id === e.target.value)
              if (campus) setSelectedCampus(campus)
            }}
            className={inputClass}
          >
            {CAMPUS_UTMACH.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.shortName}
              </option>
            ))}
          </select>
          <div className="flex items-start gap-2 text-xs text-zinc-500 bg-zinc-800/30 rounded-lg p-2.5 border border-zinc-800">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            {selectedCampus.description}
          </div>
        </div>

        {/* Canton */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-400" />
            {direction === 'to_campus' ? 'Salgo desde' : 'Voy hacia'}
          </label>
          <select
            value={canton}
            onChange={(e) => setCanton(e.target.value)}
            required
            className={inputClass}
          >
            <option value="">Selecciona canton</option>
            {CANTONES_EL_ORO.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Route Preview */}
        {canton && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass border border-zinc-700">
            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-2.5 bg-brand rounded-full shadow-sm shadow-brand/50" />
              <div className="w-0.5 h-5 bg-gradient-to-b from-brand to-red-500 rounded-full" />
              <MapPin className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-white">{origin}</p>
              <p className="text-sm font-medium text-white">{destination}</p>
            </div>
          </div>
        )}

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Fecha
            </label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              min={today}
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Hora</label>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              required
              className={inputClass}
            />
          </div>
        </div>

        {/* Seats & Price */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Asientos
            </label>
            <select
              value={seatsAvailable}
              onChange={(e) => setSeatsAvailable(Number(e.target.value))}
              className={inputClass}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" /> Aporte ($)
            </label>
            <input
              type="number"
              step="0.25"
              min="0"
              max="50"
              placeholder="1.50"
              value={priceContribution}
              onChange={(e) => setPriceContribution(e.target.value)}
              required
              className={inputClass}
            />
          </div>
        </div>

        {/* Vehicle selection or creation */}
        {!showVehicleForm && vehicles.length > 0 ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
              <Car className="w-4 h-4" /> Vehiculo
            </label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className={inputClass}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} - {v.color}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowVehicleForm(true)}
              className="text-xs text-brand hover:underline"
            >
              + Agregar otro vehiculo
            </button>
          </div>
        ) : (
          <div className="space-y-3 p-4 rounded-xl glass border border-zinc-700">
            <p className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
              <Car className="w-4 h-4" /> Datos del vehiculo
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Marca (Chevrolet)"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                maxLength={50}
                className="py-2.5 px-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <input
                type="text"
                placeholder="Modelo (Aveo)"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                maxLength={50}
                className="py-2.5 px-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                required
                maxLength={30}
                className="py-2.5 px-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <input
                type="text"
                placeholder="Placa (opcional)"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="py-2.5 px-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            {vehicles.length > 0 && (
              <button
                type="button"
                onClick={() => setShowVehicleForm(false)}
                className="text-xs text-zinc-500 hover:underline"
              >
                Usar vehiculo existente
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 rounded-lg p-3 border border-red-800/30">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Publicando...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Publicar viaje
            </>
          )}
        </button>
      </form>
    </main>
  )
}
