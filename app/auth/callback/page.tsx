'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle } from 'lucide-react'

const TIMEOUT_MS = 15_000

export default function AuthCallbackPage() {
  const router = useRouter()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setTimedOut(true), TIMEOUT_MS)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      clearTimeout(timeout)

      // Password recovery flow — redirect to reset form
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/reset-password')
        return
      }

      if (event === 'SIGNED_IN') {
        const {
          data: { user },
        } = await supabase.auth.getUser()

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
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [router])

  if (timedOut) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-zinc-300 font-medium text-center">
          No se pudo verificar tu cuenta
        </p>
        <p className="text-zinc-500 text-sm text-center max-w-xs">
          El enlace puede haber expirado o hay problemas de conexion. Intenta iniciar sesion de nuevo.
        </p>
        <a
          href="/"
          className="mt-2 px-6 py-2.5 rounded-xl bg-brand/20 text-brand text-sm font-medium hover:bg-brand/30 transition-colors"
        >
          Volver al inicio
        </a>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-brand" />
      <p className="text-zinc-500 dark:text-zinc-400">
        Verificando tu cuenta...
      </p>
    </main>
  )
}
