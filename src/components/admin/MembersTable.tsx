import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RejectMemberButton } from "@/components/admin/RejectMemberButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type MemberRow = {
  id: string;
  full_name: string;
  email: string;
  membership_number: string;
  membership_type: string;
  status: string;
  phone: string | null;
  current_period_end: string | null;
  created_at: string;
  application_id: string | null;
};

export type ApplicationRow = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  institution_name?: string | null;
  programme?: string | null;
  membership_type: string;
  membership_number: string | null;
  status: string;
  payment_status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
};

type RejectHandlers = {
  allowReject?: boolean;
  rejectingId?: string | null;
  onReject?: (applicationId: string, notes: string) => void;
};

export function ApplicationsTable({
  apps,
  showNotes,
  hideTypeColumn,
  allowReject,
  rejectingId,
  onReject,
}: { apps: ApplicationRow[]; showNotes?: boolean; hideTypeColumn?: boolean } & RejectHandlers) {
  if (!apps.length) {
    return <p className="text-muted-foreground text-sm py-8 text-center">No records found.</p>;
  }
  return (
    <div className="rounded-xl border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Institution</TableHead>
            <TableHead>Programme</TableHead>
            {!hideTypeColumn && <TableHead>Type</TableHead>}
            <TableHead>Membership #</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            {showNotes && <TableHead>Notes</TableHead>}
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apps.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium">{app.full_name}</TableCell>
              <TableCell className="text-sm">
                <div>{app.phone?.trim() || "—"}</div>
                <div className="text-muted-foreground text-xs">{app.email}</div>
              </TableCell>
              <TableCell className="text-sm">{app.gender ?? "—"}</TableCell>
              <TableCell className="text-sm max-w-[140px] truncate" title={app.institution_name ?? undefined}>
                {app.institution_name ?? "—"}
              </TableCell>
              <TableCell className="text-sm max-w-[120px] truncate" title={app.programme ?? undefined}>
                {app.programme ?? "—"}
              </TableCell>
              {!hideTypeColumn && (
                <TableCell className="capitalize">{app.membership_type}</TableCell>
              )}
              <TableCell className="font-mono text-xs">{app.membership_number ?? "—"}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal capitalize">
                  {app.status.replace(/_/g, " ")}
                </Badge>
              </TableCell>
              <TableCell>{app.payment_status}</TableCell>
              {showNotes && (
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {app.admin_notes ?? "—"}
                </TableCell>
              )}
              <TableCell className="text-sm whitespace-nowrap">
                {new Date(app.reviewed_at ?? app.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="sm" variant="link" asChild>
                  <Link to="/admin/applications/$id" params={{ id: app.id }}>View</Link>
                </Button>
                {allowReject && onReject && (
                  <RejectMemberButton
                    loading={rejectingId === app.id}
                    onConfirm={(notes) => onReject(app.id, notes)}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function MembersTable({
  members,
  hideTypeColumn,
  allowReject,
  rejectingId,
  onReject,
}: { members: MemberRow[]; hideTypeColumn?: boolean } & RejectHandlers) {
  if (!members.length) {
    return <p className="text-muted-foreground text-sm py-8 text-center">No members found.</p>;
  }
  return (
    <div className="rounded-xl border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Membership #</TableHead>
            {!hideTypeColumn && <TableHead>Type</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Valid until</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{m.full_name}</TableCell>
              <TableCell className="text-sm">{m.email}</TableCell>
              <TableCell className="font-mono text-xs">{m.membership_number}</TableCell>
              {!hideTypeColumn && (
                <TableCell className="capitalize">{m.membership_type}</TableCell>
              )}
              <TableCell>
                <Badge variant={m.status === "active" ? "default" : "secondary"}>{m.status}</Badge>
              </TableCell>
              <TableCell>{m.current_period_end ?? "—"}</TableCell>
              <TableCell className="text-right space-x-2">
                {m.application_id && (
                  <Button size="sm" variant="link" asChild>
                    <Link to="/admin/applications/$id" params={{ id: m.application_id }}>Application</Link>
                  </Button>
                )}
                {allowReject && onReject && m.application_id && (
                  <RejectMemberButton
                    loading={rejectingId === m.application_id}
                    onConfirm={(notes) => onReject(m.application_id!, notes)}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
