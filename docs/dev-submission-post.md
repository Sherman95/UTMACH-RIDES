---
title: "UTMACH Rides -- I Built a Carpooling App So My Classmates Stop Paying $3 for a 10-Minute Ride"
published: true
cover_image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/h4owmev3i4vjcum8w9qg.png
description: "A university carpooling PWA for 14,000+ students at UTMACH in El Oro, Ecuador. Built with Next.js 16, Supabase, and Tailwind v4."
tags: showdev, devchallenge, weekendchallenge, webdev
---

*This is a submission for the [DEV Weekend Challenge: Community](https://dev.to/challenges/weekend-2026-02-28)*

## The Community

I'm an 8th-semester **Information Technology** student at the **Facultad de Ingenieria Civil, Universidad Tecnica de Machala (UTMACH)** in El Oro province, Ecuador. I live in **Pinas** -- a small town up in the highlands, about 1.5 hours from campus by road. Every single day I make that commute, and so do **14,000+ students** spread across **5 campuses** and **14 different cantons** -- Pasaje, Santa Rosa, Zaruma, El Guabo, Huaquillas, and more.

Here's the problem: there is **no public transit system** connecting most of these towns to the campuses. Students either:
- Pay **$2-3 each way** for informal taxi/bus rides (on a student budget, that's $20-30/week gone)
- Stand on the highway hoping to catch a shared pickup truck
- **Skip class entirely** when they can't afford the ride

But cost isn't even the scariest part. **Security is a real, daily concern.** Ecuador has been going through one of the worst spikes in violent crime in its history. As CS/IT students, **we carry our laptops every single day**. Taking public transport or flagging random rides on the highway means you're a visible target -- alone, with expensive gear, on a predictable route. Students at UTMACH have been robbed. This isn't hypothetical. It's why some of us travel in groups or avoid certain bus routes altogether.

That's why riding with **people you can verify are from your own university** matters so much. It's not just convenience -- **it's a layer of safety**. And that's the core reason UTMACH Rides **only allows `@utmachala.edu.ec` emails**: if you're in the app, you're a verified UTMACH student. You know the person you're riding with is your classmate, not a stranger.

Carpooling already happens organically -- students coordinate via chaotic WhatsApp groups where messages get buried in minutes. There's no structure, no way to search by route or time, and no way to verify that the person offering a ride is actually a UTMACH student.

I built **UTMACH Rides** to fix all of that.

## What I Built

UTMACH Rides is a **mobile-first PWA** (Progressive Web App) that lets verified UTMACH students publish, find, request, and review shared rides between the 14 cantons of El Oro and the 5 university campuses.

### Key flows

1. **Sign up with your `@utmachala.edu.ec` email** -- this is the only way in. No institutional email, no access. Every user is a real, verified UTMACH student.

2. **2-step onboarding** -- After email verification, a guided form collects: full name, Ecuadorian cedula (validated with the official modulo-10 algorithm), faculty (5 UTMACH faculties), career (40+ programs), and WhatsApp number. Duplicate cedula detection prevents multi-accounting.

3. **Publish a ride** -- Pick a direction (going to campus or heading home), select your campus, your canton, departure time, available seats, and a price contribution ($0-$50). The bidirectional flow automatically handles origin/destination based on your selection.

4. **Find a ride** -- The feed shows all active rides with future departure times, filterable by:
   - Direction: *Ir a la U* (going to campus) / *Volver* (heading home)
   - Specific campus (Matriz, 10 de Agosto, El Cambio, Arenillas, Pinas)
   - Canton of origin/destination

   Each trip card shows driver name, rating, total completed trips (InDrive-style), vehicle info, price, and available seats.

5. **"Me apunto" trip request system** -- Passengers tap "Me apunto" (I'm in) to request a seat. The driver sees all requests with passenger info (name, career, rating) and has **3 actions for each pending request**:
   - **WhatsApp** -- verify with a pre-filled message: *"Puedes confirmar que si vas?"* (before accepting)
   - **Accept** -- confirms the seat, decrements availability
   - **Reject** -- declines the request

   After accepting, the driver gets a different WhatsApp link for coordination: *"Acepte tu solicitud, coordinamos punto de encuentro?"*. Drivers can also **revoke** an accepted passenger if plans change (seat is re-incremented). A **red badge** on the trip card shows how many pending requests are waiting.

6. **Passenger self-service** -- Passengers can cancel their own request at any time. If they were already accepted, canceling returns the seat to the pool. No more being stuck waiting.

7. **Mutual rating system** -- After a trip is completed, both driver and passenger can rate each other with 1-5 stars (Malo / Regular / Bien / Muy bien / Excelente) plus an optional comment. Ratings are bidirectional: the driver rates each accepted passenger, and each passenger rates the driver. A database trigger auto-computes average ratings. Duplicate rating detection prevents abuse.

8. **Auto-cleanup on completion** -- When the driver marks a trip as completed or cancelled, all remaining pending requests are automatically rejected. No ghost requests lingering.

9. **Manage your vehicles** -- Add, edit, delete vehicles with brand, model, color, and plate. Can't delete a vehicle that has active trips.

10. **Edit or cancel trips** -- Inline editing with validation. Mark trips as completed when you arrive.

### What makes it different from generic carpooling apps

| Feature | Why it matters |
|---------|---------------|
| **Institutional email gate** | `@utmachala.edu.ec` only -- safety through verified identity |
| **Cedula verification** | Ecuadorian ID validated with modulo-10 algorithm, duplicate detection |
| **Academic profile** | Faculty + career displayed on requests -- you know who's riding with you |
| **Real geography** | 14 actual cantons of El Oro + 5 real UTMACH campuses with addresses |
| **"Me apunto" request flow** | Verify via WhatsApp first, then accept -- no blind seat assignments |
| **Mutual ratings** | Both driver and passenger rate each other, InDrive-style trust building |
| **WhatsApp-native** | Pre-filled messages for both verification and coordination phases |
| **Bidirectional routing** | "To campus" vs "heading home" automatically swaps origin/destination |
| **USD amounts** | Ecuador uses US dollars; students share $0.50-$2.00 for gas |
| **Security by design** | Server-side middleware, CSP headers, input validation, cookie-based auth |

## Demo

### Live App

**[https://utmach-rides.vercel.app](https://utmach-rides.vercel.app)**

**Demo credentials** (pre-seeded account for judges):
| | |
|---|---|
| Email | `demo@utmachala.edu.ec` |
| Password | `DemoRides2026!` |

> The demo account has a complete profile (cedula, career, faculty), a vehicle, and sample trips pre-loaded. You can publish trips, request seats on other trips, rate passengers, manage vehicles, and test the full flow.

### Screenshots

**Landing page -- institutional email gate with glass morphism UI:**

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/df0z0gi3qhwhm692a56d.png)

**Dashboard -- trip feed with direction and campus filters:**

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/bgc9k7on5yhh03w41cxb.png)

**New trip -- bidirectional campus/canton selector with smart validation:**

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5py9xp8t736jvlwaravo.png)

**Trip card -- driver info, rating, trip count, vehicle, price, seats, and "Me apunto" button:**

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/hgp71hrp4reb42tx6lbf.png)

**Profile -- 3-column stats (trips/rating/published), academic info, vehicle editor, trip history:**

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/39trwudm1hxm5p3swjeb.png)

**Onboarding -- 2-step form: cedula + name, then faculty/career + WhatsApp:**

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/939rpk7x0810ejfj9i6o.png)

## Code

{% github Sherman95/UTMACH-RIDES %}

### Project structure

```
app/
  (main)/                  # Protected routes (middleware-guarded)
    dashboard/             # Trip feed + stats + filters
    profile/               # User info + vehicles + trip history + passenger trips
    rides/new/             # Publish a ride form
  auth/callback/           # Email verification handler
  onboarding/              # 2-step profile setup (cedula, faculty, career)
components/
  trips/
    TripFeed.tsx           # Main feed with direction/campus/canton filters
    TripCard.tsx           # Individual card with driver stats + "Me apunto"
    TripRequestButton.tsx  # Passenger: request/cancel seat
    TripRequests.tsx       # Driver: manage requests (verify/accept/reject/revoke)
    RateButton.tsx         # 5-star inline rating with optional comment
    CompletedPassengers.tsx # Driver rates passengers after trip
    MyPassengerTrips.tsx   # Passenger trip history with status badges
    MyTrips.tsx            # Driver's published trips with edit/complete/cancel
  vehicles/
    VehicleManager.tsx     # Inline CRUD for vehicles
lib/
  auth-context.tsx         # AuthProvider + useAuth() hook
  supabase.ts              # Typed browser client (cookie-based)
  supabase-middleware.ts   # Server client for middleware
  constants.ts             # Cantons, campuses, faculties, careers, validators
middleware.ts              # Server-side route protection + profile completeness
types/database.ts          # Full Database generic for Supabase (6 tables)
```

## How I Built It

### Stack

| Layer | Tech |
|-------|------|
| Framework | **Next.js 16.1.6** (App Router + Turbopack) |
| UI | **React 19** + **Tailwind CSS v4** + **lucide-react** icons |
| Auth & DB | **Supabase** (Auth + PostgreSQL + Row Level Security) |
| SSR Auth | **@supabase/ssr** -- cookie-based sessions shared between browser and middleware |
| PWA | Web manifest + dynamic icon generation via OG `ImageResponse` |
| Effects | **canvas-confetti** (dynamically imported on trip creation) |
| Deployment | **Vercel** (auto-deploy on push) |

### Architecture decisions

**Cookie-based auth, not localStorage.** The browser client uses `createBrowserClient` from `@supabase/ssr` so auth tokens live in cookies. The server middleware uses `createServerClient` reading those same cookies. This means the middleware validates sessions server-side with `getUser()` (which hits Supabase's auth server) instead of the deprecated `getSession()` (which only reads the cached JWT and can be spoofed).

**Server-side route protection via middleware.** Protected routes (`/dashboard`, `/profile`, `/rides`) redirect to `/` if no valid session exists. The landing page redirects authenticated users to `/dashboard` or `/onboarding` depending on profile completeness (name + cedula + career + faculty + WhatsApp). All validated server-side before a single React component renders.

**AuthProvider + useAuth() hook.** A React context wraps the entire app. It calls `getUser()` on mount, listens to `onAuthStateChange` for login/logout/token refresh events, and exposes `user`, `profile`, `loading`, and `refreshProfile()`. Every component consumes auth state from this single source -- no more scattered `getSession()` calls duplicated across files.

**Typed Supabase client.** The `Database` generic type maps every table's `Row`, `Insert`, and `Update` shapes across 6 tables (users, vehicles, trips, bookings, trip_requests, ratings). This gives full autocomplete and compile-time type-checking on every `.from('trips').update({...})` call. Had to use `type` aliases instead of `interface` because TypeScript interfaces don't produce implicit index signatures, which breaks Supabase's internal `extends Record<string, unknown>` constraint resolution.

**Ecuadorian cedula validation.** The onboarding form validates cedula numbers using Ecuador's official modulo-10 algorithm -- checking province code (01-24), computing the verification digit with alternating multipliers (2,1,2,1...), and rejecting invalid numbers client-side. Combined with server-side duplicate detection.

**Trip request lifecycle.** The "Me apunto" system implements a full state machine: `none -> pending -> accepted/rejected`, with the driver controlling transitions. Seat counts are managed atomically on accept (decrement) and revoke/cancel (re-increment). Drivers verify passengers via WhatsApp before accepting. Auto-rejection of pending requests on trip completion prevents orphaned state.

**Bidirectional rating with DB triggers.** Both driver and passenger rate each other after trip completion. A PostgreSQL trigger (`update_user_rating`) auto-computes `average_rating` and `total_ratings` on the users table whenever a new rating is inserted. A separate trigger (`update_user_trips`) increments `total_trips` when a trip is marked as completed.

**Security headers on every response.** `next.config.ts` injects `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` (disabling camera, microphone, geolocation access).

**Input validation everywhere.** Cedula validated with modulo-10. WhatsApp numbers validated with `/^(09\d{8}|\+?593\d{9})$/` (Ecuadorian mobile format). Names validated as 2+ words, letters only, 3-100 chars. Prices capped at $50. Origin != destination enforced. Departure must be in the future. Rating comments capped at 200 chars.

**Error boundaries on every route.** Each route segment under `(main)/` has its own `error.tsx` (with a retry button and console error logging) and `loading.tsx` (shimmer skeletons that match the actual page layout). Component-level data fetches are all wrapped in `try/catch` with `fetchError` state and retry UI.

**Lazy loading for non-critical components.** Vehicle manager, trip history, and passenger trips on the profile page are loaded via `next/dynamic` so the initial JS bundle stays lean. Trip cards use `React.memo` to avoid re-renders. Confetti is dynamically imported only on successful trip creation.

### Database schema (Supabase PostgreSQL)

```
users               vehicles         trips                trip_requests       ratings
├── id (uuid)       ├── id (uuid)    ├── id (uuid)        ├── id (uuid)       ├── id (uuid)
├── email           ├── driver_id ->  ├── driver_id ->      ├── trip_id ->       ├── trip_id ->
├── full_name       ├── brand        ├── vehicle_id ->     ├── passenger_id ->  ├── from_user_id ->
├── cedula          ├── model        ├── origin            ├── status           ├── to_user_id ->
├── carrera         ├── color        ├── destination       │   (pending/        ├── score (1-5)
├── facultad        └── plate        ├── departure_time    │    accepted/       ├── comment
├── whatsapp                         ├── seats_available   │    rejected)       └── created_at
├── average_rating                   ├── price_contribution└── created_at
├── total_ratings                    └── status
├── total_trips                          (active/completed/cancelled)
└── created_at
```

All 6 tables protected with **Row Level Security** policies. Users can only read/update their own profile, manage their own vehicles, create/edit/cancel their own trips. Passengers can create/read/delete their own trip requests. Drivers can read/update requests for their trips. All users can read active trips (the public feed) and read ratings.

### What I'd add next

- **Push notifications** when someone requests your ride
- **Real-time feed** via Supabase Realtime subscriptions (live trip updates without refresh)
- **Route map** -- static SVG of El Oro showing active canton-to-campus routes
- **Recurring trips** -- "Every Mon/Wed at 7am" instead of creating each one manually
- **Admin dashboard** with usage analytics and trip heatmaps
- **RLS migration files** committed to the repo (currently policies live only in Supabase dashboard)

---

Built with real frustration from standing on the Panamericana highway at 6 AM, laptop in my backpack, hoping someone from Pinas has an empty seat heading to campus. The app is in Spanish because that's what my community speaks, but the codebase and documentation are fully in English.

*8th semester, Information Technology -- Facultad de Ingenieria Civil, UTMACH.*
*El Oro, Ecuador -- 2026.*