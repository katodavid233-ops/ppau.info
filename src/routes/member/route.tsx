import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";
import { getRoleFromUser, getRoleFromSession } from "@/lib/auth/session";

export const Route = createFileRoute("/member")({
  beforeLoad: async ({ location }) => {
    if (
      location.pathname === "/member/login" ||
      location.pathname === "/member/set-password" ||
      location.pathname === "/member/forgot-password"
    ) {
      return;
    }
    if (!isSupabaseConfigured) return;
    if (typeof window === "undefined") return;

    const sb = getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session) throw redirect({ to: "/member/login" });
    const { data: { user } } = await sb.auth.getUser();
    const role = getRoleFromUser(user) ?? getRoleFromSession(session);
    if (role === "admin") throw redirect({ to: "/admin" });
  },
  component: () => (
    <div className="section-padding bg-background min-h-[60vh]">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <Outlet />
      </div>
    </div>
  ),
});
