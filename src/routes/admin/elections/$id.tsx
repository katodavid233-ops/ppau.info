import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  createNominee,
  createPosition,
  deleteElection,
  deleteNominee,
  deletePosition,
  fetchElection,
  fetchResults,
  updateElection,
  updatePosition,
  uploadNomineePhoto,
  type ElectionStatus,
  type EligibleVoters,
} from "@/lib/voting/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/elections/$id")({
  component: AdminElectionDetailPage,
});

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AdminElectionDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-election", id],
    queryFn: () => fetchElection(id),
  });

  const { data: results } = useQuery({
    queryKey: ["admin-election-results", id],
    queryFn: () => fetchResults(id),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-election", id] });

  const statusMutation = useMutation({
    mutationFn: (status: ElectionStatus) => updateElection(id, { status }),
    onSuccess: refresh,
    onError: (err) => setError(err instanceof Error ? err.message : "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteElection(id),
    onSuccess: () => navigate({ to: "/admin/elections" }),
    onError: (err) => setError(err instanceof Error ? err.message : "Delete failed"),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading election...</p>;
  if (!data) return <p className="text-destructive">Election not found.</p>;

  const { election, positions } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild size="sm" variant="ghost" className="-ml-2 mb-1">
            <Link to="/admin/elections">
              <ArrowLeft className="h-4 w-4 mr-1" /> Elections
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{election.title}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(election.starts_at).toLocaleString()} —{" "}
            {new Date(election.ends_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{election.status}</Badge>
          <Button asChild size="sm" variant="outline">
            <Link to="/voting/$id" params={{ id }}>
              Preview ballot
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Election status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(["draft", "open", "closed", "published"] as ElectionStatus[]).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={election.status === status ? "default" : "outline"}
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate(status)}
            >
              {status}
            </Button>
          ))}
          <Button
            size="sm"
            variant="destructive"
            className="ml-auto"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (confirm("Delete this election and all its positions/nominees?")) {
                deleteMutation.mutate();
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete election
          </Button>
        </CardContent>
      </Card>

      <ElectionSettings id={id} election={election} onSaved={refresh} onError={setError} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Positions &amp; nominees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {positions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Add a position (e.g. President, Secretary) before adding nominees.
            </p>
          )}
          {positions.map((position) => (
            <PositionBlock
              key={position.id}
              position={position}
              results={(results ?? []).filter((r) => r.position_id === position.id)}
              onChanged={refresh}
              onError={setError}
            />
          ))}
          <NewPositionForm electionId={id} onCreated={refresh} onError={setError} />
        </CardContent>
      </Card>
    </div>
  );
}

function ElectionSettings({
  id,
  election,
  onSaved,
  onError,
}: {
  id: string;
  election: NonNullable<Awaited<ReturnType<typeof fetchElection>>>["election"];
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const [form, setForm] = useState({
    title: election.title,
    description: election.description ?? "",
    eligible_voters: election.eligible_voters as EligibleVoters,
    starts_at: toLocalInput(election.starts_at),
    ends_at: toLocalInput(election.ends_at),
    results_public: election.results_public,
  });

  const mutation = useMutation({
    mutationFn: () =>
      updateElection(id, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        eligible_voters: form.eligible_voters,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
        results_public: form.results_public,
      }),
    onSuccess: onSaved,
    onError: (err) => onError(err instanceof Error ? err.message : "Update failed"),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="etitle">Title</Label>
            <Input
              id="etitle"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="edesc">Description</Label>
            <Textarea
              id="edesc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eeligible">Eligible voters</Label>
            <select
              id="eeligible"
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
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.results_public}
              onChange={(e) => setForm({ ...form, results_public: e.target.checked })}
            />
            Publish live results while voting is open
          </label>
          <div className="space-y-1.5">
            <Label htmlFor="estart">Opens</Label>
            <Input
              id="estart"
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eend">Closes</Label>
            <Input
              id="eend"
              type="datetime-local"
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PositionBlock({
  position,
  results,
  onChanged,
  onError,
}: {
  position: NonNullable<Awaited<ReturnType<typeof fetchElection>>>["positions"][number];
  results: { nominee_id: string; vote_count: number }[];
  onChanged: () => void;
  onError: (msg: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [manifesto, setManifesto] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const countFor = (nomineeId: string) =>
    Number(results.find((r) => r.nominee_id === nomineeId)?.vote_count ?? 0);

  const addNominee = useMutation({
    mutationFn: async () => {
      const photo_url = photo ? await uploadNomineePhoto(photo, position.id) : null;
      await createNominee({
        position_id: position.id,
        full_name: name.trim(),
        bio: bio.trim() || null,
        manifesto: manifesto.trim() || null,
        photo_url,
      });
    },
    onSuccess: () => {
      setName("");
      setBio("");
      setManifesto("");
      setPhoto(null);
      setShowForm(false);
      onChanged();
    },
    onError: (err) => onError(err instanceof Error ? err.message : "Could not add nominee"),
  });

  const removePosition = useMutation({
    mutationFn: () => deletePosition(position.id),
    onSuccess: onChanged,
    onError: (err) => onError(err instanceof Error ? err.message : "Could not delete position"),
  });

  const removeNominee = useMutation({
    mutationFn: (nomineeId: string) => deleteNominee(nomineeId),
    onSuccess: onChanged,
    onError: (err) => onError(err instanceof Error ? err.message : "Could not delete nominee"),
  });

  const move = useMutation({
    mutationFn: (sort_order: number) => updatePosition(position.id, { sort_order }),
    onSuccess: onChanged,
    onError: (err) => onError(err instanceof Error ? err.message : "Could not reorder"),
  });

  return (
    <div className="rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold flex items-center gap-2">
            {position.title}
            <Badge variant="outline" className="text-xs">
              {position.eligible_voters}
            </Badge>
          </p>
          {position.description && (
            <p className="text-sm text-muted-foreground">{position.description}</p>
          )}
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => move.mutate(position.sort_order - 1)}>
            ↑
          </Button>
          <Button size="sm" variant="ghost" onClick={() => move.mutate(position.sort_order + 1)}>
            ↓
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              if (confirm(`Delete ${position.title} and its nominees?`)) removePosition.mutate();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ul className="mt-3 divide-y">
        {position.nominees.map((nominee) => (
          <li key={nominee.id} className="flex items-center gap-3 py-2">
            {nominee.photo_url ? (
              <img
                src={nominee.photo_url}
                alt={nominee.full_name}
                className="h-10 w-10 rounded-full object-cover border"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{nominee.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{nominee.bio || "No bio"}</p>
            </div>
            <span className="text-xs text-muted-foreground">{countFor(nominee.id)} votes</span>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                if (confirm(`Remove ${nominee.full_name}?`)) removeNominee.mutate(nominee.id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </li>
        ))}
        {position.nominees.length === 0 && (
          <li className="py-2 text-sm text-muted-foreground">No nominees yet.</li>
        )}
      </ul>

      {showForm ? (
        <form
          className="mt-3 grid gap-2 rounded-lg bg-muted/40 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            addNominee.mutate();
          }}
        >
          <Input
            placeholder="Nominee full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input placeholder="Short bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          <Textarea
            placeholder="Manifesto"
            rows={3}
            value={manifesto}
            onChange={(e) => setManifesto(e.target.value)}
          />
          <div>
            <Label className="text-xs flex items-center gap-1.5 mb-1">
              <Upload className="h-3.5 w-3.5" /> Photo (optional)
            </Label>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" type="submit" disabled={addNominee.isPending}>
              {addNominee.isPending ? "Saving..." : "Add nominee"}
            </Button>
            <Button size="sm" type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add nominee
        </Button>
      )}
    </div>
  );
}

function NewPositionForm({
  electionId,
  onCreated,
  onError,
}: {
  electionId: string;
  onCreated: () => void;
  onError: (msg: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eligible, setEligible] = useState<EligibleVoters>("both");
  const [sortOrder, setSortOrder] = useState(0);

  const mutation = useMutation({
    mutationFn: () =>
      createPosition({
        election_id: electionId,
        title: title.trim(),
        description: description.trim() || null,
        eligible_voters: eligible,
        sort_order: sortOrder,
      }),
    onSuccess: () => {
      setTitle("");
      setDescription("");
      setSortOrder(0);
      onCreated();
    },
    onError: (err) => onError(err instanceof Error ? err.message : "Could not add position"),
  });

  return (
    <form
      className="grid gap-2 rounded-xl border border-dashed p-4 sm:grid-cols-[1fr_140px_90px_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <Input
        placeholder="New position title (e.g. President)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <select
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        value={eligible}
        onChange={(e) => setEligible(e.target.value as EligibleVoters)}
      >
        <option value="both">All members</option>
        <option value="professional">Professional</option>
        <option value="student">Student</option>
      </select>
      <Input
        type="number"
        min={0}
        value={sortOrder}
        onChange={(e) => setSortOrder(Number(e.target.value))}
        title="Sort order"
      />
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding..." : "Add position"}
      </Button>
      <Textarea
        className="sm:col-span-4"
        placeholder="Description (optional)"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
    </form>
  );
}
