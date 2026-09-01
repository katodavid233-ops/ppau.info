import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchEmailTemplates, fetchEmailSettings } from "@/lib/admin/forms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, ChevronRight, Mail } from "lucide-react";
import { EMAIL_TEMPLATE_SLUGS } from "@/lib/admin/email-templates";
import ppauLogo from "@/assets/PPAU_logo.jpeg";

export const Route = createFileRoute("/admin/email/templates/")({
  component: EmailTemplatesListPage,
});

function EmailTemplatesListPage() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: fetchEmailTemplates,
  });
  const { data: settings } = useQuery({
    queryKey: ["email-settings"],
    queryFn: fetchEmailSettings,
  });

  const bySlug = Object.fromEntries((templates ?? []).map((t) => [t.slug, t]));

  return (
    <div className="space-y-8">
      <Card className="border-primary/20 bg-primary/5 shadow-soft">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-4">
              <img
                src={ppauLogo}
                alt="PPAU"
                className="h-14 w-14 rounded-lg border bg-white p-1 object-contain"
              />
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Email settings
                </CardTitle>
                <CardDescription className="mt-1">
                  Sender, logo, brand color, and renewal reminders
                </CardDescription>
              </div>
            </div>
            <Button asChild className="rounded-full shrink-0">
              <Link to="/admin/email/settings">Open email settings</Link>
            </Button>
          </div>
        </CardHeader>
        {settings && (
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">From</p>
              <p className="font-medium truncate">{settings.from_name}</p>
              <p className="text-xs truncate">{settings.from_email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Logo URL</p>
              <p className="font-mono text-xs truncate">{settings.logo_url}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Brand color</p>
              <p className="font-mono flex items-center gap-2">
                <span
                  className="inline-block h-4 w-4 rounded border"
                  style={{ background: settings.primary_color }}
                />
                {settings.primary_color}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Reminders</p>
              <p className="font-medium">
                {settings.reminders_enabled
                  ? `${settings.reminder_days_before?.join(", ")} days before`
                  : "Off"}
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      <div>
        <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-primary" />
          Message templates
        </h2>
        {isLoading && <p className="text-muted-foreground">Loading templates…</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {EMAIL_TEMPLATE_SLUGS.map((meta) => {
            const t = bySlug[meta.slug];
            return (
              <Card key={meta.slug} className="shadow-soft hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{t?.name ?? meta.name}</CardTitle>
                    <Badge variant={t?.enabled !== false ? "default" : "secondary"}>
                      {t?.enabled !== false ? "On" : "Off"}
                    </Badge>
                  </div>
                  <CardDescription>{meta.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {t && (
                    <p className="text-xs text-muted-foreground mb-3 truncate">
                      Subject: {t.subject}
                    </p>
                  )}
                  <Button size="sm" variant="outline" asChild className="w-full rounded-full">
                    <Link
                      to="/admin/email/templates/$slug"
                      params={{ slug: meta.slug }}
                    >
                      Edit template
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
