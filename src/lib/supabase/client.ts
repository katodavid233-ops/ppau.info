import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonJwt } from "@/lib/supabase/keys";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishable = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
/** Auth callbacks (recovery, invite) require the legacy anon JWT — not sb_publishable_ alone. */
const key = getSupabaseAnonJwt() ?? publishable;

export const isSupabaseConfigured = Boolean(url && key);

let browserClient: SupabaseClient | null = null;

/** Singleton browser client with persisted session + auto token refresh. */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  if (!browserClient) {
    browserClient = createBrowserClient(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "ppau-auth",
      },
    });
  }
  return browserClient;
}

/** @deprecated Use getSupabase() — kept for existing imports */
export const supabase = isSupabaseConfigured ? getSupabase() : null;
