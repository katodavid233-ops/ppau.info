import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { importLegacyCsv } from "@/lib/membership/api";
import { getSupabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/migration")({
  component: MigrationPage,
});

function MigrationPage() {
  const [csv, setCsv] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);

  async function loadDefaultCsv() {
    const res = await fetch("/data/registered-subscribed-members.csv");
    const text = await res.text();
    setCsv(text);
  }

  async function runImport() {
    setLoading(true);
    try {
      const sb = getSupabase();
      const { data: { session } } = await sb.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const data = await importLegacyCsv(csv, session.access_token);
      setResult(data);
      toast.success(`Imported ${data.imported}, skipped ${data.skipped}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Import legacy members</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Paste CSV content (Name, Cadre/Registration No., Contact) or load the public member list.
      </p>
      <Button variant="outline" className="mb-4" onClick={loadDefaultCsv}>Load registered-subscribed-members.csv</Button>
      <Textarea className="min-h-[200px] font-mono text-xs mb-4" value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="CSV content…" />
      <Button onClick={runImport} disabled={loading || !csv}>{loading ? "Importing…" : "Run import"}</Button>
      {result && (
        <p className="mt-4 text-sm">Imported: {result.imported}, Skipped: {result.skipped}</p>
      )}
    </div>
  );
}
