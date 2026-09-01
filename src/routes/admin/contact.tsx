import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchContactPageSettings,
  fetchContactSubmissions,
  saveContactPageSettings,
  updateContactSubmissionStatus,
} from "@/lib/contact/api";
import type { ContactItem, ContactItemIcon, ContactPageSettings, SocialLink } from "@/lib/contact/defaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContactDetailsList } from "@/components/admin/ContactDetailsList";
import { ContactSubmissionsList } from "@/components/admin/ContactSubmissionsList";
import { Save, ExternalLink, Plus, Trash2, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/admin/contact")({
  component: AdminContactPage,
});

const ICON_OPTIONS: { value: ContactItemIcon; label: string }[] = [
  { value: "phone", label: "Phone" },
  { value: "mail", label: "Email" },
  { value: "mapPin", label: "Location" },
  { value: "clock", label: "Hours" },
];

function AdminContactPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["contact-page-settings"],
    queryFn: fetchContactPageSettings,
  });
  const {
    data: submissions,
    isLoading: submissionsLoading,
    refetch: refetchSubmissions,
  } = useQuery({
    queryKey: ["contact-submissions"],
    queryFn: fetchContactSubmissions,
  });

  const [draft, setDraft] = useState<ContactPageSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) setDraft(settings);
  }, [settings]);

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    try {
      await saveContactPageSettings(draft);
      toast.success("Contact page saved");
      queryClient.invalidateQueries({ queryKey: ["contact-page-settings"] });
      queryClient.invalidateQueries({ queryKey: ["public-contact-page"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function setSubmissionStatus(id: string, status: "new" | "read" | "archived") {
    try {
      await updateContactSubmissionStatus(id, status);
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }

  function updateItem(index: number, patch: Partial<ContactItem>) {
    if (!draft) return;
    const items = [...draft.contact_items];
    items[index] = { ...items[index], ...patch };
    setDraft({ ...draft, contact_items: items });
  }

  function addItem() {
    if (!draft) return;
    setDraft({
      ...draft,
      contact_items: [
        ...draft.contact_items,
        { icon: "mail", label: "New", value: "", sub: "", href: null },
      ],
    });
  }

  function removeItem(index: number) {
    if (!draft) return;
    setDraft({
      ...draft,
      contact_items: draft.contact_items.filter((_, i) => i !== index),
    });
  }

  function updateSocial(index: number, patch: Partial<SocialLink>) {
    if (!draft) return;
    const links = [...draft.social_links];
    links[index] = { ...links[index], ...patch };
    setDraft({ ...draft, social_links: links });
  }

  function addSocial() {
    if (!draft) return;
    setDraft({
      ...draft,
      social_links: [...draft.social_links, { label: "Link", href: "https://" }],
    });
  }

  function removeSocial(index: number) {
    if (!draft) return;
    setDraft({
      ...draft,
      social_links: draft.social_links.filter((_, i) => i !== index),
    });
  }

  const newCount = submissions?.filter((s) => s.status === "new").length ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Contact page
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edits the public page at{" "}
            <a href="/contact" target="_blank" rel="noreferrer" className="text-primary underline">
              /contact
            </a>
            {" "}and messages from the contact form.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full gap-2" asChild>
            <a href="/contact" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              Preview
            </a>
          </Button>
          <Button onClick={handleSave} disabled={saving || !draft} className="rounded-full gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {isLoading && <p>Loading…</p>}

      {draft && (
        <Tabs defaultValue="messages">
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="messages">
              Contact us messages{newCount > 0 ? ` (${newCount} new)` : ""}
            </TabsTrigger>
            <TabsTrigger value="details">Contact us page list</TabsTrigger>
            <TabsTrigger value="content">Edit page content</TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Contact us form messages</CardTitle>
                  <CardDescription>
                    Inquiries submitted from the public Contact us page
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchSubmissions()}>
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {submissionsLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
                {submissions && (
                  <ContactSubmissionsList
                    submissions={submissions}
                    onStatusChange={setSubmissionStatus}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact us page list</CardTitle>
                <CardDescription>
                  Phone, email, office, and hours shown on{" "}
                  <a href="/contact" target="_blank" rel="noreferrer" className="text-primary underline">
                    /contact
                  </a>
                  . Edit rows under Edit page content → Contact details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactDetailsList items={draft.contact_items} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hero</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Eyebrow</Label>
                  <Input value={draft.hero_eyebrow} onChange={(e) => setDraft({ ...draft, hero_eyebrow: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Title</Label>
                  <Input value={draft.hero_title} onChange={(e) => setDraft({ ...draft, hero_title: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Subtitle</Label>
                  <Textarea value={draft.hero_subtitle} onChange={(e) => setDraft({ ...draft, hero_subtitle: e.target.value })} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Info section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Section label</Label>
                  <Input value={draft.section_label} onChange={(e) => setDraft({ ...draft, section_label: e.target.value })} />
                </div>
                <div>
                  <Label>Section title</Label>
                  <Input value={draft.section_title} onChange={(e) => setDraft({ ...draft, section_title: e.target.value })} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={draft.section_description} onChange={(e) => setDraft({ ...draft, section_description: e.target.value })} />
                </div>
                <div>
                  <Label>Google Maps embed URL</Label>
                  <Input value={draft.map_embed_url} onChange={(e) => setDraft({ ...draft, map_embed_url: e.target.value })} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Contact details</CardTitle>
                <Button type="button" size="sm" variant="outline" onClick={addItem} className="gap-1">
                  <Plus className="h-4 w-4" /> Add row
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {draft.contact_items.map((item, i) => (
                  <div key={i} className="rounded-lg border p-4 space-y-3 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-muted-foreground"
                      onClick={() => removeItem(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid gap-3 sm:grid-cols-2 pr-10">
                      <div>
                        <Label>Icon</Label>
                        <Select value={item.icon} onValueChange={(v) => updateItem(i, { icon: v as ContactItemIcon })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ICON_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Label</Label>
                        <Input value={item.label} onChange={(e) => updateItem(i, { label: e.target.value })} />
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input value={item.value} onChange={(e) => updateItem(i, { value: e.target.value })} />
                      </div>
                      <div>
                        <Label>Link (optional)</Label>
                        <Input
                          value={item.href ?? ""}
                          placeholder="tel:… or mailto:…"
                          onChange={(e) => updateItem(i, { href: e.target.value || null })}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Subtext</Label>
                        <Input value={item.sub ?? ""} onChange={(e) => updateItem(i, { sub: e.target.value })} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Social links</CardTitle>
                <Button type="button" size="sm" variant="outline" onClick={addSocial} className="gap-1">
                  <Plus className="h-4 w-4" /> Add link
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {draft.social_links.map((link, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label>Label</Label>
                      <Input value={link.label} onChange={(e) => updateSocial(i, { label: e.target.value })} />
                    </div>
                    <div className="flex-[2]">
                      <Label>URL</Label>
                      <Input value={link.href} onChange={(e) => updateSocial(i, { href: e.target.value })} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSocial(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact form</CardTitle>
                <CardDescription>Linked to the form on /contact</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={draft.form_enabled} onCheckedChange={(v) => setDraft({ ...draft, form_enabled: v })} />
                    <Label>Form enabled</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={draft.is_published} onCheckedChange={(v) => setDraft({ ...draft, is_published: v })} />
                    <Label>Page published</Label>
                  </div>
                </div>
                <div>
                  <Label>Notification email (new submissions)</Label>
                  <Input
                    type="email"
                    value={draft.notification_email ?? ""}
                    onChange={(e) => setDraft({ ...draft, notification_email: e.target.value || null })}
                  />
                </div>
                <div>
                  <Label>Form title</Label>
                  <Input value={draft.form_title} onChange={(e) => setDraft({ ...draft, form_title: e.target.value })} />
                </div>
                <div>
                  <Label>Form description</Label>
                  <Textarea value={draft.form_description} onChange={(e) => setDraft({ ...draft, form_description: e.target.value })} />
                </div>
                <div>
                  <Label>Submit button label</Label>
                  <Input value={draft.form_submit_label} onChange={(e) => setDraft({ ...draft, form_submit_label: e.target.value })} />
                </div>
                <div>
                  <Label>Success message</Label>
                  <Textarea value={draft.success_message} onChange={(e) => setDraft({ ...draft, success_message: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      )}
    </div>
  );
}
