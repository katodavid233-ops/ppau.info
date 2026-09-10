import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { signOut } from "@/lib/auth/session";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchMemberDashboard } from "@/lib/membership/api";
import { MemberProfilePhoto } from "@/components/member/MemberProfilePhoto";
import { fetchCpdPointsServer } from "@/lib/cpd/server";
import type { CpdPointsResponse } from "@/lib/cpd/client";
import { Calendar, Award, Target } from "lucide-react";

const CPD_ANNUAL_TARGET = 30;

export const Route = createFileRoute("/member/")({
  component: MemberDashboard,
});

function MemberDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["member-dashboard"],
    queryFn: async () => {
      const sb = getSupabase();
      const { data: { session } } = await sb.auth.getSession();
      if (!session) throw new Error("Not logged in");
      return fetchMemberDashboard(session.access_token);
    },
  });
  const { data: cpdData, isLoading: cpdLoading } = useQuery<
    CpdPointsResponse | null | undefined
  >({
    queryKey: ["member-cpd-points", data?.member?.membership_number as string | undefined],
    queryFn: async () => {
      const reg = data?.member?.membership_number as string | undefined;
      if (!reg) return undefined;
      return (await fetchCpdPointsServer({ data: { reg } })) as CpdPointsResponse | null | undefined;
    },
    enabled: !!data?.member?.membership_number,
  });

  async function logout() {
    await signOut();
    navigate({ to: "/member/login" });
  }

  if (isLoading) return <p className="py-12">Loading…</p>;

  const member = data?.member;
  const application = data?.applications?.[0];
  const applicationId =
    (member?.application_id as string | undefined) ?? (application?.id as string | undefined);
  const displayName =
    (member?.full_name as string | undefined) ?? (application?.full_name as string | undefined);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Member dashboard</h1>
        <Button variant="ghost" onClick={logout}>Sign out</Button>
      </div>

      {member ? (
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-4">
              <MemberProfilePhoto
                applicationId={applicationId}
                fullName={displayName}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <CardTitle className="flex flex-wrap items-center gap-2">
                  {member.full_name}
                  <Badge>{member.status}</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1 font-mono">
                  {member.membership_number}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Membership number:</strong> {member.membership_number}</p>
            <p><strong>Type:</strong> {member.membership_type}</p>
            {member.ahpc_registration_number && (
              <p><strong>AHPC Registration No.:</strong> {member.ahpc_registration_number}</p>
            )}
            {member.current_period_end && (
              <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Valid until: {member.current_period_end}</p>
            )}
          </CardContent>
        </Card>
      ) : application ? (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-4">
              <MemberProfilePhoto
                applicationId={applicationId}
                fullName={displayName}
                size="lg"
              />
              <CardTitle>Application status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p>Status: <Badge>{application.status}</Badge></p>
            {application.membership_number && (
              <p className="mt-2">
                <strong>Membership number:</strong>{" "}
                <span className="font-mono">{String(application.membership_number)}</span>
              </p>
            )}
            <p className="text-muted-foreground mt-2">Payment: {application.payment_status}</p>
            {application.status === "pending_payment" && application.membership_type === "professional" && (
              <Button asChild className="mt-4 rounded-full">
                <Link to="/membership-form/payment" search={{ application_id: application.id }}>Complete payment</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <p className="text-muted-foreground">No membership record found. <Link to="/membership-form" className="text-primary">Apply</Link></p>
      )}

      {member?.membership_number && (
        <Card className="mt-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> My CPD Points
              <span className="text-xs font-normal text-muted-foreground ml-auto">
                via ppau-cme-cpd.org
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cpdLoading ? (
              <p className="text-sm text-muted-foreground">Loading your CPD points…</p>
            ) : cpdData == null ? (
              <p className="text-sm text-muted-foreground">
                Unable to retrieve CPD points. Please try again later.
              </p>
            ) : cpdData.count === 0 ? (
              <p className="text-sm text-muted-foreground">
                No approved CPD activities yet. Complete modules or attend sessions on the{" "}
                <a
                  href="https://ppau-cme-cpd.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  PPAU CME-CPD portal
                </a>{" "}
                to start earning points.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div>
                    <div className="text-3xl font-bold text-primary">{cpdData.total_points}</div>
                    <div className="text-xs text-muted-foreground">Accumulative CPD points</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-muted-foreground">
                      {Math.min(100, Math.round((cpdData.total_points / CPD_ANNUAL_TARGET) * 100))}%
                      of {CPD_ANNUAL_TARGET}-point annual target
                    </span>
                  </div>
                </div>
                <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                  {cpdData.items.map((item, i) => (
                    <li key={i} className="flex items-start justify-between gap-3 bg-background px-4 py-3 text-sm">
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">{item.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.source === "event" ? "Event / Session" : item.source === "self_learning" ? "Self-Learning" : "Module"}
                          {item.event_date ? ` · ${item.event_date}` : item.date ? ` · ${String(item.date).slice(0, 10)}` : ""}
                          {item.certificate_code ? ` · ${item.certificate_code}` : ""}
                        </div>
                      </div>
                      <div className="font-semibold text-primary shrink-0">
                        +{item.points} pts
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
