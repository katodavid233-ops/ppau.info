import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserX } from "lucide-react";

type Props = {
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  onConfirm: (notes: string) => void;
};

export function RejectMemberButton({
  label = "Reject",
  disabled,
  loading,
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");

  function handleConfirm() {
    if (!notes.trim()) return;
    onConfirm(notes.trim());
    setOpen(false);
    setNotes("");
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          className="rounded-full gap-1"
          disabled={disabled || loading}
        >
          <UserX className="h-3.5 w-3.5" />
          {loading ? "Rejecting…" : label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject this member?</AlertDialogTitle>
          <AlertDialogDescription>
            The application will be marked rejected and any linked member record will be suspended.
            The applicant receives a rejection email with your note.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
          <Label htmlFor="reject-notes">Reason (required)</Label>
          <Textarea
            id="reject-notes"
            className="mt-2 min-h-[80px]"
            placeholder="Explain why membership is being revoked or not approved…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={!notes.trim() || loading}
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            Reject
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
