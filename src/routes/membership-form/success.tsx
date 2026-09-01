import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({
  application_id: z.string(),
  type: z.enum(["professional", "student"]).optional(),
  membership_number: z.string().optional(),
});

export const Route = createFileRoute("/membership-form/success")({
  validateSearch: searchSchema,
  component: SuccessPage,
});

function SuccessPage() {
  const { application_id, type, membership_number } = Route.useSearch();

  return (
    <div className="rounded-2xl border bg-white p-8 text-center shadow-soft">
      <CheckCircle className="h-14 w-14 mx-auto text-primary mb-4" />
      <h2 className="text-2xl font-bold">Application submitted</h2>
      <p className="text-muted-foreground mt-2 max-w-md mx-auto">
        {type === "student"
          ? "Your student membership application is under review. You will receive an email when approved."
          : "Thank you. Your application reference is below. Track status in the member portal after approval."}
      </p>
      {type === "student" && membership_number && (
        <p className="mt-4 text-sm">
          <span className="text-muted-foreground">Your membership number: </span>
          <span className="font-mono font-semibold text-primary">{membership_number}</span>
        </p>
      )}
      <p className="mt-4 font-mono text-sm bg-muted px-3 py-2 rounded-lg inline-block">
        Reference: {application_id}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/member/login">Member portal</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link to="/membership">Back to membership</Link>
        </Button>
      </div>
    </div>
  );
}
