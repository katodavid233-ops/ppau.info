import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  fetchEmailSettings,
  saveEmailSettings,
  type EmailSettingsDraft,
  type EmailProvider,
} from "@/lib/admin/forms";
import { sendTestEmail } from "@/lib/membership/api";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmailSectionNav } from "@/components/admin/EmailSectionNav";
import { Save, Send } from "lucide-react";
import ppauLogo from "@/assets/PPAU_logo.jpeg";
import { wrapEmailHtml } from "@/lib/admin/email-templates";

export const Route = createFileRoute("/admin/email/settings")({
  component: EmailSettingsPage,
});

function EmailSettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["email-settings"],
    queryFn: fetchEmailSettings,
  });
  const [draft, setDraft] = useState<EmailSettingsDraft | null>(null);
  const [smtpPasswordNew, setSmtpPasswordNew] = useState("");
  const [testTo, setTestTo] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (data) {
      setDraft(data);
      setSmtpPasswordNew("");
    }
  }, [data]);

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    try {
      await saveEmailSettings({
        ...draft,
        smtp_password_new: smtpPasswordNew || undefined,
      });
      toast.success("Email settings saved");
      setSmtpPasswordNew("");
      queryClient.invalidateQueries({ queryKey: ["email-settings"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleTestEmail() {
    const sb = getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.access_token) {
      toast.error("Sign in as admin to send a test email");
      return;
    }
    const to = testTo.trim() || session.user.email;
    if (!to) {
      toast.error("Enter a recipient email");
      return;
    }
    setTesting(true);
    try {
      const result = await sendTestEmail(to, session.access_token);
      toast.success(`Test email sent to ${result.to} via ${result.provider}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test email failed");
    } finally {
      setTesting(false);
    }
  }

  const logoPreview = draft?.logo_url?.startsWith("http") ? draft.logo_url : ppauLogo;

  const headerPreview = draft
    ? wrapEmailHtml("<p>Sample email body — your templates appear below the branded header.</p>", {
        logoUrl: logoPreview.startsWith("http") ? logoPreview : `${draft.app_url}/PPAU_logo.jpeg`,
        primaryColor: draft.primary_color,
        footerHtml: draft.footer_html ?? undefined,
      })
    : "";

  const provider = draft?.email_provider ?? "resend";

  return (
    <div>
      <EmailSectionNav title="Email templates & settings" />

      <div className="flex flex-wrap justify-end gap-2 mb-6">
        <Button variant="outline" asChild size="sm" className="rounded-full">
          <Link to="/admin/email/templates">Back to templates</Link>
        </Button>
        <Button onClick={handleSave} disabled={saving || !draft} className="rounded-full gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>

      {isLoading && <p>Loading…</p>}

      {draft && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery</CardTitle>
                <CardDescription>
                  Choose Resend API or your own SMTP server. Save settings before sending a test.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Provider</Label>
                  <Select
                    value={provider}
                    onValueChange={(v) => setDraft({ ...draft, email_provider: v as EmailProvider })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resend">Resend API</SelectItem>
                      <SelectItem value="smtp">SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {provider === "resend" && (
                  <p className="text-sm text-muted-foreground rounded-lg border bg-muted/30 p-3">
                    Set <span className="font-mono text-xs">RESEND_API_KEY</span> in Supabase Edge Function
                    secrets (Dashboard → Project Settings → Edge Functions). The from address below must be
                    verified in Resend.
                  </p>
                )}

                {provider === "smtp" && (
                  <div className="space-y-4 rounded-lg border p-4">
                    <div>
                      <Label>SMTP host</Label>
                      <Input
                        placeholder="smtp.gmail.com"
                        value={draft.smtp_host ?? ""}
                        onChange={(e) => setDraft({ ...draft, smtp_host: e.target.value || null })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Port</Label>
                        <Input
                          type="number"
                          min={1}
                          max={65535}
                          value={draft.smtp_port ?? 587}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              smtp_port: parseInt(e.target.value, 10) || 587,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-end gap-2 pb-2">
                        <Switch
                          checked={draft.smtp_secure !== false}
                          onCheckedChange={(v) => setDraft({ ...draft, smtp_secure: v })}
                        />
                        <Label className="font-normal">Use TLS (recommended for 587)</Label>
                      </div>
                    </div>
                    <div>
                      <Label>SMTP username</Label>
                      <Input
                        autoComplete="off"
                        value={draft.smtp_user ?? ""}
                        onChange={(e) => setDraft({ ...draft, smtp_user: e.target.value || null })}
                      />
                    </div>
                    <div>
                      <Label>SMTP password</Label>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder={
                          draft.smtp_password_configured
                            ? "Leave blank to keep current password"
                            : "Enter SMTP password"
                        }
                        value={smtpPasswordNew}
                        onChange={(e) => setSmtpPasswordNew(e.target.value)}
                      />
                      {draft.smtp_password_configured && !smtpPasswordNew && (
                        <p className="text-xs text-muted-foreground mt-1">A password is already saved.</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Common: Gmail/Outlook SMTP with app password; port 587 + TLS, or 465 with TLS on.
                    </p>
                  </div>
                )}

                <div className="border-t pt-4 space-y-3">
                  <Label className="text-base font-semibold">Send test email</Label>
                  <Input
                    type="email"
                    placeholder="Recipient (defaults to your admin email)"
                    value={testTo}
                    onChange={(e) => setTestTo(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-full gap-2"
                    disabled={testing}
                    onClick={handleTestEmail}
                  >
                    <Send className="h-4 w-4" />
                    {testing ? "Sending…" : "Send test email"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Uses the selected provider and saved sender settings. Check spam if it does not arrive.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sender</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>From name</Label>
                  <Input value={draft.from_name} onChange={(e) => setDraft({ ...draft, from_name: e.target.value })} />
                </div>
                <div>
                  <Label>From email</Label>
                  <Input type="email" value={draft.from_email} onChange={(e) => setDraft({ ...draft, from_email: e.target.value })} />
                </div>
                <div>
                  <Label>Reply-to (optional)</Label>
                  <Input type="email" value={draft.reply_to ?? ""} onChange={(e) => setDraft({ ...draft, reply_to: e.target.value || null })} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Branding</CardTitle>
                <CardDescription>Logo used in all outgoing emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
                  <img src={ppauLogo} alt="PPAU logo" className="h-20 w-20 object-contain rounded-lg bg-white p-2 border" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Site asset</p>
                    <p className="font-mono text-xs">src/assets/PPAU_logo.jpeg</p>
                    <p className="mt-1">Public: <span className="font-mono">/PPAU_logo.jpeg</span></p>
                  </div>
                </div>
                <div>
                  <Label>Logo URL (absolute, for email clients)</Label>
                  <Input
                    value={draft.logo_url}
                    onChange={(e) => setDraft({ ...draft, logo_url: e.target.value })}
                    placeholder="https://ppau.info/PPAU_logo.jpeg"
                  />
                </div>
                <div>
                  <Label>Primary color (header)</Label>
                  <div className="flex gap-2">
                    <Input type="color" className="w-14 h-10 p-1" value={draft.primary_color} onChange={(e) => setDraft({ ...draft, primary_color: e.target.value })} />
                    <Input value={draft.primary_color} onChange={(e) => setDraft({ ...draft, primary_color: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>App URL (links in emails)</Label>
                  <Input value={draft.app_url} onChange={(e) => setDraft({ ...draft, app_url: e.target.value })} />
                </div>
                <div>
                  <Label>Footer HTML</Label>
                  <Textarea value={draft.footer_html ?? ""} onChange={(e) => setDraft({ ...draft, footer_html: e.target.value || null })} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Renewal reminders</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch checked={draft.reminders_enabled} onCheckedChange={(v) => setDraft({ ...draft, reminders_enabled: v })} />
                  <Label>Send automatic renewal reminders</Label>
                </div>
                <div>
                  <Label>Days before expiry (comma-separated)</Label>
                  <Input
                    value={draft.reminder_days_before?.join(", ") ?? "30, 7"}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        reminder_days_before: e.target.value
                          .split(",")
                          .map((n) => parseInt(n.trim(), 10))
                          .filter((n) => !isNaN(n)),
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg">Email header preview</CardTitle></CardHeader>
            <CardContent>
              <iframe title="Branded preview" srcDoc={headerPreview} className="w-full min-h-[320px] border rounded-lg" sandbox="" />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
