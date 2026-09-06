import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, Smartphone } from "lucide-react";

export const Route = createFileRoute("/member/renew")({
  component: MemberRenewPage,
});

function MemberRenewPage() {
  const { data: member } = useQuery({
    queryKey: ["member-record"],
    queryFn: async () => {
      const sb = getSupabase();
      const { data: { user } } = await sb.auth.getUser();
      const { data } = await sb.from("members").select("*").eq("user_id", user?.id).maybeSingle();
      return data;
    },
  });

  return (
    <div>
      <Button variant="ghost" asChild className="mb-4"><Link to="/member"><ArrowLeft className="h-4 w-4 mr-2" />Dashboard</Link></Button>
      <Card>
        <CardHeader>
          <CardTitle>Renew professional membership</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">Annual fee: UGX 50,000</p>
          <div className="flex gap-2">
            <Smartphone className="h-4 w-4 shrink-0 text-primary" />
            <p>
              <strong>Airtel:</strong> Press *185*7# → select (1) bank and follow prompts.
            </p>
          </div>
          <div className="flex gap-2">
            <Smartphone className="h-4 w-4 shrink-0 text-primary" />
            <p>
              <strong>MTN:</strong> Press *165*6# and follow prompts.
            </p>
          </div>
          <div className="flex gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-primary" />
            <p>
              <strong>Equity Bank:</strong> Pharmacy Professionals Association of Uganda (PPAU) Ltd
              — Account <strong>1001203324987</strong>
            </p>
          </div>
          {member && (
            <p className="rounded-lg bg-muted p-3">
              Your membership expires on <strong>{member.current_period_end ?? "—"}</strong>. After
              paying, the association will confirm your renewal and extend your membership.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}