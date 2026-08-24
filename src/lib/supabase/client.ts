/// <reference types="vite/client" />

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
);

let supabaseInstance: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }

  return supabaseInstance;
}

/**
 * Instância única utilizada por toda a aplicação.
 */
export const supabase = getSupabaseClient();