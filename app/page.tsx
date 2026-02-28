'use client'

import { useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import Image from 'next/image'
import { Users, Shield, Zap, MapPin, ChevronRight, Github } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Comunidad UTMACH',
    desc: 'Solo estudiantes verificados con correo @utmachala.edu.ec',
  },
  {
    icon: Shield,
    title: 'Viajes seguros',
    desc: 'Conoce a tu conductor antes de subir al auto vía WhatsApp',
  },
  {
    icon: Zap,
    title: 'Rápido y fácil',
    desc: 'Publica o encuentra un viaje en menos de 30 segundos',
  },
  {
    icon: MapPin,
    title: 'El Oro cubierto',
    desc: 'Piñas, Pasaje, Santa Rosa, El Guabo, Zaruma y más',
  },
]

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <main className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Hero gradient background */}
      <div className="hero-gradient absolute inset-0 pointer-events-none" />



      <div className="relative max-w-lg mx-auto px-6 pt-16 pb-12">
        {/* Logo */}
        <div className="animate-fade-in-up flex flex-col items-center">
          <div className="w-24 h-24 rounded-3xl overflow-hidden mb-6 shadow-lg shadow-brand/30">
            <Image
              src="/logoutmachrides.png"
              alt="UTMACH Rides Logo"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          <h1 className="text-4xl font-extrabold text-center mb-3">
            <span className="gradient-text">UTMACH</span>{' '}
            <span className="text-white">Rides</span>
          </h1>

          <p className="text-zinc-400 text-center text-lg max-w-xs mb-2">
            Carpooling universitario para estudiantes de la UTMACH
          </p>

          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-8">
            <MapPin className="w-3 h-3" />
            El Oro, Ecuador
          </div>
        </div>

        {/* CTA or Login Form */}
        {!showLogin ? (
          <div className="animate-fade-in-up stagger-2 space-y-4">
            <button
              onClick={() => setShowLogin(true)}
              className="w-full py-4 rounded-2xl bg-brand hover:bg-brand-dark text-white font-bold text-lg transition-colors shadow-lg shadow-brand/30 flex items-center justify-center gap-2 group"
            >
              Comenzar ahora
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-zinc-500 text-xs">
              Solo necesitas tu correo @utmachala.edu.ec
            </p>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <LoginForm />
            <button
              onClick={() => setShowLogin(false)}
              className="w-full mt-4 text-zinc-500 text-sm hover:text-zinc-300 transition"
            >
              ← Volver al inicio
            </button>
          </div>
        )}

        {/* Features */}
        <div className="mt-16 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider text-center mb-6">
            ¿Por qué UTMACH Rides?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`glass-card rounded-2xl p-4 opacity-0 animate-fade-in-up stagger-${i + 1}`}
              >
                <f.icon className="w-8 h-8 text-brand mb-3" />
                <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 glass rounded-2xl p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-extrabold text-brand">14</p>
              <p className="text-xs text-zinc-500">Cantones</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-brand">24/7</p>
              <p className="text-xs text-zinc-500">Disponible</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-brand">$0</p>
              <p className="text-xs text-zinc-500">Costo de app</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-zinc-600 text-xs space-y-2">
          <p>Hecho para la UTMACH</p>
          <p>El Oro, Ecuador · 2026</p>
          <a
            href="https://github.com/Sherman95"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-brand transition mt-1"
          >
            <Github className="w-3.5 h-3.5" />
            Desarrollado por Sherman95
          </a>
        </footer>
      </div>
    </main>
  )
}
