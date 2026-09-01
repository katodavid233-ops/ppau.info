/** Legacy anon JWT (eyJ…) — required for Edge Functions with verify_jwt enabled. */
export function getSupabaseAnonJwt(): string | null {
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  const publishable = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (anon?.startsWith("eyJ")) return anon;
  if (publishable?.startsWith("eyJ")) return publishable;
  return null;
}

export function getSupabaseApiKey(): string {
  const publishable = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  return publishable ?? anon ?? "";
}
