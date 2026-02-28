'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { BottomNav } from '@/components/ui/BottomNav'
import { Car } from 'lucide-react'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/')
      return
    }

    if (!profile?.full_name || !profile?.whatsapp_number) {
      router.push('/onboarding')
    }
  }, [user, profile, loading, router])

  if (loading || !user || !profile?.full_name || !profile?.whatsapp_number) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 gap-3">
        <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/30">
          <Car className="w-6 h-6 text-white animate-pulse" />
        </div>
        <p className="text-zinc-500 text-sm">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      {children}
      <BottomNav />
    </div>
  )
}
