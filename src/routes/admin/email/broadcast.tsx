import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase/client";
import { sendMemberBroadcastToAll, type BroadcastAttachment } from "@/lib/membership/api";
import { fetchEmailSettings } from "@/lib/admin/forms";
import { wrapEmailHtml, renderTemplateVars } from "@/lib/admin/email-templates";
import {
  NEWSLETTER_DEFAULT_SUBJECT,
  buildNewsletterHtml,
  isFullHtmlDocument,
} from "@/lib/admin/newsletter-template";
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
import {
  CalendarDays,
  Loader2,
  Mail,
  Megaphone,
  Paperclip,
  Send,
  Settings2,
  X,
} from "lucide-react";
import ppauLogo from "@/assets/PPAU_logo.jpeg";

export const Route = createFileRoute("/admin/email/broadcast")({
  component: BroadcastPage,
});

const DEFAULT_SUBJECT = "CAN UGX 500,000 START YOUR CAREER IN MANUFACTURING?";

const DEFAULT_BODY = `<p>As resolved at the 2025 PPAU Annual General Meeting, we are taking practical steps to promote small-scale manufacturing and contribute to the growth of Uganda&rsquo;s local manufacturing industry.</p>
<p>Join us for our forthcoming 4-CPD-point session:</p>
<p><strong>SMALL-SCALE MANUFACTURING OF HERBAL CREAM, HERBAL SYRUP &amp; SANITIZERS</strong></p>
<p>&#128197; <strong>Sunday, 13 September 2026</strong><br />&#128336; <strong>4:00 PM &ndash; 5:30 PM (UTC)</strong></p>
<p>Join on Google Meet: <a href="https://meet.google.com/jbi-xbua-gcy">https://meet.google.com/jbi-xbua-gcy</a></p>
<p>Learn from an experienced practitioner about the practical opportunities, processes and considerations involved in starting small-scale production.</p>
<p>We are starting with herbal creams, herbal syrups and sanitizers, with more products to come.</p>
<p><strong>Start small. Learn. Manufacture. Grow.</strong></p>
<p>Don&rsquo;t miss this CPD!</p>
<p>PPAU Secretariat</p>`;

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const AGM_SUBJECT = "INVITATION TO THE 2026 ANNUAL GENERAL MEETING (AGM)";

const AGM_BODY = `<p>Dear {{first_name}},</p>
<p>Warm greetings from the PPAU Executive Committee!</p>
<p>You are cordially invited to the 2026 PPAU Annual General Meeting (AGM) scheduled for <strong>Saturday, 21st November 2026</strong>, at <strong>Thobani Centre, Kampala Road</strong>, under the theme:</p>
<p><em>&ldquo;Advancing Professional Practice for Sustainable Health Service Delivery and National Development.&rdquo;</em></p>
<p>A total of <strong>15 CPD points</strong> will be awarded to participants.</p>
<h3>OFFICIAL BUSINESS OF THE AGM</h3>
<p>The meeting shall cover the following key areas:</p>
<ol>
<li><strong>Continuing Professional Development (CPD):</strong>
<ul>
<li>Dispensers&rsquo; Private Practice (Drug Dispensary).</li>
<li>Family Planning.</li>
</ul>
</li>
<li><strong>Elections:</strong> Election to fill vacant Executive Committee positions and election of SACCO leaders.</li>
<li><strong>Annual Report:</strong> Presentation and adoption of the Executive Committee&rsquo;s Annual Report for 2025/2026.</li>
<li><strong>Financial Report:</strong> Presentation of the Association&rsquo;s financial report.</li>
<li><strong>Activity Plan:</strong> Presentation and adoption of the Activity Plan for 2026/2027.</li>
<li><strong>Sector Opportunities:</strong> Exploring emerging opportunities, challenges and developments within the health sector and their implications for Dispensers and Pharmacy Assistants.</li>
</ol>
<h3>YOUR PARTICIPATION MATTERS!</h3>
<p>This AGM is more than an annual gathering; it is an opportunity for us to reflect on our achievements, address our challenges and shape the future of our profession.</p>
<p>We shall explore the opportunities available within the health sector, discuss how Dispensers and Pharmacy Assistants can benefit from them, and collectively determine the Association&rsquo;s priorities and activities for the 2026/2027 year.</p>
<p>Come prepared to contribute, share ideas and participate actively. Let us brainstorm together and build a stronger association and a more sustainable future for our profession!</p>
<p>Finally, your Drug Dispensary awaits you! If you have attained the required four years of professional experience, this is an opportunity to learn more about establishing your own Drug Dispensary in accordance with the applicable regulatory requirements. We have a <strong>FULL SESSION</strong> for this.</p>
<p>Please see the program matrix in the attached PDF.</p>
<p>We look forward to your active participation.</p>
<p>Yours in professional service,</p>
<p><strong>General Secretary</strong></p>`;

type PickedAttachment = BroadcastAttachment & { size: number };

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

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
  const [issueNumber, setIssueNumber] = useState("1");
  const [issueDate, setIssueDate] = useState(
    new Date().toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    }),
  );
  const [attachments, setAttachments] = useState<PickedAttachment[]>([]);

  const logoPreview = settings?.logo_url?.startsWith("http") ? settings.logo_url : ppauLogo;

  const isFullDoc = isFullHtmlDocument(body);

  const preview = isFullDoc
    ? renderTemplateVars(body, { name: "Member Name", first_name: "Member Name" })
    : wrapEmailHtml(body, {
        logoUrl: logoPreview.startsWith("http")
          ? logoPreview
          : `${settings?.app_url ?? "https://ppau.info"}/PPAU_logo.jpeg`,
        primaryColor: settings?.primary_color ?? "#0d9488",
        footerHtml: settings?.footer_html ?? undefined,
      });

  function loadNewsletter() {
    setBody(
      buildNewsletterHtml({
        issueNumber,
        issueDate,
        viewOnlineUrl: `${settings?.app_url ?? "https://ppau.info"}/`,
        unsubscribeUrl: `${settings?.app_url ?? "https://ppau.info"}/contact`,
      }),
    );
    setSubject(
      renderTemplateVars(NEWSLETTER_DEFAULT_SUBJECT, {
        issue_number: issueNumber,
        issue_date: issueDate,
      }),
    );
    setFailures([]);
  }

  async function handleAttach(files: FileList | null) {
    if (!files?.length) return;
    const picked: PickedAttachment[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        toast.error(`${file.name} is larger than 10 MB`);
        continue;
      }
      try {
        picked.push({
          filename: file.name,
          contentType: file.type || undefined,
          content: await readFileAsBase64(file),
          size: file.size,
        });
      } catch {
        toast.error(`Could not read ${file.name}`);
      }
    }
    setAttachments((prev) => {
      const merged = [...prev, ...picked];
      if (merged.length > 5) toast.error("You can attach at most 5 files");
      return merged.slice(0, 5);
    });
  }

  function loadAgm() {
    setSubject(AGM_SUBJECT);
    setBody(AGM_BODY);
    setFailures([]);
  }

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
      await sendMemberBroadcastToAll(
        subject.trim(),
        body.trim(),
        session.access_token,
        (r) => {
          setSent(r.sent);
          setFailed(r.failed);
          setTotal(r.total);
          setFailures((prev) => [...prev, ...r.failures]);
        },
        attachments.map(({ filename, content, contentType }) => ({
          filename,
          content,
          contentType,
        })),
      );
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
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Newsletter template</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Loads the branded PPAU newsletter with the logo banner, sections for CPD, news,
                  regulatory updates and upcoming dates. Editable before sending.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Issue number</Label>
                    <Input
                      value={issueNumber}
                      onChange={(e) => setIssueNumber(e.target.value)}
                      placeholder="e.g. 12"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Issue date</Label>
                    <Input
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      placeholder="e.g. October 2026"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5"
                  onClick={loadNewsletter}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Load newsletter into editor
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5"
                  onClick={loadAgm}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  Load AGM 2026 invitation
                </Button>
              </div>

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
                    Optional: <span className="font-mono">{"{{name}}"}</span>{" "}
                    <span className="font-mono">{"{{first_name}}"}</span>
                  </span>
                </div>
                <Textarea
                  className="min-h-[360px] font-mono text-xs leading-relaxed"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="<p>Dear {{name}},…</p>"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label>Attachments</Label>
                  <span className="text-xs text-muted-foreground">Up to 5 files, 10 MB each</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm hover:bg-accent">
                    <Paperclip className="h-3.5 w-3.5" />
                    Add files
                    <input
                      type="file"
                      multiple
                      accept=".pdf,image/*"
                      className="hidden"
                      disabled={sending}
                      onChange={(e) => {
                        void handleAttach(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {attachments.map((a, i) => (
                    <span
                      key={`${a.filename}-${i}`}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                    >
                      <Paperclip className="h-3 w-3" />
                      {a.filename} ({Math.max(1, Math.round(a.size / 1024))} KB)
                      <button
                        type="button"
                        aria-label={`Remove ${a.filename}`}
                        className="ml-1 rounded-full p-0.5 hover:bg-border"
                        onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
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
                        .{" "}
                        {attachments.length > 0
                          ? `${attachments.length} attachment(s) will be included.`
                          : "No attachments."}{" "}
                        Emails cannot be recalled once sent.
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
                  disabled={
                    sending ||
                    (subject === DEFAULT_SUBJECT &&
                      body === DEFAULT_BODY &&
                      attachments.length === 0)
                  }
                  onClick={() => {
                    setSubject(DEFAULT_SUBJECT);
                    setBody(DEFAULT_BODY);
                    setAttachments([]);
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
                {isFullDoc
                  ? "Full newsletter document — shown exactly as members will receive it, including the PPAU banner and images."
                  : "Branded with the sender logo, color, and footer from email settings."}
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
