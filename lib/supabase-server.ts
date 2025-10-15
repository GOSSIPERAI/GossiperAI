//This file is used to create a server-side Supabase client for assemblyai transcription

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Use environment variables for better security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

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
