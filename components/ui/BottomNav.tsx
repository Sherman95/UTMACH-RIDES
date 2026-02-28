'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, User } from 'lucide-react'

export const BottomNav = React.memo(function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="max-w-lg mx-auto px-4 pb-2">
        <div className="glass rounded-2xl px-6 py-3 flex justify-around items-center">
          {/* Home */}
          <Link
            href="/dashboard"
            prefetch
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
              pathname === '/dashboard'
                ? 'text-brand'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Inicio</span>
          </Link>

          {/* Center: Publish */}
          <Link
            href="/rides/new"
            prefetch
            className="relative -mt-8"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${
              pathname === '/rides/new'
                ? 'bg-brand shadow-brand/40 scale-110'
                : 'bg-brand shadow-brand/30'
            }`}>
              <Plus className="w-7 h-7 text-white" />
            </div>
            <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap ${
              pathname === '/rides/new' ? 'text-brand' : 'text-zinc-500'
            }`}>
              Publicar
            </span>
          </Link>

          {/* Profile */}
          <Link
            href="/profile"
            prefetch
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
              pathname === '/profile'
                ? 'text-brand'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Perfil</span>
          </Link>
        </div>
      </div>
    </nav>
  )
})
