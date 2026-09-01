import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

/** Fields safe for the public member directory (matches admin members registry). */
export type PublicMemberRow = {
  id: string;
  full_name: string;
  membership_number: string;
  membership_type: string;
  phone: string | null;
  legacy_registration_number: string | null;
  ahpc_registration_number: string | null;
  current_period_end: string | null;
  created_at: string;
};

export function registrationDisplay(m: PublicMemberRow): string {
  return (
    m.legacy_registration_number?.trim() ||
    m.ahpc_registration_number?.trim() ||
    m.membership_number
  );
}

export async function fetchPublicMembersDirectory(): Promise<PublicMemberRow[]> {
  if (!isSupabaseConfigured) return [];

  const sb = getSupabase();
  const { data, error } = await sb
    .from("members")
    .select(
      "id, full_name, membership_number, membership_type, phone, legacy_registration_number, ahpc_registration_number, current_period_end, created_at",
    )
    .eq("status", "active")
    .order("full_name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PublicMemberRow[];
}
