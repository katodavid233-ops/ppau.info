import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApplicationsTable } from "@/components/admin/MembersTable";
import { exportApplicationsCsv } from "@/lib/admin/applications-export";
import { deleteApplication } from "@/lib/membership/api";
import { Download, Search, X } from "lucide-react";
import type { ApplicationRow } from "@/components/admin/MembersTable";
import {
  MembershipTypeToggle,
  countByMembershipType,
  filterByMembershipType,
  type MembershipTypeFilter,
} from "@/components/admin/MembershipTypeToggle";

type ApplicationsSearch = {
  type?: MembershipTypeFilter;
  q?: string;
};

export const Route = createFileRoute("/admin/applications/")({
  validateSearch: (search: Record<string, unknown>): ApplicationsSearch => ({
    type: search.type === "student" ? "student" : "professional",
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: AdminApplicationsPage,
});

function AdminApplicationsPage() {
  const { type, q } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
  const query = (q ?? "").trim().toLowerCase();

  const filtered = useMemo(() => {
    const byType = filterByMembershipType(apps ?? [], type);
    if (!query) return byType;
    return byType.filter((app) =>
      [app.full_name, app.email, app.phone, app.membership_number, app.institution_name].some(
        (field) => field?.toLowerCase().includes(query),
      ),
    );
  }, [apps, type, query]);

  const title = type === "professional" ? "Professional applications" : "Student applications";

  function setType(next: MembershipTypeFilter) {
    navigate({ search: { type: next, q } });
  }

  function handleExport() {
    if (!filtered.length) {
      toast.error("No applications to export");
      return;
    }
    exportApplicationsCsv(filtered, type);
    toast.success(`Exported ${filtered.length} application(s)`);
  }

  async function handleDelete(applicationId: string) {
    setDeletingId(applicationId);
    try {
      const sb = getSupabase();
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (!session?.access_token) throw new Error("Not signed in");
      await deleteApplication(applicationId, session.access_token);
      toast.success("Application deleted");
      await queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-accepted"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-rejected"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
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
        className="mb-4"
      />

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q ?? ""}
          placeholder="Search name, email, phone, membership #…"
          className="rounded-full pl-9 pr-9"
          onChange={(e) => navigate({ search: { type, q: e.target.value } })}
        />
        {q && (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
            onClick={() => navigate({ search: { type, q: "" } })}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {query && !isLoading && (
          <p className="text-xs text-muted-foreground mt-1.5">
            {filtered.length} result{filtered.length === 1 ? "" : "s"} for “{q}”
          </p>
        )}
      </div>

      {isLoading && <p>Loading…</p>}
      <ApplicationsTable
        apps={filtered}
        hideTypeColumn
        allowDelete
        deletingId={deletingId}
        onDelete={handleDelete}
      />
    </div>
  );
}
