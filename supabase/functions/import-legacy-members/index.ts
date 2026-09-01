import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient, getUserClient } from "../_shared/supabase.ts";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  const pushCell = () => { row.push(cur); cur = ""; };
  const pushRow = () => {
    if (row.length === 0 && !cur.trim()) return;
    pushCell();
    if (row.some((c) => c.trim() !== "")) rows.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else inQuotes = false;
      } else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") pushCell();
    else if (c === "\n") pushRow();
    else if (c === "\r") { if (text[i + 1] === "\n") i++; pushRow(); }
    else cur += c;
  }
  pushRow();
  return rows;
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const authHeader = req.headers.get("Authorization");
    const userClient = getUserClient(authHeader);
    const { data: { user } } = await userClient.auth.getUser();
    if (!user || user.app_metadata?.role !== "admin") {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { csv_text, source = "csv_import" } = await req.json();
    if (!csv_text) return jsonResponse({ error: "csv_text required" }, 400);

    const rows = parseCsv(csv_text);
    const header = rows[0]?.map((h) => h.toLowerCase().trim()) ?? [];
    const nameIdx = header.findIndex((h) => h.includes("name"));
    const regIdx = header.findIndex((h) => h.includes("cadre") || h.includes("registration"));
    const contactIdx = header.findIndex((h) => h.includes("contact"));

    const supabase = getServiceClient();
    let imported = 0;
    let skipped = 0;
    const conflicts: unknown[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]!;
      const fullName = row[nameIdx]?.trim();
      if (!fullName) continue;

      const legacyReg = row[regIdx]?.trim() || null;
      const phone = row[contactIdx]?.trim() || null;
      const placeholderEmail = `legacy+${i}@import.ppau.local`;

      const { data: existing } = await supabase
        .from("members")
        .select("id")
        .or(`full_name.ilike.${fullName},legacy_registration_number.eq.${legacyReg}`)
        .maybeSingle();

      if (existing) {
        skipped++;
        conflicts.push({ row, reason: "duplicate" });
        continue;
      }

      const { data: numResult, error: numErr } = await supabase.rpc(
        "generate_membership_number",
        { p_type: "professional" },
      );

      const membershipNumber =
        (typeof numResult === "string" ? numResult : null) ??
        (numErr ? `PPAU-LEGACY-${i}` : `PPAU-LEGACY-${i}`);

      const { error } = await supabase.from("members").insert({
        email: placeholderEmail,
        full_name: fullName,
        membership_number: membershipNumber,
        membership_type: "professional",
        status: "active",
        source,
        legacy_registration_number: legacyReg,
        phone,
        current_period_start: new Date().toISOString().slice(0, 10),
        current_period_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString()
          .slice(0, 10),
      });

      if (error) {
        conflicts.push({ row, reason: error.message });
        await supabase.from("migration_conflicts").insert({
          source,
          row_data: { fullName, legacyReg, phone },
          conflict_reason: error.message,
        });
      } else {
        imported++;
      }
    }

    return jsonResponse({ imported, skipped, conflicts: conflicts.length });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
