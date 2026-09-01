import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  UserCheck,
  UserX,
  CreditCard,
  Clock,
  Banknote,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { data: stats, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const sb = getSupabase();
      const [apps, members, payments] = await Promise.all([
        sb.from("membership_applications").select("status, payment_status, created_at").neq("status", "draft"),
        sb.from("members").select("status"),
        sb.from("payments").select("status, amount_ugx, method, created_at"),
      ]);
      if (apps.error) throw apps.error;
      if (members.error) throw members.error;
      if (payments.error) throw payments.error;

      const applications = apps.data ?? [];
      const pending = applications.filter((a) => a.status === "pending_review").length;
      const approved = applications.filter((a) => a.status === "approved").length;
      const rejected = applications.filter((a) => a.status === "rejected").length;
      const pendingPayment = applications.filter(
        (a) => a.payment_status === "pending_verification" || a.payment_status === "unpaid",
      ).length;

      const completedPayments = (payments.data ?? []).filter((p) => p.status === "completed");
      const revenue = completedPayments.reduce((s, p) => s + (p.amount_ugx ?? 0), 0);
      const activeMembers = (members.data ?? []).filter((m) => m.status === "active").length;

      const { data: recent, error: recentError } = await sb
        .from("membership_applications")
        .select("id, full_name, status, membership_type, created_at")
        .neq("status", "draft")
        .order("created_at", { ascending: false })
        .limit(8);

      if (recentError) throw recentError;

      return {
        totalApplications: applications.length,
        pending,
        approved,
        rejected,
        pendingPayment,
        activeMembers,
        paymentCount: completedPayments.length,
        revenue,
        recent: recent ?? [],
      };
    },
  });

  if (isLoading) {
    return <p className="text-muted-foreground py-8">Loading dashboard…</p>;
  }

  if (isError || !stats) {
    return (
      <div className="py-8">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-sm text-destructive mb-4" role="alert">
          {error instanceof Error ? error.message : "Could not load dashboard data."}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Confirm you are signed in as an admin and that Supabase env vars are set in `.env.local`.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const s = stats;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          PPAU membership overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
        <StatCard title="Total applications" value={s.totalApplications} icon={FileText} />
        <StatCard title="Pending review" value={s.pending} icon={Clock} subtitle="Awaiting decision" />
        <StatCard title="Accepted" value={s.approved} icon={UserCheck} />
        <StatCard title="Rejected" value={s.rejected} icon={UserX} />
        <StatCard title="Active members" value={s.activeMembers} icon={UserCheck} subtitle="In members registry" />
        <StatCard title="Payments received" value={s.paymentCount} icon={CreditCard} />
        <StatCard
          title="Revenue (UGX)"
          value={s.revenue.toLocaleString()}
          icon={Banknote}
          subtitle="Completed payments"
        />
        <StatCard title="Awaiting payment" value={s.pendingPayment} icon={CreditCard} />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button asChild size="sm" className="rounded-full">
          <Link to="/admin/applications" search={{ type: "professional" }}>Prof. applications</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <Link to="/admin/applications" search={{ type: "student" }}>Student applications</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <Link to="/admin/payments">Payments</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <Link to="/admin/members/accepted" search={{ type: "professional" }}>Professional members</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <Link to="/admin/members/accepted" search={{ type: "student" }}>Student members</Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-soft">
        <h2 className="font-bold mb-4">Recent applications</h2>
        <ul className="divide-y">
          {s.recent.map((app) => (
            <li key={app.id} className="flex items-center justify-between py-3 gap-4">
              <div>
                <p className="font-medium">{app.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {app.membership_type} · {new Date(app.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={app.status === "approved" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}>
                  {app.status}
                </Badge>
                <Button size="sm" variant="link" asChild>
                  <Link to="/admin/applications/$id" params={{ id: app.id }}>View</Link>
                </Button>
              </div>
            </li>
          ))}
          {!s.recent.length && (
            <li className="text-sm text-muted-foreground py-4">No applications yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
