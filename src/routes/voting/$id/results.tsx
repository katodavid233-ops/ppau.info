import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchElection, fetchResults } from "@/lib/voting/api";
import { PageHero } from "@/components/site/PageHero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vote } from "lucide-react";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/voting/$id/results")({
  head: () =>
    pageHead({
      title: "Election Results",
      description: "PPAU election results.",
      path: "/voting",
    }),
  component: ResultsPage,
});

function ResultsPage() {
  const { id } = Route.useParams();
  const { data: detail } = useQuery({
    queryKey: ["voting-election", id],
    queryFn: () => fetchElection(id),
  });
  const { data: results, isLoading } = useQuery({
    queryKey: ["voting-results", id],
    queryFn: () => fetchResults(id),
  });

  const groups = (results ?? []).reduce<Record<string, NonNullable<typeof results>>>((acc, row) => {
    const key = row.position_id;
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(row);
    return acc;
  }, {});

  const order = detail?.positions.map((p) => p.id) ?? Object.keys(groups);

  return (
    <>
      <PageHero
        eyebrow="Results"
        title={detail?.election.title ?? "Election Results"}
        subtitle="Vote counts by position and nominee."
      />
      <section className="section-padding bg-background">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <Button asChild size="sm" variant="ghost">
              <Link to="/voting/$id" params={{ id }}>
                Back to ballot
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link to="/voting">All elections</Link>
            </Button>
          </div>

          {isLoading && <p className="text-muted-foreground">Loading results...</p>}
          {order.length === 0 && !isLoading && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Results are not available yet.
              </CardContent>
            </Card>
          )}

          {order.map((pid) => {
            const rows = (groups[pid] ?? []).filter((row) => row.nominee_id);
            if (rows.length === 0) return null;
            const title = rows[0].position_title;
            const max = Math.max(...rows.map((r) => Number(r.vote_count)));
            return (
              <Card key={pid}>
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rows.map((row, idx) => {
                    const count = Number(row.vote_count);
                    const pct = max === 0 ? 0 : Math.round((count / max) * 100);
                    const winner = idx === 0 && count > 0;
                    return (
                      <div key={row.nominee_id} className="flex items-center gap-4">
                        {row.photo_url ? (
                          <img
                            src={row.photo_url}
                            alt={row.nominee_name}
                            className="h-12 w-12 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <Vote className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium flex items-center gap-2">
                              {row.nominee_name}
                              {winner && <span className="text-xs text-primary">Leading</span>}
                            </p>
                            <p className="text-sm font-semibold">
                              {count} {count === 1 ? "vote" : "votes"}
                            </p>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
