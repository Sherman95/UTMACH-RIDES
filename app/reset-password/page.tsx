'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

const LINK_TIMEOUT_MS = 20_000

type PasswordStrength = 'weak' | 'medium' | 'strong'

function getPasswordStrength(pw: string): { level: PasswordStrength; label: string; percent: number } {
  if (pw.length === 0) return { level: 'weak', label: '', percent: 0 }
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 2) return { level: 'weak', label: 'Debil', percent: 33 }
  if (score <= 3) return { level: 'medium', label: 'Aceptable', percent: 66 }
  return { level: 'strong', label: 'Fuerte', percent: 100 }
}

const strengthColors: Record<PasswordStrength, string> = {
  weak: 'bg-red-500',
  medium: 'bg-amber-500',
  strong: 'bg-emerald-500',
}

const strengthIcons: Record<PasswordStrength, typeof ShieldCheck> = {
  weak: ShieldX,
  medium: ShieldAlert,
  strong: ShieldCheck,
}

function translateError(msg: string): string {
  const lower = msg.toLowerCase()
  if (lower.includes('same password') || lower.includes('should be different'))
    return 'La nueva contrasena debe ser diferente a la anterior'
  if (lower.includes('session') || lower.includes('not authenticated') || lower.includes('jwt'))
    return 'Tu enlace ha expirado. Solicita uno nuevo desde la pagina de inicio.'
  if (lower.includes('password') && lower.includes('least'))
    return 'La contrasena debe tener al menos 6 caracteres'
  if (lower.includes('rate limit') || lower.includes('too many'))
    return 'Demasiados intentos. Espera unos minutos.'
  if (lower.includes('network') || lower.includes('fetch'))
    return 'Error de conexion. Verifica tu internet.'
  return msg
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const [linkExpired, setLinkExpired] = useState(false)

  const strength = useMemo(() => getPasswordStrength(password), [password])
  const StrengthIcon = strengthIcons[strength.level]

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!ready) setLinkExpired(true)
    }, LINK_TIMEOUT_MS)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        clearTimeout(timeout)
        setReady(true)
      }
    })

    // Also check if session already exists (user clicked link and got redirected)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        clearTimeout(timeout)
        setReady(true)
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres')
      return
    }

    if (strength.level === 'weak') {
      setError('La contrasena es muy debil. Agrega mayusculas, numeros o simbolos.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar la contrasena'
      setError(translateError(message))
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full pl-10 pr-12 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition'

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand/20 flex items-center justify-center">
            <KeyRound className="w-7 h-7 text-brand" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Nueva contrasena</h1>
          <p className="text-sm text-zinc-400">
            Ingresa tu nueva contrasena para tu cuenta UTMACH Rides
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-sm bg-emerald-900/20 rounded-xl p-4 border border-emerald-800/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-emerald-300">
                <p className="font-medium">Contrasena actualizada correctamente</p>
                <p className="text-emerald-400/80 mt-1">
                  Redirigiendo al dashboard...
                </p>
              </div>
            </div>
          </div>
        ) : linkExpired ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3 text-sm bg-red-900/20 rounded-xl p-4 border border-red-800/30">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-red-300">
                <p className="font-medium">Enlace expirado o invalido</p>
                <p className="text-red-400/80 mt-1">
                  El enlace de recuperacion ya no es valido. Esto puede pasar si el enlace
                  ya fue utilizado, expiro, o se copio de forma incompleta.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition-colors shadow-lg shadow-brand/20"
              >
                <ArrowLeft className="w-4 h-4" />
                Solicitar nuevo enlace
              </Link>
              <p className="text-xs text-zinc-600 text-center">
                Ve a la pagina de inicio, toca &quot;Olvide mi contrasena&quot; y solicita un enlace nuevo.
              </p>
            </div>
          </div>
        ) : !ready ? (
          <div className="text-center space-y-4 py-8">
            <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto" />
            <p className="text-sm text-zinc-400">Verificando enlace de recuperacion...</p>
            <p className="text-xs text-zinc-600">Esto solo toma unos segundos</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nueva contrasena"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  maxLength={72}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Strength indicator */}
              {password.length > 0 && (
                <div className="space-y-1.5 px-1">
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strengthColors[strength.level]}`}
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-zinc-500">
                      <StrengthIcon className="w-3.5 h-3.5" />
                      {strength.label}
                    </span>
                    <span className="text-zinc-600">Min. 6 caracteres</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirmar contrasena"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                maxLength={72}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
              />
            </div>

            {/* Mismatch warning (live) */}
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <div className="flex items-center gap-2 text-amber-400 text-xs px-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Las contrasenas no coinciden
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 rounded-lg p-3 border border-red-800/30">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || password.length < 6 || confirmPassword.length < 6}
              className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  Actualizar contrasena
                </>
              )}
            </button>

            {/* Tips */}
            <div className="text-xs text-zinc-600 space-y-1 px-1">
              <p>Recomendaciones para una contrasena segura:</p>
              <ul className="list-disc list-inside space-y-0.5 text-zinc-700">
                <li>Al menos 8 caracteres</li>
                <li>Incluye mayusculas y minusculas</li>
                <li>Incluye numeros y simbolos (!@#$)</li>
                <li>No uses tu nombre o correo</li>
              </ul>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
