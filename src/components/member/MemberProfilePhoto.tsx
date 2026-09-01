import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getDocumentUrl } from "@/lib/membership/api";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

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
}: Props) {
  const initials = initialsFromName(fullName);
  const [preview, setPreview] = useState(false);

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

  const showLoading = isLoading && Boolean(applicationId);
  const canPreview = Boolean(photoUrl);

  return (
    <>
      <Avatar
        className={cn(
          sizeClasses[size],
          "ring-2 ring-primary/20 shadow-sm",
          canPreview && "cursor-zoom-in transition-transform hover:scale-105",
          className,
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
          {showLoading ? null : initials || (
            <User className="h-1/2 w-1/2 text-muted-foreground" />
          )}
        </AvatarFallback>
      </Avatar>

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
