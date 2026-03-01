'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Star, Loader2, CheckCircle2, Send } from 'lucide-react'

interface RateButtonProps {
  tripId: string
  toUserId: string
  toUserName: string
}

export default function RateButton({ tripId, toUserId, toUserName }: RateButtonProps) {
  const { user } = useAuth()
  const [score, setScore] = useState(0)
  const [hovering, setHovering] = useState(0)
  const [comment, setComment] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alreadyRated, setAlreadyRated] = useState(false)
  const [existingScore, setExistingScore] = useState(0)
  const [checking, setChecking] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) { setChecking(false); return }

    async function check() {
      try {
        const { data } = await supabase
          .from('ratings')
          .select('score')
          .eq('trip_id', tripId)
          .eq('from_user_id', user!.id)
          .eq('to_user_id', toUserId)
          .maybeSingle()

        if (data) {
          setAlreadyRated(true)
          setExistingScore(data.score)
        }
      } catch {
        // ignore
      } finally {
        setChecking(false)
      }
    }
    check()
  }, [user, tripId, toUserId])

  async function handleSubmit() {
    if (!user || !score || loading) return
    setLoading(true)

    try {
      const { error } = await supabase.from('ratings').insert({
        trip_id: tripId,
        from_user_id: user.id,
        to_user_id: toUserId,
        score,
        comment: comment.trim() || null,
      })

      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          setAlreadyRated(true)
          setExistingScore(score)
        } else {
          throw error
        }
        return
      }

      setAlreadyRated(true)
      setExistingScore(score)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  if (checking) return null

  // Already rated - show static score
  if (alreadyRated) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3.5 h-3.5 ${s <= existingScore ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`}
            />
          ))}
        </div>
        <span className="text-[10px] text-zinc-500">Calificado</span>
      </div>
    )
  }

  // Compact trigger
  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-1.5 text-[10px] text-amber-400 hover:text-amber-300 font-medium transition"
      >
        <Star className="w-3.5 h-3.5" />
        Calificar
      </button>
    )
  }

  // Rating form
  const firstName = toUserName.split(' ')[0]

  return (
    <div className="mt-2 p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700 space-y-2">
      <p className="text-[10px] text-zinc-400">
        Como fue tu experiencia con <span className="text-white font-medium">{firstName}</span>?
      </p>

      {/* Stars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setScore(s)}
            onMouseEnter={() => setHovering(s)}
            onMouseLeave={() => setHovering(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                s <= (hovering || score)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-zinc-600'
              }`}
            />
          </button>
        ))}
        {score > 0 && (
          <span className="text-xs text-zinc-400 ml-1 self-center">
            {score === 1 ? 'Malo' : score === 2 ? 'Regular' : score === 3 ? 'Bien' : score === 4 ? 'Muy bien' : 'Excelente'}
          </span>
        )}
      </div>

      {/* Optional comment */}
      <input
        type="text"
        placeholder="Comentario opcional..."
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 200))}
        maxLength={200}
        className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-900/50 border border-zinc-700 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand transition"
      />

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!score || loading}
          className="flex-1 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : success ? (
            <><CheckCircle2 className="w-3 h-3" /> Enviado</>
          ) : (
            <><Send className="w-3 h-3" /> Enviar</>
          )}
        </button>
        <button
          onClick={() => { setShowForm(false); setScore(0); setComment('') }}
          className="py-1.5 px-3 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-medium hover:bg-zinc-700 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
