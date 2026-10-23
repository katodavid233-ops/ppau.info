import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  createElection,
  listElections,
  type EligibleVoters,
  type ElectionStatus,
} from "@/lib/voting/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Vote } from "lucide-react";

export const Route = createFileRoute("/admin/elections/")({
  component: AdminElectionsPage,
});

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const now = new Date();
const defaults = {
  title: "",
  description: "",
  eligible_voters: "both" as EligibleVoters,
  starts_at: toLocalInput(now),
  ends_at: toLocalInput(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
  status: "draft" as ElectionStatus,
  results_public: false,
};

function AdminElectionsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaults);
  const [error, setError] = useState<string | null>(null);

  const { data: elections, isLoading } = useQuery({
    queryKey: ["admin-elections"],
    queryFn: listElections,
  });

  const mutation = useMutation({
    mutationFn: () =>
      createElection({
        title: form.title.trim(),
        description: form.description.trim() || null,
        eligible_voters: form.eligible_voters,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
        status: form.status,
        results_public: form.results_public,
      }),
    onSuccess: async (election) => {
      setForm(defaults);
      setError(null);
      await qc.invalidateQueries({ queryKey: ["admin-elections"] });
      navigate({ to: "/admin/elections/$id", params: { id: election.id } });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not create election"),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Elections &amp; Voting</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create elections, manage positions and nominees, and publish results.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {isLoading && <p className="text-muted-foreground text-sm">Loading elections...</p>}
          {!isLoading && elections?.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No elections yet. Create one on the right.
              </CardContent>
            </Card>
          )}
          {elections?.map((election) => (
            <Card key={election.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <Vote className="h-5 w-5 text-primary" />
                    {election.title}
                  </CardTitle>
                  <Badge
                    variant={
                      election.status === "open"
                        ? "default"
                        : election.status === "draft"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {election.status}
                  </Badge>
                </div>
                {election.description && (
                  <p className="text-sm text-muted-foreground">{election.description}</p>
                )}
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(election.starts_at).toLocaleString()} —{" "}
                  {new Date(election.ends_at).toLocaleString()}
                </span>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/voting/$id" params={{ id: election.id }}>
                      Preview
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/admin/elections/$id" params={{ id: election.id }}>
                      Manage
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">New election</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="PPAU National Elections 2026"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="eligible">Eligible voters</Label>
                <select
                  id="eligible"
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  value={form.eligible_voters}
                  onChange={(e) =>
                    setForm({ ...form, eligible_voters: e.target.value as EligibleVoters })
                  }
                >
                  <option value="both">All members</option>
                  <option value="professional">Professional members</option>
                  <option value="student">Student members</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="starts">Opens</Label>
                <Input
                  id="starts"
                  type="datetime-local"
                  required
                  value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ends">Closes</Label>
                <Input
                  id="ends"
                  type="datetime-local"
                  required
                  value={form.ends_at}
                  onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ElectionStatus })}
                >
                  <option value="draft">Draft</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.results_public}
                  onChange={(e) => setForm({ ...form, results_public: e.target.checked })}
                />
                Show live results while voting is open
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating..." : "Create election"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
