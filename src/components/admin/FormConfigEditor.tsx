import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveFormConfig } from "@/lib/admin/forms";
import type { MembershipFormConfig, FormFieldConfig, FormDocumentConfig } from "@/lib/membership/form-config-defaults";
import { mergeFormConfig } from "@/lib/membership/form-config-utils";
import { ExternalLink, Save } from "lucide-react";
import { Link } from "@tanstack/react-router";

type Props = {
  config: MembershipFormConfig;
  previewPath: string;
  hubPath?: string;
  onSaved: () => void;
};

export function FormConfigEditor({ config, previewPath, hubPath = "/membership-form", onSaved }: Props) {
  const merged = useMemo(() => mergeFormConfig(config, config), [config]);
  const [draft, setDraft] = useState(merged);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(mergeFormConfig(config, config));
  }, [config]);

  const fieldsByStep = useMemo(() => {
    const map = new Map<string, FormFieldConfig[]>();
    for (const step of draft.steps_config) map.set(step, []);
    for (const field of draft.fields_config) {
      const list = map.get(field.step) ?? [];
      list.push(field);
      map.set(field.step, list);
    }
    return map;
  }, [draft.fields_config, draft.steps_config]);

  function updateField(key: string, patch: Partial<FormFieldConfig>) {
    const fields = draft.fields_config.map((f) =>
      f.key === key ? { ...f, ...patch } : f,
    );
    setDraft({ ...draft, fields_config: fields });
  }

  function updateDoc(index: number, patch: Partial<FormDocumentConfig>) {
    const docs = [...draft.documents_config];
    docs[index] = { ...docs[index]!, ...patch };
    setDraft({ ...draft, documents_config: docs });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveFormConfig(draft.membership_type, draft);
      toast.success("Form saved — public membership form updated");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-between items-start">
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            Changes sync to the live application form after you save (when <strong>Published</strong> is on).
          </p>
          <p className="flex flex-wrap gap-3">
            <Link to={hubPath} className="text-primary underline inline-flex items-center gap-1" target="_blank">
              Membership hub <ExternalLink className="h-3 w-3" />
            </Link>
            <Link to={previewPath} className="text-primary underline inline-flex items-center gap-1" target="_blank">
              Application form <ExternalLink className="h-3 w-3" />
            </Link>
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2 shrink-0">
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save form"}
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Page header</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input value={draft.subtitle ?? ""} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} />
          </div>
          {draft.membership_type === "professional" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Fee (UGX)</Label>
                <Input
                  type="number"
                  value={draft.fee_ugx ?? 50000}
                  onChange={(e) => setDraft({ ...draft, fee_ugx: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Fee label</Label>
                <Input value={draft.fee_label ?? ""} onChange={(e) => setDraft({ ...draft, fee_label: e.target.value })} />
              </div>
            </div>
          )}
          <div>
            <Label>Intro notice (HTML)</Label>
            <Textarea
              className="min-h-[100px] font-mono text-sm"
              value={draft.intro_html ?? ""}
              onChange={(e) => setDraft({ ...draft, intro_html: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={draft.is_published} onCheckedChange={(v) => setDraft({ ...draft, is_published: v })} />
            <Label>Published (visible on public site)</Label>
          </div>
        </CardContent>
      </Card>

      {[...fieldsByStep.entries()].map(([step, fields]) =>
        fields.length > 0 ? (
          <Card key={step}>
            <CardHeader>
              <CardTitle className="text-lg">Step: {step}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto] items-end border-b pb-3 last:border-0"
                >
                  <div>
                    <Label className="text-xs text-muted-foreground">{field.key}</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.key, { label: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Help text</Label>
                    <Input
                      value={field.helpText ?? ""}
                      onChange={(e) => updateField(field.key, { helpText: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pb-2">
                    <Switch
                      checked={field.required}
                      onCheckedChange={(v) => updateField(field.key, { required: v })}
                    />
                    <span className="text-xs">Required</span>
                  </div>
                  <div className="flex items-center gap-2 pb-2">
                    <Switch
                      checked={field.enabled}
                      onCheckedChange={(v) => updateField(field.key, { enabled: v })}
                    />
                    <span className="text-xs">Enabled</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null,
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Required documents</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {draft.documents_config.map((doc, i) => (
            <div key={doc.type} className="flex flex-wrap gap-3 items-end border-b pb-3">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs text-muted-foreground">{doc.type}</Label>
                <Input value={doc.label} onChange={(e) => updateDoc(i, { label: e.target.value })} />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Switch checked={doc.required} onCheckedChange={(v) => updateDoc(i, { required: v })} />
                <span className="text-xs">Required</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
