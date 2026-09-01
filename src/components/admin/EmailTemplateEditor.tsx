import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { saveEmailTemplate, fetchEmailSettings, type EmailTemplate } from "@/lib/admin/forms";
import { TEMPLATE_VARIABLES, renderTemplateVars, wrapEmailHtml } from "@/lib/admin/email-templates";
import { Save, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ppauLogo from "@/assets/PPAU_logo.jpeg";

const SAMPLE_DATA: Record<string, Record<string, string>> = {
  welcome: { name: "Jane Doe", membership_number: "PPAU-PRO-2026-00001", period_end: "2027-05-22", portal_url: "https://ppau.info/member", invite_link: "https://ppau.info/set-password" },
  application_submitted: { name: "Jane Doe", reference: "abc-123", next_steps: "Complete payment.", portal_url: "https://ppau.info/member/login" },
  payment_received: { name: "Jane Doe", amount: "50,000", reference: "tx-123", portal_url: "https://ppau.info/member" },
  rejected: { name: "Jane Doe", reason: "Incomplete documents." },
  renewal_reminder: { name: "Jane Doe", period_end: "2026-06-01", renew_url: "https://ppau.info/member/renew" },
  subscription_failed: { name: "Jane Doe", renew_url: "https://ppau.info/member/renew" },
  member_invite: { name: "Jane Doe", invite_link: "https://ppau.info/set-password", portal_url: "https://ppau.info/member" },
};

type Props = { template: EmailTemplate; onSaved: () => void };

export function EmailTemplateEditor({ template, onSaved }: Props) {
  const [draft, setDraft] = useState(template);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["email-settings"],
    queryFn: fetchEmailSettings,
  });

  const vars = TEMPLATE_VARIABLES[template.slug] ?? [];

  async function handleSave() {
    setSaving(true);
    try {
      await saveEmailTemplate(draft);
      toast.success("Template saved");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const previewLogo = settings?.logo_url ?? ppauLogo;
  const sample = SAMPLE_DATA[template.slug] ?? { name: "Member" };
  const previewHtml = settings
    ? wrapEmailHtml(renderTemplateVars(draft.body_html, sample), {
        logoUrl: previewLogo.startsWith("http") ? previewLogo : `${settings.app_url}/PPAU_logo.jpeg`,
        primaryColor: settings.primary_color,
        footerHtml: settings.footer_html ?? undefined,
      })
    : renderTemplateVars(draft.body_html, sample);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold">{draft.name}</h2>
          <p className="text-sm text-muted-foreground">{draft.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="gap-2">
            <Eye className="h-4 w-4" /> Preview
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2 rounded-full">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {vars.map((v) => (
          <Badge key={v} variant="secondary" className="font-mono text-xs">{`{{${v}}}`}</Badge>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>Template name</Label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div>
            <Label>Email subject</Label>
            <Input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
          </div>
          <div>
            <Label>Body HTML</Label>
            <Textarea className="min-h-[280px] font-mono text-sm" value={draft.body_html} onChange={(e) => setDraft({ ...draft, body_html: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={draft.enabled} onCheckedChange={(v) => setDraft({ ...draft, enabled: v })} />
            <Label>Enabled</Label>
          </div>
        </div>

        {showPreview && (
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Preview (with logo wrapper)</p>
            <div className="bg-white rounded-lg overflow-hidden border max-h-[500px] overflow-y-auto">
              <iframe title="Email preview" srcDoc={previewHtml} className="w-full min-h-[400px] border-0" sandbox="" />
            </div>
            <img src={ppauLogo} alt="Logo file" className="mt-4 h-16 rounded border" />
            <p className="text-xs text-muted-foreground mt-2">Logo source: /PPAU_logo.jpeg on site, or URL in Email Settings</p>
          </div>
        )}
      </div>
    </div>
  );
}
