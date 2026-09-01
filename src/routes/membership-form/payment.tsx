import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUpload } from "@/components/membership/DocumentUpload";
import { initiatePayment } from "@/lib/membership/api";
import { CreditCard, Building2, Smartphone } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  application_id: z.string(),
});

export const Route = createFileRoute("/membership-form/payment")({
  validateSearch: searchSchema,
  component: PaymentPage,
});

function PaymentPage() {
  const { application_id } = Route.useSearch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<"once" | "sub" | null>(null);

  async function payFlutterwave(use_subscription: boolean) {
    setLoading(use_subscription ? "sub" : "once");
    try {
      const { link } = await initiatePayment({ application_id, use_subscription });
      if (link) window.location.href = link;
      else toast.error("No payment link returned");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pay membership fee — UGX 50,000 / year</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full rounded-full" disabled={!!loading} onClick={() => payFlutterwave(false)}>
            <CreditCard className="h-4 w-4 mr-2" />
            {loading === "once" ? "Redirecting…" : "Pay with Flutterwave (one-time)"}
          </Button>
          <Button variant="outline" className="w-full rounded-full" disabled={!!loading} onClick={() => payFlutterwave(true)}>
            {loading === "sub" ? "Redirecting…" : "Pay & set up annual auto-renewal"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manual payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex gap-2"><Smartphone className="h-4 w-4 shrink-0 text-primary" /><p><strong>Airtel:</strong> Press *185*7# → select (1) bank and follow prompts.</p></div>
          <div className="flex gap-2"><Smartphone className="h-4 w-4 shrink-0 text-primary" /><p><strong>MTN:</strong> Press *165*6# and follow prompts.</p></div>
          <div className="flex gap-2"><Building2 className="h-4 w-4 shrink-0 text-primary" />
            <p><strong>Equity Bank:</strong> Pharmacy Professionals Association of Uganda (PPAU) Ltd — Account <strong>1001203324987</strong></p>
          </div>
          <DocumentUpload applicationId={application_id} documentType="payment_proof" label="Upload proof of payment" required />
          <Button variant="secondary" className="w-full rounded-full" onClick={() => navigate({ to: "/membership-form/success", search: { application_id, type: "professional" } })}>
            I have paid manually — continue
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-sm">
        <Link to="/membership-form" className="text-primary hover:underline">Back to membership forms</Link>
      </p>
    </div>
  );
}
