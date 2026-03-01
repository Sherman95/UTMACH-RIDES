'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, User, Phone, AlertCircle, Car, ArrowRight, CheckCircle } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [step, setStep] = useState(1)

  const [fullName, setFullName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/')
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('full_name, whatsapp_number')
      .eq('id', user.id)
      .single()

    if (profile?.full_name && profile?.whatsapp_number) {
      router.push('/dashboard')
      return
    }

    setUserId(user.id)
    setEmail(user.email || '')
    setFullName(profile?.full_name || '')
    setWhatsapp(profile?.whatsapp_number || '')
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (step === 1) {
      if (!fullName.trim()) {
        setError('El nombre es obligatorio')
        return
      }
      setStep(2)
      return
    }

    if (!whatsapp.trim()) {
      setError('El número de WhatsApp es obligatorio')
      return
    }

    setSaving(true)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName.trim(),
          whatsapp_number: whatsapp.trim(),
        })
        .eq('id', userId!)

      if (error) throw error

      // Force Next.js to re-run middleware (which checks profile completeness)
      router.refresh()
      // Small delay to let middleware pick up the updated profile
      await new Promise((r) => setTimeout(r, 500))
      router.push('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar tu perfil. Intenta de nuevo.'
      setError(message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-950">
      <div className="w-full max-w-sm space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center gap-3 justify-center mb-4">
          <div className={`w-10 h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-brand' : 'bg-zinc-700'}`} />
          <div className={`w-10 h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-brand' : 'bg-zinc-700'}`} />
        </div>

        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in-up">
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse-glow shadow-lg shadow-brand/30">
            {step === 1 ? (
              <User className="w-8 h-8 text-white" />
            ) : (
              <Phone className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            {step === 1 ? '¿Cómo te llamas?' : '¿Tu WhatsApp?'}
          </h1>
          <p className="text-sm text-zinc-400">
            {step === 1
              ? 'Los demás usuarios verán tu nombre en los viajes'
              : 'Los pasajeros te contactarán por WhatsApp'}
          </p>
          <p className="text-xs text-zinc-600">📧 {email}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up stagger-2">
          {step === 1 ? (
            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Ej: Carlos Ramírez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoFocus
                className="w-full py-4 px-4 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand text-lg transition"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Show name confirmation */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-brand/10 border border-brand/20">
                <CheckCircle className="w-4 h-4 text-brand" />
                <span className="text-sm text-brand font-medium">{fullName}</span>
              </div>

              <input
                type="tel"
                placeholder="Ej: 0987654321"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                autoFocus
                className="w-full py-4 px-4 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand text-lg transition"
              />
              <p className="text-xs text-zinc-500">
                Los pasajeros te contactarán por aquí para coordinar el viaje
              </p>
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
            disabled={saving}
            className="w-full py-4 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : step === 1 ? (
              <>
                Siguiente
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <Car className="w-5 h-5" />
                ¡Empezar a viajar!
              </>
            )}
          </button>

          {step === 2 && (
            <button
              type="button"
              onClick={() => { setStep(1); setError('') }}
              className="w-full text-zinc-500 text-sm hover:text-zinc-300 transition"
            >
              ← Volver
            </button>
          )}
        </form>
      </div>
    </main>
  )
}
