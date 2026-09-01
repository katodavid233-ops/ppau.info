import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/member/application")({
  component: MemberApplicationPage,
});

function MemberApplicationPage() {
  const { data: app, isLoading } = useQuery({
    queryKey: ["member-application"],
    queryFn: async () => {
      const sb = getSupabase();
      const { data: { user } } = await sb.auth.getUser();
      const { data } = await sb
        .from("membership_applications")
        .select("*")
        .or(`user_id.eq.${user?.id},email.eq.${user?.email}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  if (isLoading) return <p>Loading…</p>;
  if (!app) return <p>No application on file.</p>;

  const fields = Object.entries(app).filter(([, v]) => v != null && v !== "" && typeof v !== "object");

  return (
    <div>
      <Button variant="ghost" asChild className="mb-4"><Link to="/member"><ArrowLeft className="h-4 w-4 mr-2" />Dashboard</Link></Button>
      <h1 className="text-xl font-bold mb-4">Your application</h1>
      <div className="rounded-xl border bg-white p-6 grid gap-2 sm:grid-cols-2 text-sm">
        {fields.map(([key, value]) => (
          <div key={key}>
            <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}: </span>
            <span>{Array.isArray(value) ? value.join(", ") : String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
