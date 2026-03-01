'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  FACULTADES_UTMACH,
  getCarreraLabel,
  getFacultadByCarrera,
  validarCedula,
  validarNombreCompleto,
  validarWhatsApp,
} from '@/lib/constants'
import {
  Loader2,
  User,
  Phone,
  CreditCard,
  GraduationCap,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
} from 'lucide-react'

type FieldErrors = {
  fullName?: string
  cedula?: string
  facultad?: string
  carrera?: string
  whatsapp?: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [userId, setUserId] = useState<string | null>(null)

  const [step, setStep] = useState(1)

  // Step 1
  const [fullName, setFullName] = useState('')
  const [cedula, setCedula] = useState('')

  // Step 2
  const [selectedFacultad, setSelectedFacultad] = useState('')
  const [selectedCarrera, setSelectedCarrera] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  const facultadObj = FACULTADES_UTMACH.find((f) => f.id === selectedFacultad)
  const carrerasDisponibles = facultadObj?.carreras ?? []

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data: profile } = await supabase
        .from('users')
        .select('full_name, whatsapp_number, cedula, carrera, facultad')
        .eq('id', user.id)
        .single()

      if (profile?.full_name && profile?.whatsapp_number && profile?.cedula && profile?.carrera && profile?.facultad) {
        window.location.href = '/dashboard'
        return
      }

      setUserId(user.id)
      if (profile?.full_name) setFullName(profile.full_name)
      if (profile?.whatsapp_number) setWhatsapp(profile.whatsapp_number)
      setLoading(false)
    }
    checkUser()
  }, [router])

  /* ─── Validation ────────────────────────────────────── */
  function validateStep1(): boolean {
    const errors: FieldErrors = {}
    if (!fullName.trim()) {
      errors.fullName = 'El nombre es obligatorio'
    } else if (!validarNombreCompleto(fullName)) {
      errors.fullName = 'Ingresa nombre y apellido (solo letras)'
    }
    if (!cedula.trim()) {
      errors.cedula = 'La cedula es obligatoria'
    } else if (!validarCedula(cedula)) {
      errors.cedula = 'Cedula ecuatoriana invalida'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  function validateStep2(): boolean {
    const errors: FieldErrors = {}
    if (!selectedFacultad) errors.facultad = 'Selecciona tu facultad'
    if (!selectedCarrera) errors.carrera = 'Selecciona tu carrera'
    if (!whatsapp.trim()) {
      errors.whatsapp = 'El WhatsApp es obligatorio'
    } else if (!validarWhatsApp(whatsapp)) {
      errors.whatsapp = 'Formato invalido. Usa 09XXXXXXXX'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleNextStep() {
    if (validateStep1()) { setFieldErrors({}); setStep(2) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateStep2()) return

    setError('')
    setSaving(true)

    try {
      if (!userId) throw new Error('No autenticado')

      const carreraLabel = selectedCarrera
      const facultadNombre = getFacultadByCarrera(carreraLabel) ?? ''

      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: fullName.trim(),
          whatsapp_number: whatsapp.trim(),
          cedula: cedula.trim(),
          carrera: carreraLabel,
          facultad: facultadNombre,
        })
        .eq('id', userId)

      if (updateError) throw updateError

      // Hard navigation to avoid middleware cache issues
      window.location.href = '/dashboard'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar'
      if (msg.includes('users_cedula_key') || msg.includes('duplicate')) {
        setError('Esta cedula ya esta registrada en otra cuenta')
      } else {
        setError(msg)
      }
      setSaving(false)
    }
  }

  const inputClass =
    'w-full py-3 px-4 rounded-xl bg-zinc-800/50 border text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand transition'

  function FieldError({ message }: { message?: string }) {
    if (!message) return null
    return (
      <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        {message}
      </p>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-zinc-950">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 mb-4">
            <Shield className="w-8 h-8 text-brand" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Completa tu perfil</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Verificamos tu identidad para mantener la comunidad segura
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
          <div className="flex-1 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= 1 ? 'bg-brand text-white shadow-lg shadow-brand/30' : 'bg-zinc-800 text-zinc-500'
            }`}>
              {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <span className={`text-xs font-medium ${step >= 1 ? 'text-white' : 'text-zinc-500'}`}>
              Datos personales
            </span>
          </div>
          <div className="w-8 h-0.5 bg-zinc-700 rounded-full overflow-hidden">
            <div className={`h-full bg-brand transition-all duration-500 ${step >= 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= 2 ? 'bg-brand text-white shadow-lg shadow-brand/30' : 'bg-zinc-800 text-zinc-500'
            }`}>
              2
            </div>
            <span className={`text-xs font-medium ${step >= 2 ? 'text-white' : 'text-zinc-500'}`}>
              Academico + contacto
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up stagger-2">
          {/* ─── STEP 1: Datos personales ─── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand" /> Nombre completo
                </label>
                <input
                  type="text"
                  placeholder="Nombres y Apellidos Ej: Juan Carlos Perez Lopez"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: undefined }))
                  }}
                  maxLength={100}
                  autoFocus
                  className={`${inputClass} ${fieldErrors.fullName ? 'border-red-500/50' : 'border-zinc-700'}`}
                />
                <FieldError message={fieldErrors.fullName} />
                <p className="text-xs text-zinc-500">Tal como aparece en tu cedula</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-brand" /> Cedula de identidad
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0705XXXXXX"
                  value={cedula}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setCedula(val)
                    if (fieldErrors.cedula) setFieldErrors((p) => ({ ...p, cedula: undefined }))
                  }}
                  maxLength={10}
                  className={`${inputClass} ${fieldErrors.cedula ? 'border-red-500/50' : 'border-zinc-700'}`}
                />
                <FieldError message={fieldErrors.cedula} />
                <p className="text-xs text-zinc-500">10 digitos. Verifica tu identidad como estudiante UTMACH.</p>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
              >
                Siguiente <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ─── STEP 2: Academico + contacto ─── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-brand" /> Facultad
                </label>
                <select
                  value={selectedFacultad}
                  onChange={(e) => {
                    setSelectedFacultad(e.target.value)
                    setSelectedCarrera('')
                    if (fieldErrors.facultad) setFieldErrors((p) => ({ ...p, facultad: undefined }))
                  }}
                  className={`${inputClass} ${fieldErrors.facultad ? 'border-red-500/50' : 'border-zinc-700'}`}
                >
                  <option value="">Selecciona tu facultad</option>
                  {FACULTADES_UTMACH.map((f) => (
                    <option key={f.id} value={f.id}>{f.nombre}</option>
                  ))}
                </select>
                <FieldError message={fieldErrors.facultad} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-brand" /> Carrera
                </label>
                <select
                  value={selectedCarrera}
                  onChange={(e) => {
                    setSelectedCarrera(e.target.value)
                    if (fieldErrors.carrera) setFieldErrors((p) => ({ ...p, carrera: undefined }))
                  }}
                  disabled={!selectedFacultad}
                  className={`${inputClass} ${fieldErrors.carrera ? 'border-red-500/50' : 'border-zinc-700'} ${!selectedFacultad ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">{selectedFacultad ? 'Selecciona tu carrera' : 'Primero selecciona una facultad'}</option>
                  {carrerasDisponibles.map((c) => {
                    const label = getCarreraLabel(c)
                    return <option key={label} value={label}>{label}</option>
                  })}
                </select>
                <FieldError message={fieldErrors.carrera} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-brand" /> WhatsApp
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="0991234567"
                  value={whatsapp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d+]/g, '').slice(0, 13)
                    setWhatsapp(val)
                    if (fieldErrors.whatsapp) setFieldErrors((p) => ({ ...p, whatsapp: undefined }))
                  }}
                  maxLength={13}
                  className={`${inputClass} ${fieldErrors.whatsapp ? 'border-red-500/50' : 'border-zinc-700'}`}
                />
                <FieldError message={fieldErrors.whatsapp} />
                <p className="text-xs text-zinc-500">Solo visible para conductores que acepten tu solicitud</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 rounded-lg p-3 border border-red-800/30">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setFieldErrors({}); setStep(1) }}
                  className="flex-1 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-all flex items-center justify-center gap-2 border border-zinc-700"
                >
                  <ArrowLeft className="w-5 h-5" /> Atras
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] py-3.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
                >
                  {saving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Completar perfil</>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  )
}
