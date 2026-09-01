import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchEmailTemplateBySlug } from "@/lib/admin/forms";
import { EmailTemplateEditor } from "@/components/admin/EmailTemplateEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EMAIL_TEMPLATE_SLUGS } from "@/lib/admin/email-templates";

export const Route = createFileRoute("/admin/email/templates/$slug")({
  component: EditEmailTemplatePage,
});

function EditEmailTemplatePage() {
  const { slug } = Route.useParams();
  const queryClient = useQueryClient();
  const meta = EMAIL_TEMPLATE_SLUGS.find((m) => m.slug === slug);

  const { data, isLoading, error } = useQuery({
    queryKey: ["email-template", slug],
    queryFn: () => fetchEmailTemplateBySlug(slug),
    enabled: !!slug,
  });

  if (!meta) {
    return (
      <div>
        <p className="text-destructive">Unknown template: {slug}</p>
        <Button variant="link" asChild className="mt-2">
          <Link to="/admin/email/templates">Back to templates</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button variant="ghost" asChild className="mb-4 -ml-2">
        <Link to="/admin/email/templates">
          <ArrowLeft className="h-4 w-4 mr-2" />
          All templates
        </Link>
      </Button>
      {isLoading && <p className="text-muted-foreground">Loading template…</p>}
      {error && (
        <p className="text-destructive text-sm">
          Could not load from database: {error instanceof Error ? error.message : "Error"}.
          Using defaults — save to create in database.
        </p>
      )}
      {data && (
        <EmailTemplateEditor
          template={data}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["email-template", slug] });
            queryClient.invalidateQueries({ queryKey: ["email-templates"] });
          }}
        />
      )}
    </div>
  );
}
