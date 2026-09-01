import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ApplicationsTable } from "@/components/admin/MembersTable";
import type { ApplicationRow } from "@/components/admin/MembersTable";
import {
  MembershipTypeToggle,
  countByMembershipType,
  filterByMembershipType,
  type MembershipTypeFilter,
} from "@/components/admin/MembershipTypeToggle";

type RejectedSearch = {
  type?: MembershipTypeFilter;
};

export const Route = createFileRoute("/admin/members/rejected")({
  validateSearch: (search: Record<string, unknown>): RejectedSearch => ({
    type: search.type === "student" ? "student" : "professional",
  }),
  component: RejectedMembersPage,
});

function RejectedMembersPage() {
  const { type } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: apps, isLoading, refetch } = useQuery({
    queryKey: ["admin-rejected"],
    queryFn: async () => {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("membership_applications")
        .select("*")
        .eq("status", "rejected")
        .order("reviewed_at", { ascending: false });
      if (error) throw error;
      return data as ApplicationRow[];
    },
  });

  const counts = useMemo(() => countByMembershipType(apps ?? []), [apps]);
  const filtered = useMemo(
    () => filterByMembershipType(apps ?? [], type),
    [apps, type],
  );

  const title =
    type === "professional" ? "Rejected professional applications" : "Rejected student applications";

  function setType(next: MembershipTypeFilter) {
    navigate({ search: { type: next } });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Applications that were not approved — review notes for each case
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <MembershipTypeToggle
        value={type}
        onChange={setType}
        professionalCount={counts.professional}
        studentCount={counts.student}
        className="mb-6"
      />

      {isLoading && <p>Loading…</p>}
      <ApplicationsTable apps={filtered} showNotes hideTypeColumn />
    </div>
  );
}
