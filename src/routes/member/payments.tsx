import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { initiatePayment } from "@/lib/membership/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";

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

function canPayOnline(p: PaymentRow) {
  return (
    p.status === "pending" &&
    p.method === "flutterwave" &&
    Boolean(p.application_id || p.member_id)
  );
}

function MemberPaymentsPage() {
  const [payingId, setPayingId] = useState<string | null>(null);

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

  async function handlePay(p: PaymentRow) {
    setPayingId(p.id);
    try {
      const result = p.application_id
        ? await initiatePayment({ application_id: p.application_id })
        : p.member_id
          ? await initiatePayment({ member_id: p.member_id, is_renewal: p.is_renewal })
          : null;

      if (!result) {
        toast.error("Cannot start payment for this record");
        return;
      }
      if (result.link) window.location.href = result.link;
      else toast.error("No payment link returned");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPayingId(null);
    }
  }

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
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 text-sm"
          >
            <div>
              <p>
                <strong>UGX {p.amount_ugx.toLocaleString()}</strong> — {p.status} ({p.method})
                {p.is_renewal ? " · renewal" : ""}
              </p>
              <p className="text-muted-foreground">{new Date(p.created_at).toLocaleString()}</p>
            </div>
            {canPayOnline(p) && (
              <Button
                size="sm"
                className="rounded-full shrink-0 gap-1.5"
                disabled={payingId === p.id}
                onClick={() => handlePay(p)}
              >
                <CreditCard className="h-3.5 w-3.5" />
                {payingId === p.id ? "Redirecting…" : "Pay now"}
              </Button>
            )}
          </li>
        ))}
        {!isLoading && !payments?.length && (
          <p className="text-muted-foreground">No payments yet.</p>
        )}
      </ul>
    </div>
  );
}
