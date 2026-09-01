/**
 * Run locally with service role key:
 * SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/migrate-legacy-members.ts
 */
import { readFileSync } from "fs";
import { parseCsv } from "../src/lib/csv.ts";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const csvPath =
  process.argv[2] ?? "public/data/registered-subscribed-members.csv";

async function main() {
  const csv = readFileSync(csvPath, "utf-8");
  const res = await fetch(`${url}/functions/v1/import-legacy-members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify({ csv_text: csv, source: "csv_import" }),
  });
  const data = await res.json();
  console.log(data);
}

main().catch(console.error);
