---
title: "UTMACH Rides -- I Built a Carpooling App So My Classmates Stop Paying $3 for a 10-Minute Ride"
published: false
description: "A university carpooling PWA for 14,000+ students at UTMACH in El Oro, Ecuador. Built with Next.js 16, Supabase, and Tailwind v4."
tags: showdev, devchallenge, weekendchallenge, webdev
---

*This is a submission for the [DEV Weekend Challenge: Community](https://dev.to/challenges/weekend-2026-02-28)*

## The Community

I'm a computer science student at **Universidad Tecnica de Machala (UTMACH)** in El Oro province, Ecuador. Our university has 14,000+ students spread across **5 campuses** in different cities, and most of us commute daily from **14 different cantons** -- small towns like Pasaje, Santa Rosa, Pinas, Zaruma, El Guabo, and more.

Here's the problem: there is **no public transit** connecting most of these towns to the campuses. Students either:
- Pay $2--3 each way for informal taxi rides (on a student budget, that's $20--30/week)
- Stand on the highway hoping to catch a shared pickup truck
- Skip class entirely when they can't afford the ride

Carpooling happens naturally -- students share rides via chaotic WhatsApp groups where messages get buried. There's no structure, no way to search by route, and no way to verify that the driver is actually a UTMACH student.

I built **UTMACH Rides** to fix this.

## What I Built

UTMACH Rides is a **mobile-first PWA** (Progressive Web App) that lets verified UTMACH students publish and find shared rides between the 14 cantons of El Oro and the 5 university campuses.

**Key flows:**

1. **Sign up with your `@utmachala.edu.ec` email** -- this is the only way in. No institutional email, no access. This guarantees every user is a real UTMACH student.

2. **Publish a ride** -- Pick a direction (going to campus or heading home), select your campus, your canton, departure time, available seats, and a small price contribution ($0--$50). The bidirectional flow handles both morning commutes and afternoon returns.

3. **Find a ride** -- The feed shows all active rides with future departure times, filterable by direction (to campus / from campus), specific campus, and canton. Each trip card shows the driver's name, vehicle info, time, seats, and price.

4. **Contact via WhatsApp** -- One tap generates a deep link to WhatsApp with a pre-filled message in Spanish: *"Hola! Vi tu viaje de Pasaje a Campus Principal en UTMACH Rides. Hay asientos disponibles?"*. No in-app chat to build -- WhatsApp is already what everyone uses here.

5. **Manage your vehicles** -- Add, edit, delete vehicles. Can't delete a vehicle that has active trips (enforced client-side + RLS).

6. **Edit or cancel trips** -- Inline editing with validation. Mark as completed when you arrive.

**What makes it different from generic carpooling apps:**
- **Institutional email verification** -- not just any email, specifically `@utmachala.edu.ec`
- **Real geography** -- the 14 actual cantons of El Oro province and 5 real UTMACH campuses with actual addresses
- **WhatsApp-native** -- no need to build a chat system; students already coordinate on WhatsApp. The app just structures the discovery.
- **Bidirectional routing** -- "going to campus" vs "heading home" changes the origin/destination automatically based on your canton and campus selection
- **Dollar amounts** -- Ecuador uses USD; people share small contributions like $0.50--$2.00 for gas

## Demo

**Live app:** [https://utmach-rides.vercel.app](https://utmach-rides.vercel.app)

**Demo credentials** (pre-seeded account for judges):
- Email: `demo@utmachala.edu.ec`
- Password: `DemoRides2026!`

> The demo account comes with a vehicle and sample trips already loaded. You can create new trips, edit them, manage vehicles, and test the full flow.

### Screenshots

**Landing page -- mobile-first dark UI with glass morphism:**

![Landing page](https://raw.githubusercontent.com/Sherman95/UTMACH-RIDES/main/docs/screenshots/landing.png)

**Dashboard -- greeting, stats, and trip feed with filters:**

![Dashboard](https://raw.githubusercontent.com/Sherman95/UTMACH-RIDES/main/docs/screenshots/dashboard.png)

**New trip -- bidirectional campus/canton selector:**

![New trip](https://raw.githubusercontent.com/Sherman95/UTMACH-RIDES/main/docs/screenshots/new-trip.png)

**Profile -- edit info, manage vehicles, view your trips:**

![Profile](https://raw.githubusercontent.com/Sherman95/UTMACH-RIDES/main/docs/screenshots/profile.png)

## Code

{% github Sherman95/UTMACH-RIDES %}

## How I Built It

### Stack

| Layer | Tech |
|-------|------|
| Framework | **Next.js 16.1.6** (App Router + Turbopack) |
| UI | **React 19** + **Tailwind CSS v4** + **lucide-react** icons |
| Auth & DB | **Supabase** (Auth + PostgreSQL + Row Level Security) |
| SSR Auth | **@supabase/ssr** -- cookie-based sessions shared between browser and middleware |
| PWA | Web manifest + dynamic icon generation via OG ImageResponse |
| Effects | **canvas-confetti** (dynamically imported on trip creation) |

### Architecture decisions

**Cookie-based auth, not localStorage.** The browser client uses `createBrowserClient` from `@supabase/ssr` so auth tokens are stored in cookies. The server middleware uses `createServerClient` reading those same cookies. This means the middleware can validate the session server-side with `getUser()` (which hits Supabase's auth server) instead of the deprecated `getSession()` (which only reads the cached JWT and can be spoofed).

**Middleware for route protection.** Protected routes (`/dashboard`, `/profile`, `/rides`) redirect to `/` if no valid session. The landing page redirects authenticated users to `/dashboard` or `/onboarding` depending on profile completeness. All validated server-side before a single React component renders.

**AuthProvider + useAuth() hook.** A React context wraps the entire app. It calls `getUser()` on mount, listens to `onAuthStateChange` for login/logout/token refresh, and exposes `user`, `profile`, `loading`, and `refreshProfile()`. Every component consumes auth state from this single source of truth -- no more scattered `getSession()` calls.

**Typed Supabase client.** The `Database` generic type maps every table's `Row`, `Insert`, and `Update` types. This gives full autocomplete and type-checking on every `.from('trips').update({...})` call. Had to use `type` aliases instead of `interface` because TypeScript interfaces don't get implicit index signatures, which breaks Supabase's internal `extends Record<string, unknown>` checks.

**Security headers.** `next.config.ts` sets `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `Permissions-Policy` on every response.

**Input validation everywhere.** WhatsApp numbers validated with `/^(09\d{8}|\+?593\d{9})$/` (Ecuadorian format). Names 3--100 chars. Prices capped at $50. Origin and destination can't be the same. Departure must be in the future. Vehicle fields have `maxLength` constraints.

**Error boundaries on every route.** Each route segment under `(main)/` has its own `error.tsx` (with retry button + console logging) and `loading.tsx` (shimmer skeletons matching the page layout). Component-level fetches all wrapped in `try/catch` with `fetchError` state and retry UI.

**Lazy loading.** Vehicle manager and trip history on the profile page are loaded via `next/dynamic` so the initial bundle is lean. Trip cards use `React.memo`. Confetti is dynamically imported only on success.

### What I'd add next

- **Push notifications** when someone requests your ride
- **Real-time updates** via Supabase Realtime subscriptions
- **Ratings system** for drivers and passengers
- **Admin dashboard** with usage analytics
- **Supabase RLS migration files** committed to the repo (currently policies are only in the dashboard)

---

Built with real frustration from standing on the highway at 6 AM hoping someone from El Guabo has an empty seat heading to campus. The app is in Spanish because that's what my community speaks, but the codebase is fully English.

El Oro, Ecuador -- 2026.
