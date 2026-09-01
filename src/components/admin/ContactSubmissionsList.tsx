import { useMemo, useState } from "react";
import type { ContactSubmission } from "@/lib/contact/defaults";
import { exportContactSubmissionsCsv } from "@/lib/contact/export";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Eye } from "lucide-react";
import { toast } from "sonner";

type Props = {
  submissions: ContactSubmission[];
  onStatusChange: (id: string, status: ContactSubmission["status"]) => void;
};

export function ContactSubmissionsList({ submissions, onStatusChange }: Props) {
  const [filter, setFilter] = useState<"all" | ContactSubmission["status"]>("all");
  const [viewing, setViewing] = useState<ContactSubmission | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return submissions;
    return submissions.filter((s) => s.status === filter);
  }, [submissions, filter]);

  const counts = useMemo(
    () => ({
      new: submissions.filter((s) => s.status === "new").length,
      read: submissions.filter((s) => s.status === "read").length,
      archived: submissions.filter((s) => s.status === "archived").length,
    }),
    [submissions],
  );

  function handleExport() {
    if (!filtered.length) {
      toast.error("No messages to export");
      return;
    }
    exportContactSubmissionsCsv(filtered);
    toast.success(`Exported ${filtered.length} message(s)`);
  }

  if (!submissions.length) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No messages yet. Submissions from the public{" "}
        <a href="/contact" className="text-primary underline" target="_blank" rel="noreferrer">
          Contact us
        </a>{" "}
        form will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "new", "read", "archived"] as const).map((key) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={filter === key ? "default" : "outline"}
              className="rounded-full capitalize"
              onClick={() => setFilter(key)}
            >
              {key === "all" ? `All (${submissions.length})` : `${key} (${counts[key]})`}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full gap-1.5"
          disabled={!filtered.length}
          onClick={handleExport}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-sm whitespace-nowrap">
                  {new Date(s.created_at).toLocaleString("en-UG")}
                </TableCell>
                <TableCell className="font-medium text-sm">{s.full_name}</TableCell>
                <TableCell className="text-sm">
                  <div>{s.email}</div>
                  {s.phone && <div className="text-muted-foreground text-xs">{s.phone}</div>}
                </TableCell>
                <TableCell className="max-w-[160px] truncate text-sm" title={s.subject}>
                  {s.subject}
                </TableCell>
                <TableCell>
                  <Badge variant={s.status === "new" ? "default" : "secondary"}>{s.status}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1"
                    onClick={() => setViewing(s)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Button>
                  <Select
                    value={s.status}
                    onValueChange={(v) => onStatusChange(s.id, v as ContactSubmission["status"])}
                  >
                    <SelectTrigger className="w-[100px] h-8 inline-flex">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No messages in this filter.</p>
      )}

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-lg">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle>{viewing.subject}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="text-muted-foreground">From: </span>
                  {viewing.full_name} &lt;{viewing.email}&gt;
                </p>
                {viewing.phone && (
                  <p>
                    <span className="text-muted-foreground">Phone: </span>
                    {viewing.phone}
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">Received: </span>
                  {new Date(viewing.created_at).toLocaleString("en-UG")}
                </p>
                <div className="rounded-lg border bg-muted/40 p-4 whitespace-pre-wrap">{viewing.message}</div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
