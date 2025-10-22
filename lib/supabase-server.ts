//This file is used to create server-side Supabase clients for different use cases

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Use environment variables for better security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client for user-authenticated requests (uses anon key with cookies)
export const createServerSupabaseClient = () => {
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookies().set(name, value, options)
          } catch {
            // set called from Server Component without a mutable cookies store
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookies().set(name, '', options)
          } catch {
            // remove called from Server Component without a mutable cookies store
          }
        },
      },
    }
  );
};

// Service-role client for admin operations (bypasses RLS, no cookies needed)
export const createServiceRoleSupabaseClient = () => {
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required for service-role operations')
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
