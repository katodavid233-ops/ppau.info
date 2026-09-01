import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { initiatePayment } from "@/lib/membership/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard } from "lucide-react";

export const Route = createFileRoute("/member/renew")({
  component: MemberRenewPage,
});

function MemberRenewPage() {
  const [loading, setLoading] = useState(false);

  const { data: member } = useQuery({
    queryKey: ["member-record"],
    queryFn: async () => {
      const sb = getSupabase();
      const { data: { user } } = await sb.auth.getUser();
      const { data } = await sb.from("members").select("*").eq("user_id", user?.id).maybeSingle();
      return data;
    },
  });

  async function renew(use_subscription: boolean) {
    if (!member?.id) {
      toast.error("Member record not found");
      return;
    }
    setLoading(true);
    try {
      const { link } = await initiatePayment({
        member_id: member.id,
        is_renewal: true,
        use_subscription,
      });
      if (link) window.location.href = link;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="ghost" asChild className="mb-4"><Link to="/member"><ArrowLeft className="h-4 w-4 mr-2" />Dashboard</Link></Button>
      <Card>
        <CardHeader>
          <CardTitle>Renew professional membership</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Annual fee: UGX 50,000</p>
          <Button className="w-full rounded-full" disabled={loading} onClick={() => renew(false)}>
            <CreditCard className="h-4 w-4 mr-2" />Pay one-time renewal
          </Button>
          <Button variant="outline" className="w-full rounded-full" disabled={loading} onClick={() => renew(true)}>
            Renew with auto-renewal subscription
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
