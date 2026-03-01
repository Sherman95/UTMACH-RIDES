'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, Users, GraduationCap } from 'lucide-react'
import RateButton from './RateButton'

type AcceptedPassenger = {
  passengerId: string
  fullName: string
  carrera: string | null
}

interface CompletedPassengersProps {
  tripId: string
}

export default function CompletedPassengers({ tripId }: CompletedPassengersProps) {
  const [passengers, setPassengers] = useState<AcceptedPassenger[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('trip_requests')
        .select('passenger_id, users:passenger_id(full_name, carrera)')
        .eq('trip_id', tripId)
        .eq('status', 'accepted')

      const mapped: AcceptedPassenger[] = (data ?? []).map((r: Record<string, unknown>) => {
        const u = r.users as Record<string, unknown> | null
        return {
          passengerId: r.passenger_id as string,
          fullName: (u?.full_name as string) ?? 'Pasajero',
          carrera: (u?.carrera as string) ?? null,
        }
      })
      setPassengers(mapped)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-3">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (passengers.length === 0) return null

  return (
    <div className="space-y-2 border-t border-zinc-800 pt-3">
      <div className="flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5 text-brand" />
        <h4 className="text-xs font-semibold text-white">
          Pasajeros ({passengers.length}) - Calificar
        </h4>
      </div>
      {passengers.map((p) => (
        <div key={p.passengerId} className="p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">{p.fullName}</p>
              {p.carrera && (
                <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-2.5 h-2.5" /> {p.carrera}
                </p>
              )}
            </div>
          </div>
          <RateButton
            tripId={tripId}
            toUserId={p.passengerId}
            toUserName={p.fullName}
          />
        </div>
      ))}
    </div>
  )
}
