import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

function parseAuthCallbackParams(): {
  access_token: string | null;
  refresh_token: string | null;
} {
  if (typeof window === "undefined") {
    return { access_token: null, refresh_token: null };
  }
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const queryParams = new URLSearchParams(window.location.search);
  return {
    access_token: hashParams.get("access_token") ?? queryParams.get("access_token"),
    refresh_token: hashParams.get("refresh_token") ?? queryParams.get("refresh_token"),
  };
}

function clearAuthCallbackFromUrl() {
  window.history.replaceState(null, "", window.location.pathname);
}

/**
 * Establishes a session from recovery/invite tokens in the URL hash (or existing storage).
 */
export async function establishSessionFromAuthCallback(
  sb: SupabaseClient,
): Promise<{ session: Session | null; error: string | null }> {
  const { access_token, refresh_token } = parseAuthCallbackParams();

  if (access_token && refresh_token) {
    const { data, error } = await sb.auth.setSession({ access_token, refresh_token });
    if (error) return { session: null, error: error.message };
    if (data.session) {
      clearAuthCallbackFromUrl();
      return { session: data.session, error: null };
    }
  }

  const { data, error } = await sb.auth.getSession();
  if (error) return { session: null, error: error.message };
  return { session: data.session, error: null };
}

export type UserRole = "admin" | "member" | null;

type JwtPayload = {
  app_metadata?: { role?: string };
};

function roleFromJwt(accessToken: string | undefined): UserRole {
  if (!accessToken) return null;
  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1] ?? "")) as JwtPayload;
    const role = payload.app_metadata?.role;
    if (role === "admin" || role === "member") return role;
  } catch {
    /* ignore */
  }
  return null;
}

export function getRoleFromUser(user: {
  app_metadata?: Record<string, unknown>;
} | null | undefined): UserRole {
  if (!user) return null;
  const role = user.app_metadata?.role;
  if (role === "admin" || role === "member") return role as UserRole;
  return null;
}

export function getRoleFromSession(session: {
  user: { app_metadata?: Record<string, unknown> };
  access_token?: string;
} | null): UserRole {
  if (!session) return null;
  const fromUser = getRoleFromUser(session.user);
  if (fromUser) return fromUser;
  return roleFromJwt(session.access_token);
}

export async function getSession() {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  return session;
}

/** Validates JWT with Supabase and returns fresh user (includes app_metadata). */
export async function getCurrentUser() {
  const sb = getSupabase();
  const { data: { user }, error } = await sb.auth.getUser();
  if (error || !user) return null;
  return user;
}

export type AdminAuthResult =
  | { ok: true; session: NonNullable<Awaited<ReturnType<typeof getSession>>> }
  | { ok: false; reason: "no_config" | "no_session" | "not_admin" };

/**
 * Client-only admin check for route guards.
 * Skips on SSR (no localStorage) so the browser can restore the session after hydrate.
 */
export async function verifyAdminAuth(): Promise<AdminAuthResult> {
  if (!isSupabaseConfigured) return { ok: false, reason: "no_config" };
  if (typeof window === "undefined") {
    return { ok: true, session: null as never };
  }

  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return { ok: false, reason: "no_session" };

  const { data: { user }, error } = await sb.auth.getUser();
  if (error || !user) return { ok: false, reason: "no_session" };

  const role = getRoleFromUser(user) ?? getRoleFromSession(session);
  if (role !== "admin") return { ok: false, reason: "not_admin" };

  return { ok: true, session };
}

export async function signIn(email: string, password: string) {
  const sb = getSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const { data: userData, error: userError } = await sb.auth.getUser();
  if (userError) throw userError;

  return { ...data, user: userData.user ?? data.user };
}

export async function signOut() {
  const sb = getSupabase();
  await sb.auth.signOut();
}

export async function updatePassword(password: string) {
  const sb = getSupabase();
  const { error } = await sb.auth.updateUser({ password });
  if (error) throw error;
}

export async function requestPasswordReset(email: string) {
  const sb = getSupabase();
  const redirectTo = `${window.location.origin}/member/set-password`;
  const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) throw error;
}
