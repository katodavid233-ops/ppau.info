import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/admin/StatCard";
import { Banknote, CheckCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPaymentsPage,
});

type PaymentRow = {
  id: string;
  amount_ugx: number;
  method: string;
  status: string;
  is_renewal: boolean;
  flutterwave_tx_ref: string | null;
  created_at: string;
  application_id: string | null;
  member_id: string | null;
  membership_applications?: { full_name: string; email: string } | null;
  members?: { full_name: string; email: string } | null;
};

function AdminPaymentsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const sb = getSupabase();
      const { data: payments, error } = await sb
        .from("payments")
        .select("*, membership_applications(full_name, email), members(full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = payments as PaymentRow[];
      const completed = rows.filter((p) => p.status === "completed");
      const pending = rows.filter((p) => p.status === "pending");
      const revenue = completed.reduce((s, p) => s + p.amount_ugx, 0);
      return { payments: rows, completed: completed.length, pending: pending.length, revenue };
    },
  });

  const statusVariant = (s: string) => {
    if (s === "completed") return "default" as const;
    if (s === "failed") return "destructive" as const;
    return "secondary" as const;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-sm text-muted-foreground">Flutterwave and manual payment records</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Refresh</Button>
      </div>

      {isLoading && <p>Loading…</p>}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <StatCard title="Completed" value={data.completed} icon={CheckCircle} />
            <StatCard title="Pending" value={data.pending} icon={Clock} />
            <StatCard title="Total revenue (UGX)" value={data.revenue.toLocaleString()} icon={Banknote} />
          </div>

          <div className="rounded-xl border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payments.map((p) => {
                  const name =
                    p.membership_applications?.full_name ??
                    p.members?.full_name ??
                    "—";
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <p className="font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.is_renewal ? "Renewal" : "New membership"}
                        </p>
                      </TableCell>
                      <TableCell>UGX {p.amount_ugx.toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{p.method}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[120px] truncate">
                        {p.flutterwave_tx_ref ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {new Date(p.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {p.application_id && (
                          <Button size="sm" variant="link" asChild>
                            <Link to="/admin/applications/$id" params={{ id: p.application_id }}>App</Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {!data.payments.length && (
              <p className="text-center text-muted-foreground text-sm py-8">No payments recorded.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
