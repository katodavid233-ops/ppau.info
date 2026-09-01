import type { ApplicationRow } from "@/components/admin/MembersTable";
import { downloadCsv } from "@/lib/admin/export-csv";
import type { MembershipTypeFilter } from "@/components/admin/MembershipTypeToggle";

export function exportApplicationsCsv(
  apps: ApplicationRow[],
  membershipType: MembershipTypeFilter,
) {
  const headers = [
    "Full name",
    "Email",
    "Phone",
    "Gender",
    "Institution",
    "Programme",
    "Membership number",
    "Status",
    "Payment status",
    "Submitted",
    "Application ID",
  ];

  const rows = apps.map((app) => [
    app.full_name,
    app.email,
    app.phone ?? "",
    app.gender ?? "",
    app.institution_name ?? "",
    app.programme ?? "",
    app.membership_number ?? "",
    app.status,
    app.payment_status,
    new Date(app.created_at).toISOString().slice(0, 10),
    app.id,
  ]);

  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(`ppau-${membershipType}-applications-${date}.csv`, headers, rows);
}
