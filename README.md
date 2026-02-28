# UTMACH Rides

University carpooling platform for students of **Universidad Tecnica de Machala (UTMACH)** in El Oro, Ecuador. Built with Next.js 16, React 19, Supabase, and Tailwind CSS v4.

Enables students to share rides between 14 cantons of El Oro province and 5 UTMACH campuses, coordinating via WhatsApp deep links. Only `@utmachala.edu.ec` emails are allowed.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.1.6 |
| UI Library | React | 19.2.3 |
| Language | TypeScript (strict mode) | 5.x |
| Styling | Tailwind CSS v4 + PostCSS | 4.x |
| Auth & Database | Supabase (Auth + PostgreSQL + RLS) | 2.98.0 |
| SSR Auth | @supabase/ssr (cookie-based sessions) | 0.8.0 |
| Icons | lucide-react | 0.575.0 |
| Animations | canvas-confetti (dynamic import) | 1.9.4 |
| Linting | ESLint + eslint-config-next (flat config) | 9.x |

---

## Architecture

```
app/                          Next.js App Router
  layout.tsx                  Root layout (AuthProvider, Inter font, metadata, CSP)
  page.tsx                    Landing page (hero, features, stats, login CTA)
  (main)/                     Route group — auth-protected
    layout.tsx                Auth guard + BottomNav + onboarding redirect
    error.tsx                 Error boundary (retry button)
    loading.tsx               Loading skeleton
    dashboard/page.tsx        Greeting + stats + TripFeed
    profile/page.tsx          Edit profile + vehicles + trips (lazy loaded)
    rides/new/page.tsx        Create trip form + confetti
  auth/callback/page.tsx      Post-auth redirect (15s timeout)
  onboarding/page.tsx         2-step wizard (name -> WhatsApp)
  reset-password/page.tsx     Password recovery form
  api/icon/route.tsx          Dynamic OG ImageResponse icon generation

components/
  auth/LoginForm.tsx          Login / Register / Forgot password (3 modes)
  trips/TripFeed.tsx          Real-time trip list + direction/campus/canton filters
  trips/TripCard.tsx          Memoized trip card + WhatsApp CTA
  trips/MyTrips.tsx           User trips + inline edit/complete/cancel
  vehicles/VehicleManager.tsx Vehicle CRUD + delete protection (active trip check)
  ui/BottomNav.tsx            Fixed bottom nav (Home / Publish / Profile)

lib/
  auth-context.tsx            AuthProvider + useAuth() hook (getUser + onAuthStateChange)
  supabase.ts                 createBrowserClient<Database> singleton
  supabase-middleware.ts      createServerClient for middleware (cookie get/set)
  constants.ts                14 cantones, 5 campuses, trip directions
  utils.ts                    Email validation, WhatsApp URL builder, date formatters

middleware.ts                 Server-side route protection (getUser validation)
types/database.ts             Full Supabase Database generic type
```

---

## Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `string` | PK (Supabase Auth UUID) |
| `email` | `string` | Must be `@utmachala.edu.ec` |
| `full_name` | `string \| null` | Set during onboarding |
| `whatsapp_number` | `string \| null` | Ecuador format: `09XXXXXXXX` or `+593XXXXXXXXX` |
| `created_at` | `string` | Auto-generated |

### `vehicles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `string` | PK |
| `driver_id` | `string` | FK -> `users.id` |
| `brand` | `string` | maxLength 50 |
| `model` | `string` | maxLength 50 |
| `color` | `string` | maxLength 30 |
| `license_plate` | `string \| null` | Optional, maxLength 10 |
| `created_at` | `string` | |

### `trips`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `string` | PK |
| `driver_id` | `string` | FK -> `users.id` |
| `vehicle_id` | `string` | FK -> `vehicles.id` |
| `origin` | `string` | Canton or campus name |
| `destination` | `string` | Canton or campus name |
| `departure_time` | `string` | ISO datetime, must be future |
| `seats_available` | `number` | 1-4 |
| `price_contribution` | `number` | 0-50 USD, step 0.25 |
| `status` | `TripStatus` | `'active' \| 'completed' \| 'cancelled'` |
| `created_at` | `string` | |

### `bookings`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `string` | PK |
| `trip_id` | `string` | FK -> `trips.id` |
| `passenger_id` | `string` | FK -> `users.id` |
| `status` | `BookingStatus` | `'pending' \| 'accepted' \| 'rejected' \| 'cancelled'` |
| `created_at` | `string` | |

---

## Auth Flow

```
Landing (/)
  |
  +--> LoginForm (login | register | forgot)
  |      |
  |      +--> signInWithPassword() / signUp()
  |      |      |
  |      |      +--> getUser() -> profile check
  |      |             |
  |      |             +--> profile complete   -> /dashboard
  |      |             +--> profile incomplete  -> /onboarding
  |      |
  |      +--> resetPasswordForEmail() -> /reset-password
  |
  +--> Auth Callback (/auth/callback)
         |
         +--> onAuthStateChange('SIGNED_IN')
         |      +--> profile check -> /dashboard or /onboarding
         |
         +--> 15s timeout -> error UI + retry
```

**AuthProvider** (`lib/auth-context.tsx`):
- Initial load: `supabase.auth.getUser()` (server-validated, not cached)
- Realtime: `onAuthStateChange` listener for login/logout/token refresh
- Exposes: `user`, `profile`, `loading`, `error`, `refreshProfile()`

**Middleware** (`middleware.ts`):
- Uses `createServerClient` from `@supabase/ssr` with cookie-based sessions
- Protected routes (`/dashboard`, `/profile`, `/rides`): redirect to `/` if no user
- Landing page (`/`): redirect authenticated users to `/dashboard` or `/onboarding`
- Session validated via `getUser()` (not `getSession()` -- avoids stale JWT)

**Browser client** (`lib/supabase.ts`):
- Uses `createBrowserClient` from `@supabase/ssr` (stores tokens in cookies, not localStorage)
- Shares cookie storage with middleware for seamless SSR auth

---

## Security

### HTTP Headers (next.config.ts)

| Header | Value |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self)` |
| `X-DNS-Prefetch-Control` | `on` |
| `Content-Security-Policy` | `default-src 'self'; connect-src 'self' <supabase-urls>; frame-ancestors 'none'` |

### Input Validation

- Email: `@utmachala.edu.ec` domain check (client-side)
- WhatsApp: regex `/^(09\d{8}|\+?593\d{9})$/`
- Name: 3-100 characters
- Price: 0-50 USD, NaN check
- Origin != destination check
- Future departure date enforcement
- Vehicle fields: maxLength constraints
- Supabase RLS assumed on all tables

---

## Features

### Trip Feed
- Fetches active trips with future `departure_time`, limit 50, ordered ascending
- 3-tab direction filter: All / To Campus / From Campus
- Campus pill filters (5 campuses)
- Canton dropdown filter (14 cantones)
- Pull-to-refresh, skeleton loading, error state with retry

### Trip Creation
- Bidirectional: "Ir a la U" (to campus) / "Volver a casa" (from campus)
- Campus selector with address descriptions
- Canton selector (El Oro province)
- Live route preview
- Inline vehicle creation if none exist
- canvas-confetti celebration on success (dynamically imported)

### Trip Management
- Inline editing: origin, destination, date, time, seats, price
- Status transitions: Active -> Completed / Cancelled
- Validation on edit: future date, origin != dest, price <= $50

### Vehicle Management
- CRUD with inline add/edit forms
- Delete protection: cannot delete vehicle with active trips
- Confirmation dialog before delete

### WhatsApp Integration
- Trip cards have a direct WhatsApp CTA button
- Generates `wa.me` deep link with pre-filled Spanish message
- Handles Ecuador phone format conversion (0 prefix -> +593)

### PWA
- Installable via `manifest.webmanifest`
- Standalone display mode
- Dynamic icon generation via `/api/icon?size=` (OG ImageResponse)
- Theme color: `#204e99` (UTMACH blue)

---

## Design System

- **Dark mode only** -- forced via `<html className="dark">`
- **Mobile-first** -- `max-w-lg` (512px) container, bottom nav, safe area padding
- **Brand color**: `#204e99` (UTMACH institutional blue)
- **Glass morphism**: `.glass` / `.glass-card` utility classes
- **Font**: Inter (Google Fonts, `font-display: swap`)
- **Animations**: `fade-in-up`, `slide-up`, `float`, `pulse-glow`, `shimmer` (200-250ms)
- **Stagger system**: 30ms-150ms increments for sequential element reveals
- **Skeleton loading**: shimmer animation matching page layout

---

## Performance

- **Lazy loading**: VehicleManager and MyTrips loaded via `next/dynamic` on Profile page
- **Memoization**: TripCard with `React.memo`, BottomNav with `React.memo`, WhatsApp URLs with `useMemo`
- **Turbopack**: enabled for dev builds
- **Confetti**: dynamically imported only on trip creation success
- **Query limits**: TripFeed limited to 50, MyTrips limited to 20

---

## Error Handling

Every route under `(main)/` has:
- `error.tsx` -- client-side error boundary with retry button and console logging
- `loading.tsx` -- skeleton/shimmer loading states matching page layout

Component-level error handling:
- All Supabase fetches wrapped in `try/catch` with `fetchError` state
- Error UI with retry buttons
- Auth callback: 15s timeout with fallback error UI
- Supabase errors translated to Spanish in LoginForm

---

## Locations

### 14 Cantones of El Oro
Machala, Pasaje, Santa Rosa, El Guabo, Pinas, Huaquillas, Arenillas, Balsas, Chilla, Las Lajas, Marcabeli, Portovelo, Zaruma, Atahualpa

### 5 UTMACH Campuses
1. **Campus Principal (Matriz)** -- Machala, Av. Panamericana km 5 1/2 Via a Pasaje
2. **Campus Machala (10 de Agosto)** -- Machala, Educacion Continua
3. **Fac. Ciencias Agropecuarias** -- El Cambio
4. **Campus Arenillas** -- Zona fronteriza
5. **Campus Pinas** -- Zona alta

---

## Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Both are validated at startup -- the app throws if either is missing.

---

## Getting Started

```bash
# Install dependencies
npm install

# Create .env.local with Supabase credentials (see above)

# Run development server (Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supabase Setup

1. Create a new Supabase project
2. Create the 4 tables (`users`, `vehicles`, `trips`, `bookings`) matching the schema above
3. Enable Row Level Security (RLS) on all tables
4. Configure auth to allow `@utmachala.edu.ec` email domain
5. Set the Site URL and redirect URLs in Supabase Auth settings
6. Copy the project URL and anon key to `.env.local`

---

## License

MIT
