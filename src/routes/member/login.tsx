import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
        try {
          await linkMemberAccount(session.access_token);
        } catch {
          /* link optional */
        }
      }
      navigate({ to: "/member" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>PPAU Member Portal</CardTitle>
          <CardDescription>
            Sign in with the email from your application and the password you set.
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
              <Link to="/member/forgot-password" className="text-primary hover:underline">
                First time or forgot password? Set up portal access
              </Link>
            </p>
            <p className="text-muted-foreground">
              New applicant?{" "}
              <Link to="/membership-form" className="text-primary hover:underline">
                Apply here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
