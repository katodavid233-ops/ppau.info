import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { castVote, fetchElection, isElectionOpen, type Nominee } from "@/lib/voting/api";
import { PageHero } from "@/components/site/PageHero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Vote } from "lucide-react";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/voting/$id/")({
  head: () =>
    pageHead({
      title: "Vote",
      description: "Cast your ballot in a PPAU election.",
      path: "/voting",
    }),
  component: VotingDetailPage,
});

function VotingDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["voting-election", id],
    queryFn: () => fetchElection(id),
  });

  const mutation = useMutation({
    mutationFn: (vars: { positionId: string; nomineeId: string }) =>
      castVote(vars.positionId, vars.nomineeId),
    onSuccess: async () => {
      setMessage({ type: "ok", text: "Your vote has been recorded." });
      await qc.invalidateQueries({ queryKey: ["voting-election", id] });
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "Failed to cast vote";
      setMessage({ type: "err", text: msg });
    },
  });

  if (isLoading) return <p className="section-padding text-muted-foreground">Loading...</p>;
  if (error || !data) {
    return (
      <div className="section-padding">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Election not found"}
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link to="/voting">Back to elections</Link>
        </Button>
      </div>
    );
  }

  const { election, positions, votedPositionIds, voter } = data;
  const open = isElectionOpen(election);

  return (
    <>
      <PageHero
        eyebrow="Ballot"
        title={election.title}
        subtitle={election.description ?? undefined}
      />
      <section className="section-padding bg-background">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant={open ? "default" : "secondary"}>
                {open ? "Voting open" : election.status}
              </Badge>
              {election.status === "published" && (
                <Button asChild size="sm" variant="outline">
                  <Link to="/voting/$id/results" params={{ id }}>
                    View results
                  </Link>
                </Button>
              )}
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link to="/voting">All elections</Link>
            </Button>
          </div>

          {!voter && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sign in required</AlertTitle>
              <AlertDescription>
                Sign in with your member account, then link your voter profile from the member
                portal. Ask the PPAU Secretariat to verify you before voting.
              </AlertDescription>
            </Alert>
          )}
          {voter && !voter.is_verified && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Voter not verified</AlertTitle>
              <AlertDescription>
                Your voter profile exists but hasn't been verified yet. Ask the PPAU Secretariat to
                verify you before voting.
              </AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert variant={message.type === "ok" ? "default" : "destructive"}>
              {message.type === "ok" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {positions.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No positions have been added to this election yet.
              </CardContent>
            </Card>
          )}

          {positions.map((position) => {
            const voted = votedPositionIds.includes(position.id);
            const canVote = open && voter?.is_verified && !voted;
            return (
              <Card key={position.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {position.title}
                    {voted && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Voted
                      </Badge>
                    )}
                  </CardTitle>
                  {position.description && (
                    <p className="text-sm text-muted-foreground">{position.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {position.nominees.map((nominee: Nominee) => (
                    <label
                      key={nominee.id}
                      className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                        canVote ? "cursor-pointer hover:border-primary/60" : "opacity-90"
                      } ${
                        selected[position.id] === nominee.id
                          ? "border-primary ring-1 ring-primary/30"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`pos-${position.id}`}
                        value={nominee.id}
                        disabled={!canVote}
                        checked={selected[position.id] === nominee.id}
                        onChange={() => setSelected((s) => ({ ...s, [position.id]: nominee.id }))}
                        className="accent-primary"
                      />
                      <div className="flex items-center gap-3 min-w-0">
                        {nominee.photo_url ? (
                          <img
                            src={nominee.photo_url}
                            alt={nominee.full_name}
                            className="h-14 w-14 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                            <Vote className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium">{nominee.full_name}</p>
                          {nominee.bio && (
                            <p className="text-sm text-muted-foreground">{nominee.bio}</p>
                          )}
                          {nominee.manifesto && (
                            <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                              {nominee.manifesto}
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                  {canVote && (
                    <Button
                      disabled={!selected[position.id] || mutation.isPending}
                      onClick={() =>
                        mutation.mutate({
                          positionId: position.id,
                          nomineeId: selected[position.id],
                        })
                      }
                    >
                      {mutation.isPending ? "Submitting..." : "Cast vote for this position"}
                    </Button>
                  )}
                  {!open && (
                    <p className="text-sm text-muted-foreground">
                      Voting is not open for this election.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
