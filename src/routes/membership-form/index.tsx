import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IntroNotice } from "@/components/membership/IntroNotice";
import { fetchPublicFormConfig } from "@/lib/admin/forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Star } from "lucide-react";

export const Route = createFileRoute("/membership-form/")({
  component: MembershipFormHub,
});

function MembershipFormHub() {
  const { data: pro } = useQuery({
    queryKey: ["public-form-config", "professional"],
    queryFn: () => fetchPublicFormConfig("professional"),
  });
  const { data: stu } = useQuery({
    queryKey: ["public-form-config", "student"],
    queryFn: () => fetchPublicFormConfig("student"),
  });

  return (
    <>
      <IntroNotice html="<p>Choose professional or student membership below.</p>" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/30 shadow-soft">
          <CardHeader>
            <div className="icon-box mb-2 w-10 h-10">
              <Star className="h-5 w-5" />
            </div>
            <CardTitle>{pro?.title ?? "Professional Membership"}</CardTitle>
            <CardDescription>{pro?.fee_label ?? pro?.subtitle ?? "UGX 50,000 per annum"}</CardDescription>
          </CardHeader>
          <CardContent>
            {pro?.intro_html && (
              <div className="text-sm text-muted-foreground mb-4 prose prose-sm" dangerouslySetInnerHTML={{ __html: pro.intro_html }} />
            )}
            <p className="text-sm text-muted-foreground mb-4">
              For practising pharmacy professionals. Includes online or manual payment options.
            </p>
            <Button asChild className="w-full rounded-full">
              <Link to="/membership-form/professional">Start application</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader>
            <div className="icon-box mb-2 w-10 h-10">
              <BookOpen className="h-5 w-5" />
            </div>
            <CardTitle>{stu?.title ?? "Student Membership"}</CardTitle>
            <CardDescription>{stu?.fee_label ?? stu?.subtitle ?? "Free"}</CardDescription>
          </CardHeader>
          <CardContent>
            {stu?.intro_html && (
              <div className="text-sm text-muted-foreground mb-4 prose prose-sm" dangerouslySetInnerHTML={{ __html: stu.intro_html }} />
            )}
            <p className="text-sm text-muted-foreground mb-4">
              For students in Certificate or Diploma in Pharmacy programmes.
            </p>
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link to="/membership-form/student">Start application</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already a member?{" "}
        <Link to="/member/login" className="text-primary font-medium hover:underline">
          Sign in to the member portal
        </Link>
      </p>
    </>
  );
}
