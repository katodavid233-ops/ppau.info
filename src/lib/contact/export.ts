import type { ContactSubmission } from "@/lib/contact/defaults";
import { downloadCsv } from "@/lib/admin/export-csv";

export function exportContactSubmissionsCsv(submissions: ContactSubmission[]) {
  const headers = [
    "Date",
    "Full name",
    "Email",
    "Phone",
    "Subject",
    "Message",
    "Status",
    "ID",
  ];

  const rows = submissions.map((s) => [
    new Date(s.created_at).toISOString(),
    s.full_name,
    s.email,
    s.phone ?? "",
    s.subject,
    s.message,
    s.status,
    s.id,
  ]);

  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(`ppau-contact-messages-${date}.csv`, headers, rows);
}
