import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://wqdrybpjfvuzrnozomxa.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxZHJ5YnBqZnZ1enJub3pvbXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNTEzMDEsImV4cCI6MjEwMzkyNzMwMX0.MEIL2IfMECBU-Fy5MRxp9XlMhElJU_rOpuH3K36MGTo';

/**
 * Normalizes and cleans the Supabase project URL.
 * Prevents PGRST125 ("Invalid path specified in request URL") by ensuring
 * only the base origin (e.g. https://<project-ref>.supabase.co) is used,
 * stripping any accidental paths like /rest/v1/, /auth/v1/, or trailing slashes.
 */
function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return FALLBACK_URL;
  const trimmed = rawUrl.trim().replace(/^['"]|['"]$/g, '');
  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    return trimmed.replace(/\/rest\/v1\/?$/, '').replace(/\/auth\/v1\/?$/, '').replace(/\/+$/, '') || FALLBACK_URL;
  }
}

function sanitizeKey(rawKey?: string): string {
  if (!rawKey || typeof rawKey !== 'string') return FALLBACK_KEY;
  return rawKey.trim().replace(/^['"]|['"]$/g, '') || FALLBACK_KEY;
}

// Safely obtain env variables whether in Vite browser environment or Node
const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL);
const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY);

const SUPABASE_URL = sanitizeSupabaseUrl(envUrl);
const SUPABASE_ANON_KEY = sanitizeKey(envKey);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
