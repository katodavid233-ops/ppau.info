import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { verifyAdminAuth } from "@/lib/auth/session";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/admin/login") return;
    if (!isSupabaseConfigured) return;

    // Session is in localStorage — unavailable during SSR; verify in the browser only.
    if (typeof window === "undefined") return;

    const result = await verifyAdminAuth();
    if (!result.ok) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminShell,
});

function AdminShell() {
  const isLoginPage = useRouterState({
    select: (s) => s.location.pathname === "/admin/login",
  });

  if (isLoginPage) {
    return (
      <div className="section-padding bg-background min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding bg-background min-h-[60vh]">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <AdminAuthGate>
          <AdminLayout>
            <Outlet />
          </AdminLayout>
        </AdminAuthGate>
      </div>
    </div>
  );
}
