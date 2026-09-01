import { useState } from "react";
import { Upload, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadDocument } from "@/lib/membership/api";
import { toast } from "sonner";

type Props = {
  applicationId: string;
  documentType: string;
  label: string;
  accept?: string;
  required?: boolean;
};

export function DocumentUpload({
  applicationId,
  documentType,
  label,
  accept = "image/*,.pdf",
  required,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocument(applicationId, documentType, file);
      setDone(true);
      toast.success(`${label} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" className="relative" disabled={uploading} asChild>
          <label className="cursor-pointer">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : done ? (
              <Check className="h-4 w-4 text-primary mr-2" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {done ? "Uploaded" : "Choose file"}
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept={accept}
              onChange={onChange}
              disabled={uploading}
            />
          </label>
        </Button>
      </div>
    </div>
  );
}
