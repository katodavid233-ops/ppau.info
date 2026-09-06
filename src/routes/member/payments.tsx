import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/member/payments")({
  component: MemberPaymentsPage,
});

type PaymentRow = {
  id: string;
  amount_ugx: number;
  status: string;
  method: string;
  application_id: string | null;
  member_id: string | null;
  is_renewal: boolean;
  created_at: string;
};

function MemberPaymentsPage() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["member-payments"],
    queryFn: async () => {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("payments")
        .select(
          "id, amount_ugx, status, method, application_id, member_id, is_renewal, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PaymentRow[];
    },
  });

  return (
    <div>
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/member">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Link>
      </Button>
      <h1 className="text-xl font-bold mb-4">Payment history</h1>
      {isLoading && <p>Loading…</p>}
      <ul className="space-y-3">
        {(payments ?? []).map((p) => (
          <li
            key={p.id}
            className="rounded-lg border p-4 text-sm"
          >
            <p>
              <strong>UGX {p.amount_ugx.toLocaleString()}</strong> — {p.status} ({p.method})
              {p.is_renewal ? " · renewal" : ""}
            </p>
            <p className="text-muted-foreground">{new Date(p.created_at).toLocaleString()}</p>
          </li>
        ))}
        {!isLoading && !payments?.length && (
          <p className="text-muted-foreground">No payments yet.</p>
        )}
      </ul>
    </div>
  );
}