import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { verifyAdminAuth } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Client-side guard after SSR: re-check session so we do not kick users out on hydrate.
 */
export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }

    let cancelled = false;

    (async () => {
      const result = await verifyAdminAuth();
      if (cancelled) return;

      if (!result.ok) {
        navigate({ to: "/admin/login", replace: true });
        return;
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!ready) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm">
        Checking session…
      </div>
    );
  }

  return children;
}
