import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { signIn } from "@/lib/auth/session";
import { linkMemberAccount } from "@/lib/membership/api";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/member/login")({
  head: () =>
    pageHead({
      title: "Member Portal Login",
      description:
        "Sign in to the PPAU member portal to view your membership, payments, and application status.",
      path: "/member/login",
      noindex: true,
    }),
  component: MemberLoginPage,
});

function MemberLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { session } = await signIn(email, password);
      if (session?.access_token) {
        linkMemberAccount(session.access_token).catch(() => {
          /* link optional */
        });
      }
      navigate({ to: "/member" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full">
      {/* Brand panel — PPAU seal + wordmark + short copy; hidden on small screens, shown as a slim banner below */}
      <aside className="relative hidden w-1/2 shrink-0 items-stretch overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-teal-950 lg:flex lg:flex-col">
        <div className="relative z-10 flex flex-1 flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <img
              src="/PPAU_logo.jpeg"
              alt="PPAU logo"
              className="h-12 w-12 rounded-full border border-white/30 bg-white/90 object-cover"
            />
            <span className="text-lg font-semibold tracking-tight text-white">
              PPAU Member Portal
            </span>
          </div>

          <div>
            <h2 className="max-w-md text-3xl font-bold leading-tight text-white lg:text-4xl">
              Your membership, payments &amp; portal access — all in one place.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-teal-100">
              Manage renewals, view payment status and stay connected with the
              Pharmaceutical Professionals Association of Uganda.
            </p>
          </div>

          <p className="text-xs text-teal-200/80">
            Pharmaceutical Professionals Association of Uganda
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
      </aside>

      {/* Login form panel */}
      <main className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2 lg:px-8">
        <div className="w-full max-w-md">
          {/* Mobile brand row (only < lg) */}
          <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
            <img
              src="/PPAU_logo.jpeg"
              alt="PPAU logo"
              className="h-10 w-10 rounded-full bg-white object-cover shadow"
            />
            <span className="text-lg font-semibold text-teal-800">PPAU Member Portal</span>
          </div>

          <Card className="border-teal-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-teal-900">
                Welcome back
              </CardTitle>
              <CardDescription className="text-center">
                Sign in with the email you applied with and your portal password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>

              <div className="mt-4 space-y-2 text-center text-sm">
                <p>
                  <Link
                    to="/member/forgot-password"
                    className="font-medium text-teal-700 hover:underline"
                  >
                    First time or forgot your password?
                  </Link>
                </p>
                <p className="text-muted-foreground">
                  Not a member?{" "}
                  <Link
                    to="/membership-form"
                    className="font-medium text-teal-700 hover:underline"
                  >
                    Apply for membership
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
