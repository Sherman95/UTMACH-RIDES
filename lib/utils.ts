import { UTMACH_EMAIL_DOMAIN } from './constants'

export function isUtmachEmail(email: string): boolean {
  return email.toLowerCase().endsWith(UTMACH_EMAIL_DOMAIN)
}

export function generateWhatsAppUrl(
  phone: string,
  driverName: string,
  origin: string,
  departureTime: string
): string {
  const cleanPhone = phone.replace(/[\s-]/g, '')
  const fullPhone = cleanPhone.startsWith('593')
    ? cleanPhone
    : cleanPhone.startsWith('0')
      ? `593${cleanPhone.slice(1)}`
      : `593${cleanPhone}`

  const message = encodeURIComponent(
    `Hola ${driverName}, soy estudiante de la UTMACH. Vi tu viaje en la app desde ${origin} a las ${departureTime}. ¿Aún tienes un asiento disponible?`
  )

  return `https://wa.me/${fullPhone}?text=${message}`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-EC', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getRelativeTime(dateStr: string): string {
  const now = new Date()
  const target = new Date(dateStr)
  const diffMs = target.getTime() - now.getTime()

  if (diffMs < 0) return 'Pasado'

  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `En ${diffMins}min`
  if (diffHours < 24) return `En ${diffHours}h`
  if (diffDays === 1) return 'Mañana'
  return `En ${diffDays}d`
}
