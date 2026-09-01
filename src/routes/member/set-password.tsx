import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase/client";
import { establishSessionFromAuthCallback, updatePassword } from "@/lib/auth/session";
import { linkMemberAccount } from "@/lib/membership/api";

export const Route = createFileRoute("/member/set-password")({
  component: SetPasswordPage,
});

function SetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const sb = getSupabase();

    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if (cancelled || !session) return;
      if (
        event === "PASSWORD_RECOVERY" ||
        event === "SIGNED_IN" ||
        event === "INITIAL_SESSION" ||
        event === "TOKEN_REFRESHED"
      ) {
        setSessionReady(true);
        setSessionError(null);
        setChecking(false);
      }
    });

    void (async () => {
      const { session, error } = await establishSessionFromAuthCallback(sb);
      if (cancelled) return;

      if (error) {
        setSessionError(error);
        setChecking(false);
        return;
      }
      if (session) {
        setSessionReady(true);
        setChecking(false);
        return;
      }

      setSessionError(
        "This link is invalid or has expired. Request a new password setup link below.",
      );
      setChecking(false);
    })();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      const sb = getSupabase();
      const { data: { session } } = await sb.auth.getSession();
      if (session?.access_token) {
        try {
          await linkMemberAccount(session.access_token);
        } catch {
          /* optional */
        }
      }
      toast.success("Password saved — you can use the member portal");
      navigate({ to: "/member" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set your portal password</CardTitle>
          <CardDescription>
            Use the email address from your PPAU membership application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checking && (
            <p className="text-sm text-muted-foreground mb-4">Verifying your link…</p>
          )}
          {sessionError && !sessionReady && !checking && (
            <p className="text-sm text-destructive mb-4">{sessionError}</p>
          )}
          {sessionReady ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? "Saving…" : "Save password"}
              </Button>
            </form>
          ) : (
            !checking && (
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link to="/member/forgot-password">Request a new setup link</Link>
              </Button>
            )
          )}
          <p className="text-center text-sm text-muted-foreground mt-4">
            <Link to="/member/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
