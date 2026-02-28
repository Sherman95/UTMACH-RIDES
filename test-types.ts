// Minimal reproduction of the type issue
import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'

const client = createClient<Database>('http://localhost', 'key')

// Test the actual update call
async function testUpdate() {
  const { error } = await client.from('users').update({ full_name: 'test', whatsapp_number: '123' }).eq('id', '1')
}
