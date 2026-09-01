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
import { CheckCircle } from "lucide-react";

type Props = {
  disabled?: boolean;
  loading?: boolean;
  onConfirm: (reason: string) => void;
  /** Button label (default: Approve without payment) */
  triggerLabel?: string;
  size?: "default" | "sm" | "lg";
};

export function ApproveWithoutPaymentButton({
  disabled,
  loading,
  onConfirm,
  triggerLabel = "Approve without payment",
  size = "sm",
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  function handleConfirm() {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setOpen(false);
    setReason("");
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size={size}
          variant="default"
          className="rounded-full gap-1"
          disabled={disabled || loading}
        >
          <CheckCircle className="h-3.5 w-3.5" />
          {loading ? "Accepting…" : triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Accept without payment?</AlertDialogTitle>
          <AlertDialogDescription>
            The application will be approved and a membership number assigned. Payment will be
            recorded as waived. This reason is stored in admin notes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
          <Label htmlFor="waive-reason">Reason (required)</Label>
          <Textarea
            id="waive-reason"
            className="mt-2 min-h-[80px]"
            placeholder="e.g. Scholarship, board exception, payment received offline…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!reason.trim() || loading}
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            Accept
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
