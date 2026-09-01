import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApplicationsTable } from "@/components/admin/MembersTable";
import { exportApplicationsCsv } from "@/lib/admin/applications-export";
import { Download } from "lucide-react";
import type { ApplicationRow } from "@/components/admin/MembersTable";
import {
  MembershipTypeToggle,
  countByMembershipType,
  filterByMembershipType,
  type MembershipTypeFilter,
} from "@/components/admin/MembershipTypeToggle";

type ApplicationsSearch = {
  type?: MembershipTypeFilter;
};

export const Route = createFileRoute("/admin/applications/")({
  validateSearch: (search: Record<string, unknown>): ApplicationsSearch => ({
    type: search.type === "student" ? "student" : "professional",
  }),
  component: AdminApplicationsPage,
});

function AdminApplicationsPage() {
  const { type } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: apps, isLoading, refetch } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("membership_applications")
        .select("*")
        .neq("status", "draft")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ApplicationRow[];
    },
  });

  const counts = useMemo(() => countByMembershipType(apps ?? []), [apps]);
  const filtered = useMemo(
    () => filterByMembershipType(apps ?? [], type),
    [apps, type],
  );

  const title = type === "professional" ? "Professional applications" : "Student applications";

  function setType(next: MembershipTypeFilter) {
    navigate({ search: { type: next } });
  }

  function handleExport() {
    if (!filtered.length) {
      toast.error("No applications to export");
      return;
    }
    exportApplicationsCsv(filtered, type);
    toast.success(`Exported ${filtered.length} application(s)`);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Membership applications — switch type below
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-full"
            disabled={!filtered.length}
            onClick={handleExport}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      <MembershipTypeToggle
        value={type}
        onChange={setType}
        professionalCount={counts.professional}
        studentCount={counts.student}
        className="mb-6"
      />

      {isLoading && <p>Loading…</p>}
      <ApplicationsTable apps={filtered} hideTypeColumn />
    </div>
  );
}
