import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listElections, electionPhase } from "@/lib/voting/api";
import { PageHero } from "@/components/site/PageHero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Vote } from "lucide-react";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/voting/")({
  head: () =>
    pageHead({
      title: "Elections & Voting",
      description: "PPAU elections — view open elections, cast your vote, and see results.",
      path: "/voting",
      keywords: "PPAU elections, PPAU voting, pharmacy professionals election Uganda",
    }),
  component: VotingListPage,
});

function VotingListPage() {
  const { data: elections, isLoading } = useQuery({
    queryKey: ["voting-elections-public"],
    queryFn: listElections,
  });

  return (
    <>
      <PageHero
        eyebrow="Elections"
        title="PPAU Elections"
        subtitle="Vote securely as a verified PPAU member. Results are published after the election closes."
      />
      <section className="section-padding bg-background">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          {isLoading && <p className="text-muted-foreground">Loading elections...</p>}
          {!isLoading && elections?.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No elections are currently available.
              </CardContent>
            </Card>
          )}
          <div className="grid gap-4">
            {elections?.map((election) => {
              const phase = electionPhase(election);
              const isOpen = phase === "Voting open";
              return (
                <Card key={election.id} className="border-border/70">
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Vote className="h-5 w-5 text-primary" />
                          {election.title}
                        </CardTitle>
                        {election.description && (
                          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                            {election.description}
                          </p>
                        )}
                      </div>
                      <Badge variant={isOpen ? "default" : "secondary"}>{phase}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(election.starts_at).toLocaleString()} —{" "}
                      {new Date(election.ends_at).toLocaleString()}
                    </div>
                    <Button asChild disabled={!isOpen && election.status !== "published"}>
                      <Link to="/voting/$id" params={{ id: election.id }}>
                        {isOpen ? "Vote now" : "View election"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
