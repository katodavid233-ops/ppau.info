import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { adminAction, getDocumentUrl, resendPaymentEmail } from "@/lib/membership/api";
import { fetchFormConfig } from "@/lib/admin/forms";
import {
  applicationMetadataRows,
  buildApplicationFormSections,
} from "@/lib/membership/application-display";
import { ApplicationFormAnswers } from "@/components/admin/ApplicationFormAnswers";
import { ApproveWithoutPaymentButton } from "@/components/admin/ApproveWithoutPaymentButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ArrowLeft, CheckCircle, ExternalLink, Mail } from "lucide-react";

export const Route = createFileRoute("/admin/applications/$id")({
  component: ApplicationDetailPage,
});

type AppDocument = {
  id: string;
  document_type: string;
  file_name: string;
  storage_path: string;
};

function ApplicationDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [openingDoc, setOpeningDoc] = useState<string | null>(null);

  const { data: app, isLoading } = useQuery({
    queryKey: ["admin-application", id],
    queryFn: async () => {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("membership_applications")
        .select("*, application_documents(*), payments(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const membershipType =
    app?.membership_type === "student" ? "student" : "professional";

  const { data: formConfig } = useQuery({
    queryKey: ["form-config", membershipType],
    queryFn: () => fetchFormConfig(membershipType),
    enabled: !!app,
  });

  const formSections = useMemo(() => {
    if (!app || !formConfig) return [];
    return buildApplicationFormSections(
      app as Record<string, unknown>,
      formConfig.fields_config,
      formConfig.steps_config,
    );
  }, [app, formConfig]);

  const metadataRows = useMemo(() => {
    if (!app) return [];
    return applicationMetadataRows(app as Record<string, unknown>);
  }, [app]);

  async function getAccessToken() {
    const sb = getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.access_token) throw new Error("Not signed in");
    return session.access_token;
  }

  async function openDocument(doc: AppDocument) {
    setOpeningDoc(doc.id);
    try {
      const token = await getAccessToken();
      const { url } = await getDocumentUrl(doc.id, token);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open document");
    } finally {
      setOpeningDoc(null);
    }
  }

  async function handleResendPaymentEmail() {
    setLoading("resend_payment");
    try {
      const token = await getAccessToken();
      const result = await resendPaymentEmail(id, token);
      toast.success(`Payment email sent to ${result.email}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send email");
    } finally {
      setLoading(null);
    }
  }

  async function runAction(
    action:
      | "approve"
      | "approve_without_payment"
      | "reject"
      | "verify_payment"
      | "reject_payment_proof",
    actionNotes?: string,
  ) {
    setLoading(action);
    try {
      const token = await getAccessToken();
      await adminAction(id, action, actionNotes ?? (notes || undefined), token);
      const label =
        action === "approve" || action === "approve_without_payment"
          ? "accepted"
          : action;
      toast.success(`Application ${label}`);
      queryClient.invalidateQueries({ queryKey: ["admin-application", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setLoading(null);
    }
  }

  if (isLoading || !app) return <p className="py-12">Loading…</p>;

  const documents = (app.application_documents ?? []) as AppDocument[];
  const hasPaymentProof = documents.some((d) => d.document_type === "payment_proof");
  const awaitingPaymentReview =
    app.payment_status === "pending_verification" ||
    (hasPaymentProof &&
      (app.payment_status === "unpaid" || app.payment_status === "failed"));

  const isDecided = app.status === "approved" || app.status === "rejected";

  const needsPayment =
    app.membership_type === "professional" &&
    (app.payment_status === "unpaid" || app.payment_status === "failed");

  /** Accept with payment waiver (draft / pending payment / unpaid professional). */
  const canAcceptWithWaive = !isDecided && needsPayment && !awaitingPaymentReview;

  /** Accept when payment is satisfied (or student — no fee). */
  const canAccept = !isDecided && !awaitingPaymentReview && !needsPayment;

  return (
    <div className="max-w-4xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/admin/applications">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Applications
        </Link>
      </Button>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{app.full_name}</h1>
          <p className="text-muted-foreground">{app.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{app.status}</Badge>
          <Badge variant="outline">{app.payment_status}</Badge>
          {canAccept && (
            <Button
              disabled={!!loading}
              className="rounded-full gap-1.5"
              onClick={() => runAction("approve")}
            >
              <CheckCircle className="h-4 w-4" />
              {loading === "approve" ? "Accepting…" : "Accept"}
            </Button>
          )}
          {canAcceptWithWaive && (
            <ApproveWithoutPaymentButton
              size="default"
              triggerLabel="Accept"
              disabled={!!loading}
              loading={loading === "approve_without_payment"}
              onConfirm={(reason) => runAction("approve_without_payment", reason)}
            />
          )}
        </div>
      </div>

      {app.membership_number && (
        <p className="mb-4 font-semibold text-primary">Membership #: {app.membership_number}</p>
      )}

      {awaitingPaymentReview && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-900 mb-3 font-medium">
            Payment proof submitted — review the document below, then approve or reject the payment.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!!loading}
              className="rounded-full"
              onClick={() => runAction("verify_payment")}
            >
              {loading === "verify_payment" ? "…" : "Approve payment"}
            </Button>
            <Button
              variant="outline"
              disabled={!!loading}
              className="rounded-full"
              onClick={() => {
                if (!notes.trim()) {
                  toast.error("Enter a reason in admin notes (why payment proof is rejected)");
                  return;
                }
                runAction("reject_payment_proof");
              }}
            >
              {loading === "reject_payment_proof" ? "…" : "Reject payment proof"}
            </Button>
          </div>
        </div>
      )}

      {needsPayment && !awaitingPaymentReview && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900 mb-3">
            Payment is outstanding. Send a payment link by email, verify manual payment, or use{" "}
            <strong>Accept</strong> (waive payment — reason required).
          </p>
          <Button
            variant="default"
            className="rounded-full gap-2"
            disabled={!!loading}
            onClick={handleResendPaymentEmail}
          >
            <Mail className="h-4 w-4" />
            {loading === "resend_payment" ? "Sending…" : "Resend payment email"}
          </Button>
        </div>
      )}

      <ApplicationFormAnswers sections={formSections} metadata={metadataRows} />

      <div className="mb-6">
        <h3 className="font-bold mb-3">Documents</h3>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents uploaded.</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-white px-4 py-3 text-sm"
              >
                <span>
                  <span className="font-medium capitalize">{d.document_type.replace(/_/g, " ")}</span>
                  <span className="text-muted-foreground"> — {d.file_name}</span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5"
                  disabled={openingDoc === d.id}
                  onClick={() => openDocument(d)}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {openingDoc === d.id ? "Opening…" : "Open"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Textarea
        placeholder="Admin notes (required for rejection)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="mb-4"
      />

      <div className="flex flex-wrap gap-2">
        {canAccept && (
          <Button disabled={!!loading} className="rounded-full gap-1.5" onClick={() => runAction("approve")}>
            <CheckCircle className="h-4 w-4" />
            {loading === "approve" ? "Accepting…" : "Accept"}
          </Button>
        )}
        {canAcceptWithWaive && (
          <ApproveWithoutPaymentButton
            triggerLabel="Accept (waive payment)"
            disabled={!!loading}
            loading={loading === "approve_without_payment"}
            onConfirm={(reason) => runAction("approve_without_payment", reason)}
          />
        )}
        {app.status !== "rejected" && (
          <Button
            variant="destructive"
            disabled={!!loading}
            onClick={() => {
              if (!notes.trim()) {
                toast.error("Enter a rejection reason in admin notes first");
                return;
              }
              runAction("reject");
            }}
          >
            {loading === "reject" ? "…" : app.status === "approved" ? "Reject member" : "Reject"}
          </Button>
        )}
      </div>
    </div>
  );
}
