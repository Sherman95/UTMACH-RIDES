'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { isUtmachEmail } from '@/lib/utils'
import { Mail, Lock, Loader2, AlertCircle, UserPlus, LogIn, Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react'

type AuthMode = 'login' | 'register' | 'forgot'

export function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  function switchMode(newMode: AuthMode) {
    setMode(newMode)
    setError('')
    setResetSent(false)
  }

  function translateError(msg: string): string {
    const lower = msg.toLowerCase()
    if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials'))
      return 'Correo o contrasena incorrectos'
    if (lower.includes('email not confirmed'))
      return 'Debes confirmar tu correo antes de ingresar. Revisa tu bandeja de entrada.'
    if (lower.includes('user already registered') || lower.includes('already been registered'))
      return 'Este correo ya esta registrado. Intenta ingresar.'
    if (lower.includes('rate limit') || lower.includes('too many'))
      return 'Demasiados intentos. Espera unos minutos e intenta de nuevo.'
    if (lower.includes('password') && lower.includes('least'))
      return 'La contrasena debe tener al menos 6 caracteres'
    if (lower.includes('network') || lower.includes('fetch'))
      return 'Error de conexion. Verifica tu internet e intenta de nuevo.'
    return msg
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!isUtmachEmail(email)) {
      setError('Solo se permiten correos @utmachala.edu.ec')
      return
    }

    if (mode === 'forgot') {
      setLoading(true)
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
        setResetSent(true)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al enviar el correo'
        setError(translateError(message))
      } finally {
        setLoading(false)
      }
      return
    }

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres')
      return
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Las contrasenas no coinciden')
      return
    }

    setLoading(true)

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('full_name, whatsapp_number')
            .eq('id', user.id)
            .single()

          if (!profile?.full_name || !profile?.whatsapp_number) {
            router.push('/onboarding')
          } else {
            router.push('/dashboard')
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('full_name, whatsapp_number')
            .eq('id', user.id)
            .single()

          if (!profile?.full_name || !profile?.whatsapp_number) {
            router.push('/onboarding')
          } else {
            router.push('/dashboard')
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error de autenticacion'
      setError(translateError(message))
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'forgot') {
    return (
      <div className="w-full max-w-sm space-y-5">
        <button
          type="button"
          onClick={() => switchMode('login')}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al login
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-brand/20 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-brand" />
          </div>
          <h2 className="text-lg font-bold text-white">Recuperar contrasena</h2>
          <p className="text-sm text-zinc-400">
            Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contrasena.
          </p>
        </div>

        {resetSent ? (
          <div className="flex items-start gap-3 text-sm bg-emerald-900/20 rounded-xl p-4 border border-emerald-800/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-emerald-300">
              <p className="font-medium">Correo enviado</p>
              <p className="text-emerald-400/80 mt-1">
                Revisa tu bandeja de entrada en <span className="font-semibold">{email}</span> y sigue el enlace para restablecer tu contrasena.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                placeholder="tu.correo@utmachala.edu.ec"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 rounded-lg p-3 border border-red-800/30">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Enviar enlace
                </>
              )}
            </button>
          </form>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-5">
      {/* Tab Switcher */}
      <div className="flex rounded-xl bg-zinc-800/50 p-1">
        <button
          type="button"
          onClick={() => switchMode('login')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            mode === 'login'
              ? 'bg-brand text-white shadow-lg shadow-brand/20'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <LogIn className="w-4 h-4" />
          Ingresar
        </button>
        <button
          type="button"
          onClick={() => switchMode('register')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            mode === 'register'
              ? 'bg-brand text-white shadow-lg shadow-brand/20'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Registrarse
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="email"
            placeholder="tu.correo@utmachala.edu.ec"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Contrasena (min. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full pl-10 pr-12 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {mode === 'register' && (
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirmar contrasena"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
            />
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
              {mode === 'register' ? 'Creando cuenta...' : 'Ingresando...'}
            </>
          ) : mode === 'register' ? (
            <>
              <UserPlus className="w-5 h-5" />
              Crear cuenta
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Ingresar
            </>
          )}
        </button>

        {mode === 'login' && (
          <button
            type="button"
            onClick={() => switchMode('forgot')}
            className="w-full text-center text-sm text-zinc-500 hover:text-brand transition"
          >
            Olvide mi contrasena
          </button>
        )}
      </form>

      <p className="text-center text-zinc-600 text-xs">
        {mode === 'register'
          ? 'Al registrarte aceptas compartir tus datos con otros usuarios'
          : 'Solo se permiten correos institucionales @utmachala.edu.ec'}
      </p>
    </div>
  )
}
