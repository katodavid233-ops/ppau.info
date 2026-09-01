import { createFileRoute, Outlet } from "@tanstack/react-router";
import { EmailSectionNav } from "@/components/admin/EmailSectionNav";

export const Route = createFileRoute("/admin/email/templates")({
  component: EmailTemplatesLayout,
});

function EmailTemplatesLayout() {
  return (
    <div>
      <EmailSectionNav title="Email templates & settings" />
      <Outlet />
    </div>
  );
}
