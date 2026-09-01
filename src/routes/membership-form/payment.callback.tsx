import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const searchSchema = z.object({
  application_id: z.string().optional(),
});

export const Route = createFileRoute("/membership-form/payment/callback")({
  validateSearch: searchSchema,
  component: PaymentCallbackPage,
});

function PaymentCallbackPage() {
  const { application_id } = Route.useSearch();
  const [status, setStatus] = useState<"loading" | "paid" | "pending">("loading");

  useEffect(() => {
    if (!application_id) {
      setStatus("pending");
      return;
    }
    const sb = getSupabase();
    const poll = async () => {
      const { data } = await sb
        .from("membership_applications")
        .select("payment_status, status")
        .eq("id", application_id)
        .single();
      if (data?.payment_status === "paid") setStatus("paid");
      else setStatus("pending");
    };
    poll();
    const t = setInterval(poll, 3000);
    return () => clearInterval(t);
  }, [application_id]);

  return (
    <div className="rounded-2xl border bg-white p-8 text-center shadow-soft">
      {status === "loading" && <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />}
      {status === "paid" && (
        <>
          <CheckCircle className="h-12 w-12 mx-auto text-primary mb-4" />
          <h2 className="text-xl font-bold">Payment received</h2>
          <p className="text-muted-foreground mt-2">Your application is now under review.</p>
        </>
      )}
      {status === "pending" && (
        <>
          <XCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-bold">Payment processing</h2>
          <p className="text-muted-foreground mt-2">If you completed payment, status will update shortly.</p>
        </>
      )}
      <Button asChild className="mt-6 rounded-full">
        <Link to="/membership-form/success" search={{ application_id: application_id ?? "", type: "professional" }}>
          Continue
        </Link>
      </Button>
    </div>
  );
}
