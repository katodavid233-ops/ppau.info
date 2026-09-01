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
import { Calendar, CreditCard, FileText, RefreshCw, BookOpen, Clock, Award, Users, GraduationCap } from "lucide-react";

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
  const isLapsed = member?.status === "lapsed" || (member?.current_period_end && new Date(member.current_period_end) < new Date());

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
            {isLapsed && member.membership_type === "professional" && (
              <Button asChild className="rounded-full mt-4">
                <Link to="/member/renew"><RefreshCw className="h-4 w-4 mr-2" />Renew membership</Link>
              </Button>
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

      <div className="grid gap-4 sm:grid-cols-3">
        <Button variant="outline" asChild className="h-auto py-4 flex-col">
          <Link to="/member/application"><FileText className="h-5 w-5 mb-2" />Application</Link>
        </Button>
        <Button variant="outline" asChild className="h-auto py-4 flex-col">
          <Link to="/member/payments"><CreditCard className="h-5 w-5 mb-2" />Payments</Link>
        </Button>
        {member?.membership_type === "professional" && (
          <Button variant="outline" asChild className="h-auto py-4 flex-col">
            <Link to="/member/renew"><RefreshCw className="h-5 w-5 mb-2" />Renew</Link>
          </Button>
        )}
      </div>

      {member?.status === "active" && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> CPD / CME Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Upcoming continuing professional development opportunities for members.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: BookOpen, title: "Antimicrobial Stewardship", duration: "4 hours" },
                { icon: GraduationCap, title: "Pharmacy Law and Ethics", duration: "3 hours" },
                { icon: Users, title: "Patient Counselling", duration: "5 hours" },
                { icon: Award, title: "Drug Dispensing Practices", duration: "6 hours" },
              ].map((course) => (
                <div key={course.title} className="bg-background rounded-xl border border-border p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="icon-box w-8 h-8 rounded-lg">
                      <course.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-foreground text-sm">{course.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden="true" /> {course.duration}
                  </div>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-4 rounded-full text-xs">
              <Link to="/cpd">View all CPD courses</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
