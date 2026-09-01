import { getSupabase } from "@/lib/supabase/client";
import { getSupabaseApiKey } from "@/lib/supabase/keys";

const fnUrl = () => `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function adminInvoke<T>(name: string, body: Record<string, unknown>) {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  const key = getSupabaseApiKey();
  const res = await fetch(`${fnUrl()}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: key,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
};

export async function listAdmins() {
  return adminInvoke<{ admins: AdminUser[] }>("admin-manage-users", {
    action: "list_admins",
  });
}

export async function createAdmin(email: string, password: string, full_name?: string) {
  return adminInvoke<{ user: { id: string; email: string } }>("admin-manage-users", {
    action: "create",
    email,
    password,
    full_name,
  });
}

export async function removeAdminRole(user_id: string) {
  return adminInvoke<{ success: boolean }>("admin-manage-users", {
    action: "remove_admin",
    user_id,
  });
}

export async function getAccessToken() {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  return session?.access_token;
}
