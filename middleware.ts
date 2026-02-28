import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase-middleware'

// Routes that require authentication and a complete profile
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/rides']

// Routes only for unauthenticated users
const AUTH_ROUTES = ['/', '/auth/callback', '/reset-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabase, response } = createMiddlewareClient(request)

  // Refresh session — this also validates the token server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r)

  // Not logged in trying to access protected route → redirect to landing
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Logged in trying to access landing page → redirect to dashboard
  if (isAuthRoute && pathname === '/' && user) {
    // Check if profile is complete before sending to dashboard
    const { data: profile } = await supabase
      .from('users')
      .select('full_name, whatsapp_number')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    if (!profile?.full_name || !profile?.whatsapp_number) {
      url.pathname = '/onboarding'
    } else {
      url.pathname = '/dashboard'
    }
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icons, manifest, etc.
     * - api routes
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon\\.ico|logoutmachrides\\.png|manifest\\.webmanifest|api/).*)',
  ],
}
