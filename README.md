# UTMACH Rides

University carpooling platform for **14,000+ students** at **Universidad Tecnica de Machala (UTMACH)** in El Oro, Ecuador.

Students share rides between **14 cantons** of El Oro province and **5 UTMACH campuses**, with identity verification, trip requests, WhatsApp coordination, and mutual ratings. Only `@utmachala.edu.ec` emails allowed.

**Live:** [utmach-rides.vercel.app](https://utmach-rides.vercel.app)

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
| Deployment | Vercel (auto-deploy on push) | |

---

## Features

### Identity & Onboarding
- **Institutional email gate** -- only `@utmachala.edu.ec` can register
- **2-step onboarding** -- Step 1: full name + cedula (Ecuadorian ID validated with modulo-10 algorithm, duplicate detection). Step 2: faculty (5 UTMACH faculties) + career (40+ programs) + WhatsApp number
- **Middleware-enforced completeness** -- incomplete profiles redirect to onboarding server-side

### Trip Publishing & Discovery
- **Bidirectional flow** -- "Ir a la U" (to campus) / "Volver a casa" (heading home) auto-swaps origin/destination
- **Filterable feed** -- direction, specific campus (5), canton (14), with pull-to-refresh
- **Trip cards** -- driver name, average rating, total completed trips (InDrive-style), vehicle info, price, seats
- **Inline editing** -- edit origin, destination, date, time, seats, price on active trips
- **Status management** -- mark trips as completed or cancelled

### "Me apunto" Trip Request System
- Passengers tap **"Me apunto"** to request a seat
- Drivers see requests with passenger info (name, career, rating) and have **3 actions**:
  - **WhatsApp (verify)** -- pre-filled message: *"Puedes confirmar que si vas?"*
  - **Accept** -- confirms seat, decrements availability
  - **Reject** -- declines request
- After accepting: different WhatsApp link for coordination (*"Coordinamos punto de encuentro?"*)
- **Driver can revoke** accepted passengers (seat re-incremented)
- **Passenger can cancel** their own request at any time (seat returned if accepted)
- **Red badge** on driver's trip cards showing pending request count
- **Auto-reject** all pending requests when trip is completed or cancelled

### Mutual Rating System
- After trip completion, **both driver and passenger rate each other** (1-5 stars)
- Labels: Malo / Regular / Bien / Muy bien / Excelente
- Optional comment (max 200 chars)
- Database trigger auto-computes `average_rating` and `total_ratings`
- Separate trigger increments `total_trips` on trip completion
- Duplicate rating detection prevents abuse

### Vehicle Management
- CRUD with inline add/edit forms
- Delete protection: cannot delete vehicle with active trips

### WhatsApp Integration
- Two-phase messaging:
  - **Verification** (before accept): *"Puedes confirmar que si vas?"*
  - **Coordination** (after accept): *"Coordinamos punto de encuentro?"*
- Ecuador phone format conversion (`09XXXXXXXX` -> `+593XXXXXXXXX`)

### PWA
- Installable via `manifest.webmanifest`
- Standalone display mode
- Dynamic icon generation via `/api/icon` (OG ImageResponse)

---

## User Flow

```
@utmachala.edu.ec signup
        |
        v
  Email verification
        |
        v
  2-step onboarding
  [Name + Cedula] -> [Faculty + Career + WhatsApp]
        |
        v
   +----+----+
   |         |
   v         v
 DRIVER    PASSENGER
   |         |
   v         v
Publish    Browse feed
 ride      (filter by direction/campus/canton)
   |         |
   v         v
Receive    "Me apunto"
requests       |
   |           v
   +-----<-----+
   |
   v
3 actions per request:
  [WhatsApp: verify] [Accept] [Reject]
        |
        v
   Accepted -> WhatsApp: coordinate pickup
        |
        v
   Trip happens
        |
        v
   "Completado" (pending auto-rejected)
        |
        v
   Mutual rating (Driver <-> Passenger)
        |
        v
   Stats updated (avg rating, total trips)
```

---

## Architecture

```
app/
  layout.tsx                   Root layout (AuthProvider, Inter font, metadata, CSP)
  page.tsx                     Landing page (hero, features, stats, login CTA)
  (main)/                      Route group -- auth-protected via middleware
    layout.tsx                 Auth guard + BottomNav + onboarding redirect
    error.tsx / loading.tsx    Error boundary + skeleton per route
    dashboard/page.tsx         Greeting + stats + TripFeed
    profile/page.tsx           3-col stats + academic info + vehicles + trips + passenger trips
    rides/new/page.tsx         Create trip form + confetti
  auth/callback/page.tsx       Post-auth redirect (15s timeout)
  onboarding/page.tsx          2-step wizard (cedula+name -> faculty+career+WhatsApp)
  reset-password/page.tsx      Password recovery form
  api/icon/route.tsx           Dynamic OG ImageResponse icon

components/
  auth/LoginForm.tsx           Login / Register / Forgot password (3 modes)
  trips/
    TripFeed.tsx               Trip list + direction/campus/canton filters
    TripCard.tsx               Memoized card with driver stats + "Me apunto"
    TripRequestButton.tsx      Passenger: request seat / cancel request
    TripRequests.tsx           Driver: verify/accept/reject/revoke requests
    RateButton.tsx             5-star inline rating with labels + comment
    CompletedPassengers.tsx    Driver rates accepted passengers after trip
    MyPassengerTrips.tsx       Passenger trip history with status badges
    MyTrips.tsx                Driver trips + inline edit + pending badge
  vehicles/VehicleManager.tsx  Vehicle CRUD + delete protection
  ui/BottomNav.tsx             Fixed bottom nav (Home / Publish / Profile)

lib/
  auth-context.tsx             AuthProvider + useAuth() (getUser + onAuthStateChange)
  supabase.ts                  createBrowserClient<Database> singleton
  supabase-middleware.ts       createServerClient for middleware
  constants.ts                 Cantons, campuses, faculties (5), careers (40+), validators
  utils.ts                     Email validation, WhatsApp URL, date formatters

middleware.ts                  Server-side route protection + profile completeness check
types/database.ts              Full Database generic (6 tables)
```

---

## Database Schema (6 tables)

### `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK (Supabase Auth UUID) |
| `email` | `string` | Must be `@utmachala.edu.ec` |
| `full_name` | `string` | 2+ words, letters only |
| `cedula` | `string` | 10-digit Ecuadorian ID (modulo-10 validated) |
| `carrera` | `string` | Career code (40+ options) |
| `facultad` | `string` | Faculty code (fic, fce, fca, fcqs, fcs) |
| `whatsapp_number` | `string` | `09XXXXXXXX` or `+593XXXXXXXXX` |
| `average_rating` | `number` | Auto-computed by trigger |
| `total_ratings` | `number` | Auto-computed by trigger |
| `total_trips` | `number` | Auto-incremented on trip completion |
| `created_at` | `string` | |

### `vehicles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `driver_id` | `string` | FK -> `users.id` |
| `brand` | `string` | maxLength 50 |
| `model` | `string` | maxLength 50 |
| `color` | `string` | maxLength 30 |
| `license_plate` | `string \| null` | Optional |
| `created_at` | `string` | |

### `trips`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `driver_id` | `string` | FK -> `users.id` |
| `vehicle_id` | `string` | FK -> `vehicles.id` |
| `origin` | `string` | Canton or campus name |
| `destination` | `string` | Canton or campus name |
| `departure_time` | `string` | ISO datetime, must be future |
| `seats_available` | `number` | 1-7 |
| `price_contribution` | `number` | 0-50 USD |
| `status` | `TripStatus` | `active \| completed \| cancelled` |
| `created_at` | `string` | |

### `trip_requests`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `trip_id` | `string` | FK -> `trips.id` |
| `passenger_id` | `string` | FK -> `users.id` |
| `status` | `RequestStatus` | `pending \| accepted \| rejected` |
| `created_at` | `string` | |

### `ratings`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `trip_id` | `string` | FK -> `trips.id` |
| `from_user_id` | `string` | FK -> `users.id` (rater) |
| `to_user_id` | `string` | FK -> `users.id` (rated) |
| `score` | `number` | 1-5 |
| `comment` | `string \| null` | Optional, max 200 chars |
| `created_at` | `string` | |

### `bookings` (legacy)
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `trip_id` | `string` | FK -> `trips.id` |
| `passenger_id` | `string` | FK -> `users.id` |
| `status` | `BookingStatus` | `pending \| accepted \| rejected \| cancelled` |
| `created_at` | `string` | |

**Database triggers:**
- `update_user_rating` -- auto-computes `average_rating` and `total_ratings` when a rating is inserted
- `update_user_trips` -- increments `total_trips` when a trip status changes to `completed`

All tables protected with **Row Level Security (RLS)**.

---

## Auth Flow

```
Landing (/)
  |
  +--> LoginForm (login | register | forgot)
  |      |
  |      +--> signInWithPassword() / signUp()
  |             |
  |             +--> getUser() -> profile check
  |                    |
  |                    +--> profile complete   -> /dashboard
  |                    +--> profile incomplete  -> /onboarding
  |
  +--> Auth Callback (/auth/callback)
         |
         +--> onAuthStateChange('SIGNED_IN')
                +--> profile check -> /dashboard or /onboarding
```

**Middleware:** validates sessions server-side with `getUser()` (not `getSession()`). Profile completeness checks: `full_name + cedula + carrera + facultad + whatsapp_number`.

---

## Security

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | `default-src 'self'; connect-src 'self' <supabase>; frame-ancestors 'none'` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self)` |

**Input validation:**
- Cedula: modulo-10 algorithm (province code 01-24, verification digit)
- WhatsApp: `/^(09\d{8}|\+?593\d{9})$/`
- Names: 2+ words, letters only, 3-100 chars
- Prices: 0-50 USD, NaN check
- Origin != destination
- Future departure date
- Rating comments: max 200 chars

---

## Performance

- **Lazy loading**: VehicleManager, MyTrips, MyPassengerTrips via `next/dynamic`
- **Memoization**: TripCard with `React.memo`, WhatsApp URLs with `useMemo`
- **Turbopack**: enabled for dev builds
- **Confetti**: dynamically imported only on trip creation success
- **Query limits**: TripFeed (50), MyTrips (20)

---

## Error Handling

Every route under `(main)/` has:
- `error.tsx` -- client-side error boundary with retry button
- `loading.tsx` -- skeleton/shimmer matching page layout

Component-level: all Supabase fetches in `try/catch` with `fetchError` state and retry UI.

---

## Locations

### 14 Cantones of El Oro
Machala, Pasaje, Santa Rosa, El Guabo, Pinas, Huaquillas, Arenillas, Balsas, Chilla, Las Lajas, Marcabeli, Portovelo, Zaruma, Atahualpa

### 5 UTMACH Campuses
1. **Campus Principal (Matriz)** -- Machala, Av. Panamericana km 5 1/2
2. **Campus Machala (10 de Agosto)** -- Machala
3. **Fac. Ciencias Agropecuarias** -- El Cambio
4. **Campus Arenillas** -- Zona fronteriza
5. **Campus Pinas** -- Zona alta

### 5 Faculties
1. **FIC** -- Facultad de Ingenieria Civil (8 careers)
2. **FCE** -- Facultad de Ciencias Empresariales (9 careers)
3. **FCA** -- Facultad de Ciencias Agropecuarias (6 careers)
4. **FCQS** -- Facultad de Ciencias Quimicas y de la Salud (10 careers)
5. **FCS** -- Facultad de Ciencias Sociales (8 careers)

---

## Getting Started

```bash
# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key" >> .env.local

# Development (Turbopack)
npm run dev

# Production build
npm run build && npm start

# Lint
npm run lint
```

---

## Supabase Setup

1. Create a new Supabase project
2. Create 6 tables (`users`, `vehicles`, `trips`, `bookings`, `trip_requests`, `ratings`) matching the schema above
3. Add columns `cedula`, `carrera`, `facultad`, `average_rating`, `total_ratings`, `total_trips` to `users`
4. Create triggers: `update_user_rating` (on ratings insert) and `update_user_trips` (on trips update)
5. Enable **Row Level Security** on all tables
6. Configure auth: allow `@utmachala.edu.ec` email domain
7. Set Site URL to `https://utmach-rides.vercel.app`
8. Add redirect URL: `https://utmach-rides.vercel.app/auth/callback`
9. Copy project URL and anon key to `.env.local`

---

## Design System

- **Dark mode only** -- `<html className="dark">`
- **Mobile-first** -- `max-w-lg` container, bottom nav, safe area padding
- **Brand color**: `#204e99` (UTMACH institutional blue)
- **Glass morphism**: `.glass` / `.glass-card` utility classes
- **Font**: Inter (Google Fonts)
- **Animations**: fade-in-up, slide-up, shimmer, pulse-glow

---

## License

MIT
