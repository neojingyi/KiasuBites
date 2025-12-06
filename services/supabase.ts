/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client for database and authentication operations.
 * Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Allow fallback to localStorage mode if Supabase is not configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase not configured. Using localStorage fallback. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file to enable Supabase.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Helper function to handle Supabase errors
 */
export function handleSupabaseError(error: any): never {
  console.error('Supabase error:', error);
  throw new Error(error?.message || 'An error occurred');
}

/**
 * Helper function to check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Helper function to get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}

