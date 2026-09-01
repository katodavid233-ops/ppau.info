import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { adminAction } from "@/lib/membership/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationsTable, MembersTable } from "@/components/admin/MembersTable";
import type { ApplicationRow, MemberRow } from "@/components/admin/MembersTable";
import {
  MembershipTypeToggle,
  countByMembershipType,
  filterByMembershipType,
  type MembershipTypeFilter,
} from "@/components/admin/MembershipTypeToggle";

type AcceptedSearch = {
  type?: MembershipTypeFilter;
};

export const Route = createFileRoute("/admin/members/accepted")({
  validateSearch: (search: Record<string, unknown>): AcceptedSearch => ({
    type: search.type === "student" ? "student" : "professional",
  }),
  component: AcceptedMembersPage,
});

function AcceptedMembersPage() {
  const { type } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [listKind, setListKind] = useState<"members" | "applications">("members");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-accepted"],
    queryFn: async () => {
      const sb = getSupabase();
      const [appsRes, membersRes] = await Promise.all([
        sb
          .from("membership_applications")
          .select("*")
          .eq("status", "approved")
          .order("reviewed_at", { ascending: false }),
        sb.from("members").select("*").order("created_at", { ascending: false }),
      ]);
      if (appsRes.error) throw appsRes.error;
      if (membersRes.error) throw membersRes.error;
      return {
        applications: appsRes.data as ApplicationRow[],
        members: membersRes.data as MemberRow[],
      };
    },
  });

  const memberCounts = useMemo(
    () => countByMembershipType(data?.members ?? []),
    [data?.members],
  );
  const appCounts = useMemo(
    () => countByMembershipType(data?.applications ?? []),
    [data?.applications],
  );

  const members = useMemo(
    () => filterByMembershipType(data?.members ?? [], type),
    [data?.members, type],
  );
  const applications = useMemo(
    () => filterByMembershipType(data?.applications ?? [], type),
    [data?.applications, type],
  );

  const title =
    type === "professional" ? "Professional members" : "Student members";

  function setType(next: MembershipTypeFilter) {
    navigate({ search: { type: next } });
  }

  async function handleReject(applicationId: string, notes: string) {
    setRejectingId(applicationId);
    try {
      const sb = getSupabase();
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (!session?.access_token) throw new Error("Not signed in");
      await adminAction(applicationId, "reject", notes, session.access_token);
      toast.success("Member rejected");
      await queryClient.invalidateQueries({ queryKey: ["admin-accepted"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-rejected"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setRejectingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Registered {type} members and their approved applications
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <MembershipTypeToggle
        value={type}
        onChange={setType}
        professionalCount={memberCounts.professional}
        studentCount={memberCounts.student}
        className="mb-6"
      />

      {isLoading && <p>Loading…</p>}

      {data && (
        <Tabs value={listKind} onValueChange={(v) => setListKind(v as "members" | "applications")}>
          <TabsList className="mb-4">
            <TabsTrigger value="members">
              Members registry ({type === "professional" ? memberCounts.professional : memberCounts.student})
            </TabsTrigger>
            <TabsTrigger value="applications">
              Approved applications ({type === "professional" ? appCounts.professional : appCounts.student})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="members">
            <MembersTable
              members={members}
              hideTypeColumn
              allowReject
              rejectingId={rejectingId}
              onReject={handleReject}
            />
          </TabsContent>
          <TabsContent value="applications">
            <ApplicationsTable
              apps={applications}
              hideTypeColumn
              allowReject
              rejectingId={rejectingId}
              onReject={handleReject}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
