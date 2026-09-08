import { useEffect } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";

/**
 * Keeps the Supabase session alive (auto-refresh) and syncs the router when auth changes.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const sb = getSupabase();
    sb.auth.startAutoRefresh();

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        navigate({ to: "/member/set-password", replace: true });
        return;
      }
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        router.invalidate();
      }
    });

    return () => {
      subscription.unsubscribe();
      sb.auth.stopAutoRefresh();
    };
  }, [router]);

  return children;
}
