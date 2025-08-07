import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Simple validation for production compatibility
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    // Only show user-friendly error in browser
    console.error('Supabase configuration error: Missing environment variables')
  }
  throw new Error('Supabase credentials not found. Please check your environment variables.')
}

// Additional validation
if (!supabaseUrl.startsWith('https://')) {
  throw new Error('Invalid Supabase URL format')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})