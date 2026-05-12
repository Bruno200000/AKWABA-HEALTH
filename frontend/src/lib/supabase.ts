import { createClient, SupabaseClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured =
  Boolean(rawUrl && rawKey && rawUrl.startsWith("http"));

/** Client utilisé dans toute l’app ; en l’absence d’ENV, placeholders évitent le crash au import. */
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(rawUrl!, rawKey!)
  : createClient("https://placeholder.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid", {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
