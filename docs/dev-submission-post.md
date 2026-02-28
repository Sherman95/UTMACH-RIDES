---
title: "UTMACH Rides -- I Built a Carpooling App So My Classmates Stop Paying $3 for a 10-Minute Ride"
published: false
description: "A university carpooling PWA for 14,000+ students at UTMACH in El Oro, Ecuador. Built with Next.js 16, Supabase, and Tailwind v4."
tags: showdev, devchallenge, weekendchallenge, webdev
---

*This is a submission for the [DEV Weekend Challenge: Community](https://dev.to/challenges/weekend-2026-02-28)*

## The Community

I'm an 8th-semester **Information Technology** student at the **Facultad de Ingeniería Civil, Universidad Técnica de Machala (UTMACH)** in El Oro province, Ecuador. I live in **Piñas** -- a small town up in the highlands, about 1.5 hours from campus by road. Every single day I make that commute, and so do **14,000+ students** spread across **5 campuses** and **14 different cantons** -- Pasaje, Santa Rosa, Zaruma, El Guabo, Huaquillas, and more.

Here's the problem: there is **no public transit system** connecting most of these towns to the campuses. Students either:
- 💸 Pay **$2–3 each way** for informal taxi/bus rides (on a student budget, that's $20–30/week gone)
- 🛤️ Stand on the highway hoping to catch a shared pickup truck
- ❌ **Skip class entirely** when they can't afford the ride

But cost isn't even the scariest part. **Security is a real, daily concern.** Ecuador has been going through one of the worst spikes in violent crime in its history. As CS/IT students, **we carry our laptops every single day**. Taking public transport or flagging random rides on the highway means you're a visible target -- alone, with expensive gear, on a predictable route. Students at UTMACH have been robbed. This isn't hypothetical. It's why some of us travel in groups or avoid certain bus routes altogether.

That's why riding with **people you can verify are from your own university** matters so much. It's not just convenience -- **it's a layer of safety**. And that's the core reason UTMACH Rides **only allows `@utmachala.edu.ec` emails**: if you're in the app, you're a verified UTMACH student. You know the person you're riding with is your classmate, not a stranger.

Carpooling already happens organically -- students coordinate via chaotic WhatsApp groups where messages get buried in minutes. There's no structure, no way to search by route or time, and no way to verify that the person offering a ride is actually a UTMACH student.

I built **UTMACH Rides** to fix all of that.

## What I Built

UTMACH Rides is a **mobile-first PWA** (Progressive Web App) that lets verified UTMACH students publish and find shared rides between the 14 cantons of El Oro and the 5 university campuses.

### Key flows

1. **🔐 Sign up with your `@utmachala.edu.ec` email** -- this is the only way in. No institutional email, no access. Every user is a real, verified UTMACH student.

2. **📝 Publish a ride** -- Pick a direction (going to campus or heading home), select your campus, your canton, departure time, available seats, and a price contribution ($0–$50). The bidirectional flow automatically handles origin/destination based on your selection.

3. **🔍 Find a ride** -- The feed shows all active rides with future departure times, filterable by:
   - Direction: *Ir a la U* (going to campus) / *Volver* (heading home)
   - Specific campus (Matriz, 10 de Agosto, El Cambio, Arenillas, Piñas)
   - Canton of origin/destination

4. **📱 Contact via WhatsApp** -- One tap generates a deep link with a pre-filled message: *"Hola! Vi tu viaje de Pasaje a Campus Principal en UTMACH Rides. ¿Hay asientos disponibles?"*. No in-app chat needed -- WhatsApp is already what everyone uses here.

5. **🚗 Manage your vehicles** -- Add, edit, delete vehicles with brand, model, color, and plate. Can't delete a vehicle that has active trips.

6. **✏️ Edit or cancel trips** -- Inline editing with validation. Mark trips as completed when you arrive.

### What makes it different from generic carpooling apps

| Feature | Why it matters |
|---------|---------------|
| **Institutional email gate** | `@utmachala.edu.ec` only -- safety through verified identity |
| **Real geography** | 14 actual cantons of El Oro + 5 real UTMACH campuses with addresses |
| **WhatsApp-native** | No chat to build; the app structures discovery, WhatsApp handles communication |
| **Bidirectional routing** | "To campus" vs "heading home" automatically swaps origin/destination |
| **USD amounts** | Ecuador uses US dollars; students share $0.50–$2.00 for gas |
| **Security by design** | Server-side middleware, CSP headers, input validation, cookie-based auth |

## Demo

### 🎬 Video Walkthrough

{% embed https://youtu.be/YOUR_VIDEO_ID_HERE %}

> 60-second demo: login → dashboard → filter rides → WhatsApp contact → publish a ride → manage vehicles → profile.

### 🔗 Live App

**👉 [https://utmach-rides.vercel.app](https://utmach-rides.vercel.app)**

**Demo credentials** (pre-seeded account for judges):
| | |
|---|---|
| Email | `demo@utmachala.edu.ec` |
| Password | `DemoRides2026!` |

> The demo account has a vehicle and sample trips pre-loaded. You can create new trips, edit them, manage vehicles, and test the full flow.

### Screenshots

**Landing page -- institutional email gate with glass morphism UI:**

![Landing page](https://raw.githubusercontent.com/Sherman95/UTMACH-RIDES/main/docs/screenshots/landing.png)

**Dashboard -- real-time trip feed with direction and campus filters:**

![Dashboard](https://raw.githubusercontent.com/Sherman95/UTMACH-RIDES/main/docs/screenshots/dashboard.png)

**New trip -- bidirectional campus/canton selector with smart validation:**

![New trip](https://raw.githubusercontent.com/Sherman95/UTMACH-RIDES/main/docs/screenshots/new-ride.png)

**Trip card -- driver info, vehicle, price, seats, and WhatsApp deep link:**

![Trip card](https://raw.githubusercontent.com/Sherman95/UTMACH-RIDES/main/docs/screenshots/trip-card.png)

**Profile -- inline vehicle editor and collapsible trip history:**

![Profile](https://raw.githubusercontent.com/Sherman95/UTMACH-RIDES/main/docs/screenshots/profile.png)

**Onboarding -- name and WhatsApp verification after first login:**

![Onboarding](https://raw.githubusercontent.com/Sherman95/UTMACH-RIDES/main/docs/screenshots/onboarding.png)

## Code

{% github Sherman95/UTMACH-RIDES %}

### Project structure

```
├── app/
│   ├── (main)/           # Protected routes (dashboard, profile, rides)
│   │   ├── dashboard/    # Trip feed + stats + filters
│   │   ├── profile/      # User info + vehicles + trip history
│   │   └── rides/new/    # Publish a ride form
│   ├── auth/callback/    # Magic link + email verification handler
│   └── onboarding/       # First-time profile setup
├── components/
│   ├── trips/            # TripFeed, TripCard, MyTrips
│   └── vehicles/         # VehicleManager (inline CRUD)
├── lib/
│   ├── auth-context.tsx  # AuthProvider + useAuth() hook
│   ├── supabase.ts       # Typed browser client (cookie-based)
│   ├── supabase-middleware.ts  # Server client for middleware
│   └── constants.ts      # Cantons, campuses, directions
├── middleware.ts          # Server-side route protection
└── types/database.ts     # Full Database generic for Supabase
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

**Server-side route protection via middleware.** Protected routes (`/dashboard`, `/profile`, `/rides`) redirect to `/` if no valid session exists. The landing page redirects authenticated users to `/dashboard` or `/onboarding` depending on profile completeness. All validated server-side before a single React component renders.

**AuthProvider + useAuth() hook.** A React context wraps the entire app. It calls `getUser()` on mount, listens to `onAuthStateChange` for login/logout/token refresh events, and exposes `user`, `profile`, `loading`, and `refreshProfile()`. Every component consumes auth state from this single source -- no more scattered `getSession()` calls duplicated across 6 files.

**Typed Supabase client.** The `Database` generic type maps every table's `Row`, `Insert`, and `Update` shapes. This gives full autocomplete and compile-time type-checking on every `.from('trips').update({...})` call. Had to use `type` aliases instead of `interface` because TypeScript interfaces don't produce implicit index signatures, which breaks Supabase's internal `extends Record<string, unknown>` constraint resolution.

**Security headers on every response.** `next.config.ts` injects `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` (disabling camera, microphone, geolocation access).

**Input validation everywhere.** WhatsApp numbers validated with `/^(09\d{8}|\+?593\d{9})$/` (Ecuadorian mobile format). Names 3–100 chars. Prices capped at $50. Origin ≠ destination enforced. Departure must be in the future. Vehicle fields have `maxLength` constraints.

**Error boundaries on every route.** Each route segment under `(main)/` has its own `error.tsx` (with a retry button and console error logging) and `loading.tsx` (shimmer skeletons that match the actual page layout). Component-level data fetches are all wrapped in `try/catch` with `fetchError` state and retry UI.

**Lazy loading for non-critical components.** Vehicle manager and trip history on the profile page are loaded via `next/dynamic` so the initial JS bundle stays lean. Trip cards use `React.memo` to avoid re-renders. Confetti is dynamically imported only on successful trip creation.

### Database schema (Supabase PostgreSQL)

```
users           vehicles         trips
├── id (uuid)   ├── id (uuid)    ├── id (uuid)
├── email       ├── driver_id →  ├── driver_id →
├── full_name   ├── brand        ├── vehicle_id →
├── whatsapp    ├── model        ├── origin
└── created_at  ├── color        ├── destination
                └── plate        ├── departure_time
                                 ├── seats_available
                                 ├── price_contribution
                                 └── status (active|completed|cancelled)
```

All tables protected with **Row Level Security** policies. Users can only read/update their own profile, manage their own vehicles, and create/edit/cancel their own trips. All users can read active trips (the public feed).

### What I'd add next

- 🔔 **Push notifications** when someone requests your ride
- ⚡ **Real-time feed** via Supabase Realtime subscriptions
- ⭐ **Driver/passenger ratings** after each trip
- 🗺️ **Route map** -- static SVG of El Oro showing active canton-to-campus routes
- 🔁 **Recurring trips** -- "Every Mon/Wed at 7am" instead of creating each one manually
- 📊 **Admin dashboard** with usage analytics and trip heatmaps
- 📁 **RLS migration files** committed to the repo (currently policies live only in Supabase dashboard)

---

Built with real frustration from standing on the Panamericana highway at 6 AM, laptop in my backpack, hoping someone from Piñas has an empty seat heading to campus. The app is in Spanish because that's what my community speaks, but the codebase and documentation are fully in English.

*8th semester, Information Technology -- Facultad de Ingeniería Civil, UTMACH.*
*El Oro, Ecuador -- 2026.*