import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { sendMemberBroadcastToAll } from "@/lib/membership/api";
import { fetchEmailSettings } from "@/lib/admin/forms";
import { wrapEmailHtml } from "@/lib/admin/email-templates";
import { EmailSectionNav } from "@/components/admin/EmailSectionNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Megaphone, Send, Settings2, X } from "lucide-react";
import ppauLogo from "@/assets/PPAU_logo.jpeg";

export const Route = createFileRoute("/admin/email/broadcast")({
  component: BroadcastPage,
});

const DEFAULT_SUBJECT = "CAN UGX 500,000 START YOUR CAREER IN MANUFACTURING?";

const DEFAULT_BODY = `<p>As resolved at the 2025 PPAU Annual General Meeting, we are taking practical steps to promote small-scale manufacturing and contribute to the growth of Uganda&rsquo;s local manufacturing industry.</p>
<p>Join us for our forthcoming 4-CPD-point session:</p>
<p><strong>SMALL-SCALE MANUFACTURING OF HERBAL CREAM, HERBAL SYRUP &amp; SANITIZERS</strong></p>
<p>&#128197; <strong>Saturday, 12 September 2026</strong><br />&#128336; <strong>10:00 AM</strong></p>
<p>Learn from an experienced practitioner about the practical opportunities, processes and considerations involved in starting small-scale production.</p>
<p>We are starting with herbal creams, herbal syrups and sanitizers, with more products to come.</p>
<p><strong>Start small. Learn. Manufacture. Grow.</strong></p>
<p>Don&rsquo;t miss this CPD!</p>
<p>PPAU Secretariat</p>`;

function BroadcastPage() {
  const { data: settings } = useQuery({
    queryKey: ["email-settings"],
    queryFn: fetchEmailSettings,
  });

  const { data: memberCount } = useQuery({
    queryKey: ["admin-member-count"],
    queryFn: async () => {
      const sb = getSupabase();
      const { count, error } = await sb
        .from("members")
        .select("email", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(0);
  const [failed, setFailed] = useState(0);
  const [total, setTotal] = useState(0);
  const [failures, setFailures] = useState<{ email: string; error: string }[]>([]);

  const logoPreview = settings?.logo_url?.startsWith("http") ? settings.logo_url : ppauLogo;

  const preview = wrapEmailHtml(body, {
    logoUrl: logoPreview.startsWith("http")
      ? logoPreview
      : `${settings?.app_url ?? "https://ppau.info"}/PPAU_logo.jpeg`,
    primaryColor: settings?.primary_color ?? "#0d9488",
    footerHtml: settings?.footer_html ?? undefined,
  });

  async function handleSend() {
    const sb = getSupabase();
    const {
      data: { session },
    } = await sb.auth.getSession();
    if (!session?.access_token) {
      toast.error("Sign in as admin to send broadcast email");
      return;
    }
    if (!subject.trim() || !body.trim()) {
      toast.error("Enter a subject and message body");
      return;
    }

    setSending(true);
    setSent(0);
    setFailed(0);
    setTotal(0);
    setFailures([]);

    try {
      await sendMemberBroadcastToAll(subject.trim(), body.trim(), session.access_token, (r) => {
        setSent(r.sent);
        setFailed(r.failed);
        setTotal(r.total);
        setFailures((prev) => [...prev, ...r.failures]);
      });
      toast.success("Broadcast finished");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Broadcast failed");
    } finally {
      setSending(false);
    }
  }

  const sentAnything = total > 0;

  return (
    <div>
      <EmailSectionNav title="Send to members" />

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Message
              </CardTitle>
              <CardDescription>
                Sent to all approved members (unique emails) using the configured email provider. If
                the list is large it is sent in batches.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label>Body (HTML)</Label>
                  <span className="text-xs text-muted-foreground">
                    Optional: <span className="font-mono">{"{{name}}"}</span>
                  </span>
                </div>
                <Textarea
                  className="min-h-[360px] font-mono text-xs leading-relaxed"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="<p>Dear {{name}},…</p>"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="rounded-full gap-2"
                      disabled={sending || !memberCount || memberCount === 0}
                    >
                      <Send className="h-4 w-4" />
                      {sending ? "Sending…" : "Send to members"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Send to all members?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This sends email to <strong>{memberCount ?? 0} member record(s)</strong>{" "}
                        (unique email addresses) via{" "}
                        <strong>
                          {settings?.email_provider === "smtp" ? "SMTP" : "Resend API"}
                        </strong>{" "}
                        with sender{" "}
                        {settings
                          ? `${settings.from_name} <${settings.from_email}>`
                          : "the configured sender"}
                        . Emails cannot be recalled once sent.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={sending}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSend();
                        }}
                      >
                        {sending ? "Sending…" : "Send now"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="outline"
                  className="rounded-full"
                  disabled={sending || (subject === DEFAULT_SUBJECT && body === DEFAULT_BODY)}
                  onClick={() => {
                    setSubject(DEFAULT_SUBJECT);
                    setBody(DEFAULT_BODY);
                    setFailures([]);
                  }}
                >
                  <X className="h-4 w-4" />
                  Reset draft
                </Button>

                {sending && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {sentAnything && (
                  <Badge variant="outline" className="gap-1.5">
                    {sent} sent · {failed} failed · {total} total
                  </Badge>
                )}
              </div>

              {sending && total > 0 && (
                <p className="text-sm text-muted-foreground">
                  Sent {sent} of {total} so far…
                </p>
              )}

              {failures.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-destructive">
                    Failed deliveries ({failures.length})
                  </h3>
                  <ul className="space-y-1 text-xs">
                    {failures.slice(0, 10).map((f) => (
                      <li key={f.email} className="text-muted-foreground break-all">
                        <span className="font-mono">{f.email}</span> — {f.error}
                      </li>
                    ))}
                    {failures.length > 10 && (
                      <li className="text-muted-foreground">
                        …and {failures.length - 10} more (check the email log)
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                Preview
              </CardTitle>
              <CardDescription>
                Branded with the sender logo, color, and footer from email settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {body.trim() ? (
                <iframe
                  title="Broadcast preview"
                  srcDoc={preview}
                  className="w-full min-h-[420px] border rounded-lg"
                  sandbox=""
                />
              ) : (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  Enter a body to preview it here.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recipients ({memberCount ?? "…"})</CardTitle>
              <CardDescription>
                Members created when professional/student applications are approved.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>
                Each unique email address receives one copy — a professional and student application
                on the same email is not duplicated.
              </p>
              <p>
                If some fail, the ones that succeeded are already sent; you can retry and the
                failures are shown above.
              </p>
              <p className="pt-2">
                <Link
                  to="/admin/email/settings"
                  className="text-primary underline underline-offset-2"
                >
                  Open email settings
                </Link>{" "}
                — check sender and delivery provider before broadcasting.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
