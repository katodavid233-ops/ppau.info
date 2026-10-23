import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  listLinkableMembers,
  listVoters,
  registerVoterFromMember,
  setVoterAdmin,
  setVoterVerified,
} from "@/lib/voting/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Route = createFileRoute("/admin/voters")({
  component: AdminVotersPage,
});

function AdminVotersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [memberId, setMemberId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: voters, isLoading } = useQuery({
    queryKey: ["admin-voters"],
    queryFn: listVoters,
  });
  const { data: linkable } = useQuery({
    queryKey: ["admin-linkable-members"],
    queryFn: listLinkableMembers,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-voters"] });
    qc.invalidateQueries({ queryKey: ["admin-linkable-members"] });
  };

  const verify = useMutation({
    mutationFn: (vars: { id: string; verified: boolean }) =>
      setVoterVerified(vars.id, vars.verified),
    onSuccess: refresh,
    onError: (err) => setError(err instanceof Error ? err.message : "Update failed"),
  });

  const makeAdmin = useMutation({
    mutationFn: (vars: { id: string; isAdmin: boolean }) => setVoterAdmin(vars.id, vars.isAdmin),
    onSuccess: refresh,
    onError: (err) => setError(err instanceof Error ? err.message : "Update failed"),
  });

  const link = useMutation({
    mutationFn: () => registerVoterFromMember(memberId),
    onSuccess: () => {
      setMemberId("");
      setError(null);
      refresh();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not register voter"),
  });

  const filtered = (voters ?? []).filter((v) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      v.full_name.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      (v.member_no ?? "").toLowerCase().includes(q)
    );
  });

  const verifiedCount = (voters ?? []).filter((v) => v.is_verified).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Voters</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verify member accounts before they can vote. {verifiedCount} of {(voters ?? []).length}{" "}
          verified.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Voter register</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search name, email or membership number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4"
            />
            {isLoading && <p className="text-sm text-muted-foreground">Loading voters...</p>}
            {!isLoading && filtered.length === 0 && (
              <p className="text-sm text-muted-foreground">No voters found.</p>
            )}
            <ul className="divide-y">
              {filtered.map((voter) => (
                <li key={voter.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium flex flex-wrap items-center gap-2">
                      {voter.full_name}
                      <Badge
                        variant={voter.is_verified ? "default" : "outline"}
                        className="text-xs"
                      >
                        {voter.is_verified ? "verified" : "unverified"}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {voter.member_type}
                      </Badge>
                      {voter.is_admin && (
                        <Badge variant="outline" className="text-xs">
                          admin
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {voter.email}
                      {voter.member_no ? ` · ${voter.member_no}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={voter.is_verified ? "outline" : "default"}
                      disabled={verify.isPending}
                      onClick={() => verify.mutate({ id: voter.id, verified: !voter.is_verified })}
                    >
                      {voter.is_verified ? "Unverify" : "Verify"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={makeAdmin.isPending}
                      onClick={() => makeAdmin.mutate({ id: voter.id, isAdmin: !voter.is_admin })}
                    >
                      {voter.is_admin ? "Remove election admin" : "Election admin"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Register from members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Link a member with a portal login to the voter register. They will be marked verified.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="member">Member</Label>
              <select
                id="member"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
              >
                <option value="">Select a member...</option>
                {(linkable ?? []).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} — {m.membership_number}
                  </option>
                ))}
              </select>
            </div>
            <Button
              className="w-full"
              disabled={!memberId || link.isPending}
              onClick={() => link.mutate()}
            >
              {link.isPending ? "Registering..." : "Register voter"}
            </Button>
            {linkable && linkable.length === 0 && (
              <p className="text-xs text-muted-foreground">
                All members with portal accounts are already registered.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
