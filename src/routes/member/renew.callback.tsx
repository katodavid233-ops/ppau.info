import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/member/renew/callback")({
  component: () => (
    <div className="text-center py-12">
      <CheckCircle className="h-12 w-12 mx-auto text-primary mb-4" />
      <h2 className="text-xl font-bold">Renewal submitted</h2>
      <p className="text-muted-foreground mt-2">Your membership period will update once payment is confirmed.</p>
      <Button asChild className="mt-6 rounded-full"><Link to="/member">Back to dashboard</Link></Button>
    </div>
  ),
});
