'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  whatsapp_number: string | null
  cedula: string | null
  carrera: string | null
  facultad: string | null
  average_rating: number | null
  total_ratings: number
}

interface AuthContextType {
  user: SupabaseUser | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async (userId: string, email: string) => {
    try {
      const { data, error: profileError } = await supabase
        .from('users')
        .select('id, email, full_name, whatsapp_number, cedula, carrera, facultad, average_rating, total_ratings')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      setProfile(data ? { ...data, email: data.email || email } : null)
    } catch {
      setError('Error al cargar el perfil')
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    await fetchProfile(user.id, user.email || '')
  }, [user, fetchProfile])

  useEffect(() => {
    // Initial load: validate session server-side with getUser
    supabase.auth.getUser().then(({ data: { user: authUser }, error: authError }) => {
      if (authError || !authUser) {
        setLoading(false)
        return
      }
      setUser(authUser)
      fetchProfile(authUser.id, authUser.email || '').finally(() => setLoading(false))
    })

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null
      setUser(authUser)
      if (authUser) {
        fetchProfile(authUser.id, authUser.email || '')
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
