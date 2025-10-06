import { createServerSupabaseClient } from './supabase-server'
import { createClient } from './supabase-client'

// Server-side auth helpers
export async function getServerUser() {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting server user:', error)
    return null
  }
  
  return user
}

// Client-side auth helpers
export function getClientUser() {
  const supabase = createClient()
  return supabase.auth.getUser()
}

// Check if user is authenticated (server-side)
export async function isAuthenticated() {
  const user = await getServerUser()
  return !!user
}

// Get user profile from profiles table (server-side)
export async function getServerUserProfile() {
  const user = await getServerUser()
  if (!user) return null
  
  const supabase = createServerSupabaseClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) {
    console.error('Error getting user profile:', error)
    return null
  }
  
  return profile
}
