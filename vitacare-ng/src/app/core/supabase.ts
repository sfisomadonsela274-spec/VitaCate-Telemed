import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONFIG } from './config';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

export const supabase = getSupabaseClient();
