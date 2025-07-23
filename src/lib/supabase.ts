import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if credentials are properly configured
const isConfigured = envUrl && envKey && 
  !envUrl.includes('your_supabase') && 
  !envKey.includes('your_supabase') &&
  envUrl.startsWith('https://') &&
  envKey.length > 10

// Use safe defaults if not configured
const supabaseUrl = isConfigured ? envUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = isConfigured ? envKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDc0NDI3MzMsImV4cCI6MTk2MzAxODczM30.placeholder-key'

if (!isConfigured) {
  console.warn('⚠️  Supabase credentials not configured. Please add your credentials to .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)