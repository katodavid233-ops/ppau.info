import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User, Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getDocumentUrl, uploadDocument } from "@/lib/membership/api";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-28 w-28",
} as const;

type Props = {
  applicationId?: string | null;
  fullName?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
  editable?: boolean;
};

function initialsFromName(name: string | null | undefined) {
  if (!name?.trim()) return "";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function MemberProfilePhoto({
  applicationId,
  fullName,
  size = "md",
  className,
  editable = false,
}: Props) {
  const initials = initialsFromName(fullName);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: photoUrl, isLoading } = useQuery({
    queryKey: ["member-photo", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const sb = getSupabase();
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (!session) return null;

      const { data: doc, error } = await sb
        .from("application_documents")
        .select("id")
        .eq("application_id", applicationId!)
        .eq("document_type", "photo")
        .order("uploaded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !doc) return null;

      const { url } = await getDocumentUrl(doc.id, session.access_token);
      return url;
    },
    staleTime: 50 * 60 * 1000,
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !applicationId) return;
    setUploading(true);
    try {
      await uploadDocument(applicationId, "photo", file);
      toast.success("Profile photo updated.");
      await queryClient.invalidateQueries({ queryKey: ["member-photo", applicationId] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const showLoading = isLoading && Boolean(applicationId);
  const canPreview = Boolean(photoUrl);

  return (
    <>
      <div className={cn("relative inline-block", className)}>
        <Avatar
          className={cn(
            sizeClasses[size],
            "ring-2 ring-primary/20 shadow-sm",
            canPreview && "cursor-zoom-in transition-transform hover:scale-105",
          )}
          onClick={canPreview ? () => setPreview(true) : undefined}
        >
          {photoUrl && !isLoading && (
            <AvatarImage
              src={photoUrl}
              alt={fullName ? `${fullName} passport photo` : "Member passport photo"}
            />
          )}
          <AvatarFallback
            className={cn(
              "bg-primary/10 text-primary text-lg font-semibold",
              showLoading && "animate-pulse bg-muted",
            )}
          >
            {showLoading
              ? null
              : initials || <User className="h-1/2 w-1/2 text-muted-foreground" />}
          </AvatarFallback>
        </Avatar>

        {editable && applicationId && (
          <span
            className={cn(
              "absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-background shadow-sm",
              uploading ? "bg-muted" : "bg-primary text-primary-foreground",
            )}
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <button
                type="button"
                aria-label="Change profile photo"
                title="Change profile photo"
                className="flex h-full w-full items-center justify-center rounded-full hover:bg-primary/90 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            )}
          </span>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>

      {canPreview && (
        <Dialog open={preview} onOpenChange={setPreview}>
          <DialogContent className="max-w-md p-2">
            <img
              src={photoUrl!}
              alt={fullName ? `${fullName} passport photo` : "Member passport photo"}
              className="w-full rounded-lg object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
