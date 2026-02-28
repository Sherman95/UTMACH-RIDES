/**
 * Demo seed script for DEV Weekend Challenge judges.
 *
 * Prerequisites:
 *   1. Create the demo user in Supabase Auth Dashboard:
 *      - Email: demo@utmachala.edu.ec
 *      - Password: DemoRides2026!
 *      - Mark "Auto-confirm" so no email verification is needed
 *   2. Copy the user's UUID from Supabase Auth dashboard
 *   3. Run: npx tsx scripts/seed-demo.ts <USER_UUID>
 *
 * This populates the demo account with a profile, vehicle, and sample trips.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const DEMO_USER_ID = process.argv[2]
if (!DEMO_USER_ID) {
  console.error('Usage: npx tsx scripts/seed-demo.ts <USER_UUID>')
  process.exit(1)
}

async function seed() {
  console.log('Seeding demo data...')

  // 1. Upsert user profile
  const { error: userError } = await supabase.from('users').upsert({
    id: DEMO_USER_ID,
    email: 'demo@utmachala.edu.ec',
    full_name: 'Demo Judge',
    whatsapp_number: '0991234567',
  })
  if (userError) throw userError
  console.log('  -> User profile created')

  // 2. Insert a vehicle
  const { data: vehicle, error: vehicleError } = await supabase
    .from('vehicles')
    .insert({
      driver_id: DEMO_USER_ID,
      brand: 'Chevrolet',
      model: 'Aveo',
      color: 'Blanco',
      license_plate: 'OAA-1234',
    })
    .select()
    .single()
  if (vehicleError) throw vehicleError
  console.log('  -> Vehicle created:', vehicle.id)

  // 3. Insert sample trips (future dates)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const trips = [
    {
      driver_id: DEMO_USER_ID,
      vehicle_id: vehicle.id,
      origin: 'Pasaje',
      destination: 'Campus Principal (Matriz)',
      departure_time: new Date(tomorrow.setHours(7, 0, 0, 0)).toISOString(),
      seats_available: 3,
      price_contribution: 1.5,
    },
    {
      driver_id: DEMO_USER_ID,
      vehicle_id: vehicle.id,
      origin: 'Campus Principal (Matriz)',
      destination: 'Santa Rosa',
      departure_time: new Date(tomorrow.setHours(13, 30, 0, 0)).toISOString(),
      seats_available: 2,
      price_contribution: 2.0,
    },
    {
      driver_id: DEMO_USER_ID,
      vehicle_id: vehicle.id,
      origin: 'El Guabo',
      destination: 'Campus Machala (10 de Agosto)',
      departure_time: new Date(tomorrow.setHours(6, 30, 0, 0)).toISOString(),
      seats_available: 4,
      price_contribution: 1.0,
    },
  ]

  const { error: tripsError } = await supabase.from('trips').insert(trips)
  if (tripsError) throw tripsError
  console.log('  -> 3 sample trips created')

  console.log('\nDone! Demo account ready.')
  console.log('  Email:    demo@utmachala.edu.ec')
  console.log('  Password: DemoRides2026!')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
