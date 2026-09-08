#!/usr/bin/env node
/**
 * Merge rows from the old/copy "source" Supabase project into the live project.
 *
 * The old project (cjshrgxpvfstjoapurph) and live project (sxofeylzjjroljjcgmwf)
 * share historical rows (identical UUIDs). This copies ONLY rows that are missing
 * in the live project, preserving UUIDs and timestamps, and repairs FK references
 * that point at auth.users which do not exist in the live project.
 *
 * Usage:
 *   node scripts/migrate-merge-source.mjs --dry-run
 *   node scripts/migrate-merge-source.mjs --apply
 *
 * Requires env vars SRC_SUPABASE_URL, SRC_SERVICE_ROLE_KEY,
 * NEW_SUPABASE_URL, NEW_SERVICE_ROLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";

const DRY_RUN = process.argv.includes("--apply") === false;

const SRC_URL = process.env.SRC_SUPABASE_URL;
const SRC_KEY = process.env.SRC_SERVICE_ROLE_KEY;
const NEW_URL = process.env.NEW_SUPABASE_URL;
const NEW_KEY = process.env.NEW_SERVICE_ROLE_KEY;

for (const [name, v] of [
  ["SRC_SUPABASE_URL", SRC_URL],
  ["SRC_SERVICE_ROLE_KEY", SRC_KEY],
  ["NEW_SUPABASE_URL", NEW_URL],
  ["NEW_SERVICE_ROLE_KEY", NEW_KEY],
]) {
  if (!v) {
    console.error(`Missing env var ${name}`);
    process.exit(1);
  }
}

const src = createClient(SRC_URL, SRC_KEY, { auth: { persistSession: false } });
const dst = createClient(NEW_URL, NEW_KEY, { auth: { persistSession: false } });

const PAGE = 1000;

async function fetchAll(client, table, cols = "*", orderCol = "created_at") {
  const rows = [];
  let from = 0;
  for (;;) {
    let query = client.from(table).select(cols);
    if (orderCol) query = query.order(orderCol, { ascending: true });
    const { data, error } = await query.range(from, from + PAGE - 1);
    if (error) throw new Error(`${table} fetch: ${error.message}`);
    rows.push(...(data ?? []));
    if ((data ?? []).length < PAGE) break;
    from += PAGE;
  }
  return rows;
}

async function fetchIds(client, table, orderCol = "") {
  const rows = await fetchAll(client, table, "id", orderCol);
  return new Set(rows.map((r) => r.id));
}

async function fetchAuthUserIds(client) {
  const ids = [];
  for (let page = 0; ; page++) {
    const { data, error } = await client.auth.admin.listUsers({ page: page + 1, perPage: 200 });
    if (error) throw new Error(`auth users fetch: ${error.message}`);
    ids.push(...data.users.map((u) => u.id));
    if (data.users.length < 200) break;
  }
  return new Set(ids);
}

const missingByTable = {};
const conflictReport = {};

async function inventory() {
  console.log(`Mode: ${DRY_RUN ? "DRY-RUN (no writes)" : "APPLY"}\n`);

  const newAuthIds = await fetchAuthUserIds(dst);
  console.log(`Live project auth.users: ${newAuthIds.size}`);

  const [srcApps, newApps, newAppIds] = await Promise.all([
    fetchAll(src, "membership_applications"),
    fetchAll(dst, "membership_applications"),
    fetchIds(dst, "membership_applications"),
  ]);

  const missingApps = srcApps.filter((a) => !newAppIds.has(a.id));
  missingByTable["membership_applications"] = missingApps;

  const numbersUsedByNew = new Map();
  for (const a of newApps) {
    if (a.membership_number) numbersUsedByNew.set(a.membership_number, a.id);
  }

  const numberConflicts = [];
  for (const a of missingApps) {
    if (a.membership_number && numbersUsedByNew.has(a.membership_number)) {
      const otherId = numbersUsedByNew.get(a.membership_number);
      if (otherId !== a.id) numberConflicts.push({ id: a.id, number: a.membership_number, usedBy: otherId });
    }
  }
  conflictReport["membership_applications.numbers"] = numberConflicts;

  const [srcDocs, newDocIds] = await Promise.all([
    fetchAll(src, "application_documents", "*", "uploaded_at"),
    fetchIds(dst, "application_documents", ""),
  ]);
  const missingDocIds = new Set();
  for (const d of srcDocs) {
    if (!newDocIds.has(d.id)) missingDocIds.add(d.id);
  }
  const missingDocs = srcDocs.filter((d) => missingDocIds.has(d.id));
  missingByTable["application_documents"] = missingDocs;

  const appIdSet = new Set(missingApps.map((a) => a.id));
  const orphanDocs = missingDocs.filter((d) => !appIdSet.has(d.application_id));

  const [srcMembers, newMembers, newMemberIds] = await Promise.all([
    fetchAll(src, "members"),
    fetchAll(dst, "members"),
    fetchIds(dst, "members"),
  ]);
  const missingMembers = srcMembers.filter((m) => !newMemberIds.has(m.id));
  missingByTable["members"] = missingMembers;

  const membersMissingSourceApp = missingMembers.filter((m) => !appIdSet.has(m.application_id));

  const memberNumbersNew = new Set(newMembers.map((m) => m.membership_number));
  const memberNumberConflicts = missingMembers.filter((m) => memberNumbersNew.has(m.membership_number));
  conflictReport["members.numbers"] = memberNumberConflicts.map((m) => ({
    id: m.id,
    number: m.membership_number,
    full_name: m.full_name,
  }));

  const [srcPayments, newPayments, newPaymentIds] = await Promise.all([
    fetchAll(src, "payments"),
    fetchAll(dst, "payments"),
    fetchIds(dst, "payments"),
  ]);
  const missingPayments = srcPayments.filter((p) => !newPaymentIds.has(p.id));
  missingByTable["payments"] = missingPayments;

  const txNew = new Set(newPayments.map((p) => p.flutterwave_tx_ref).filter(Boolean));
  const txConflicts = missingPayments.filter((p) => p.flutterwave_tx_ref && txNew.has(p.flutterwave_tx_ref));
  conflictReport["payments.tx_ref"] = txConflicts.map((p) => ({ id: p.id, ref: p.flutterwave_tx_ref }));

  const [srcSubs, newSubIds] = await Promise.all([
    fetchAll(src, "membership_subscriptions"),
    fetchIds(dst, "membership_subscriptions"),
  ]);
  const missingSubs = srcSubs.filter((s) => !newSubIds.has(s.id));
  missingByTable["membership_subscriptions"] = missingSubs;

  console.log("=== DELTA (rows missing in live project) ===");
  for (const [table, rows] of Object.entries(missingByTable)) {
    console.log(`${table.padEnd(28)} ${rows.length}`);
  }
  console.log("\n=== Conflict analysis ===");
  console.log(
    `membership_applications.membership_number collisions: ${conflictReport["membership_applications.numbers"].length}`,
  );
  console.log(`members.membership_number collisions: ${conflictReport["members.numbers"].length}`);
  console.log(`payments.flutterwave_tx_ref collisions: ${conflictReport["payments.tx_ref"].length}`);
  console.log(`docs migrated but their application is NOT missing (already in live): ${orphanDocs.length}`);
  console.log(`members missing their source application row in live: ${membersMissingSourceApp.length}`);

  console.log("\n=== membership_applications to migrate ===");
  for (const a of missingApps) {
    const numNote = a.membership_number ? `  #${a.membership_number}` : "";
    const numConflict = conflictReport["membership_applications.numbers"].some((c) => c.id === a.id)
      ? "  [NUMBER COLLIDES IN LIVE]"
      : "";
    console.log(
      `- ${a.id}  ${a.full_name}  ${a.membership_type}  ${a.status}/${a.payment_status}  ${a.email}${numNote}${numConflict}`,
    );
  }

  console.log("\n=== application_documents to migrate ===");
  for (const d of missingDocs) {
    const app = missingApps.find((a) => a.id === d.application_id);
    const appName = app ? app.full_name : "(app already in live)";
    console.log(`- ${d.id}  ${d.document_type}  ${d.file_name}  app=${appName}`);
  }

  console.log("\n=== members to migrate ===");
  for (const m of missingMembers) {
    console.log(`- ${m.id}  ${m.full_name}  ${m.membership_number}  ${m.status}  app=${m.application_id}`);
  }

  console.log("\n=== payments to migrate ===");
  for (const p of missingPayments) {
    console.log(`- ${p.id}  ${p.amount_ugx} UGX  ${p.status}  method=${p.method}  app=${p.application_id}`);
  }

  console.log("\n=== membership_subscriptions to migrate ===");
  for (const s of missingSubs) {
    console.log(`- ${s.id}  status=${s.status}  member=${s.member_id}`);
  }

  return {
    newAuthIds,
    missingByTable,
    conflictReport,
    orphanDocAppIds: new Set(orphanDocs.map((d) => d.application_id)),
    membersMissingSourceApp: membersMissingSourceApp.map((m) => m.application_id),
  };
}

async function applyPlan({ newAuthIds, missingByTable, conflictReport }) {
  if (DRY_RUN) {
    console.log("\n(dry-run finished — no changes written)");
    return;
  }

  const neutralize = (row, extraNull = []) => {
    const copy = { ...row };
    for (const col of extraNull) copy[col] = null;
    return copy;
  };

  // 1. Applications
  const apps = missingByTable["membership_applications"];
  const numberCollisions = new Set(
    conflictReport["membership_applications.numbers"].map((c) => c.id),
  );
  let ins = 0;
  for (const a of apps) {
    const row = neutralize(a, ["user_id", "reviewed_by"]);
    if (numberCollisions.has(a.id)) {
      row.membership_number = null;
    }
    const { error } = await dst.from("membership_applications").insert(row);
    if (error) {
      console.error(`  FAIL membership_applications ${a.id}: ${error.message}`);
      continue;
    }
    ins++;
  }
  console.log(`membership_applications inserted: ${ins}/${apps.length}`);

  // 2. Documents
  const docs = missingByTable["application_documents"];
  let dIns = 0;
  for (const d of docs) {
    const { error } = await dst.from("application_documents").insert({ ...d });
    if (error) {
      console.error(`  FAIL application_documents ${d.id}: ${error.message}`);
      continue;
    }
    dIns++;
  }
  console.log(`application_documents inserted: ${dIns}/${docs.length}`);

  // 2b. Copy document files from source storage into live storage bucket
  const BUCKET = "membership-documents";
  let files = 0;
  for (const d of docs) {
    if (!d.storage_path) continue;
    const { data: fileBytes, error: dlErr } = await src.storage.from(BUCKET).download(d.storage_path);
    if (dlErr) {
      console.error(`  FAIL download ${d.storage_path}: ${dlErr.message}`);
      continue;
    }
    const { error: upErr } = await dst.storage.from(BUCKET).upload(d.storage_path, fileBytes, {
      contentType: d.mime_type ?? undefined,
      upsert: true,
    });
    if (upErr) {
      console.error(`  FAIL upload ${d.storage_path}: ${upErr.message}`);
      continue;
    }
    files++;
  }
  console.log(`storage objects copied: ${files}/${docs.length}`);

  // 3. Members
  const members = missingByTable["members"];
  const memberNumberCollisions = new Set(
    conflictReport["members.numbers"].map((c) => c.id),
  );
  let mIns = 0;
  for (const m of members) {
    const row = neutralize(m, ["user_id"]);
    if (memberNumberCollisions.has(m.id)) {
      console.warn(`  SKIP member ${m.id} (${m.full_name}): membership_number collides — manual review required`);
      continue;
    }
    if (m.application_id && !missingByTable["membership_applications"].some((a) => a.id === m.application_id)) {
      console.log(`  NOTE member ${m.id} references application ${m.application_id} already present in live; kept as-is`);
    }
    const { error } = await dst.from("members").insert(row);
    if (error) {
      console.error(`  FAIL members ${m.id}: ${error.message}`);
      continue;
    }
    mIns++;
  }
  console.log(`members inserted: ${mIns}/${members.length}`);

  // 4. Payments
  const payments = missingByTable["payments"];
  const txCollisions = new Set(conflictReport["payments.tx_ref"].map((p) => p.id));
  let pIns = 0;
  for (const p of payments) {
    const row = neutralize(p, ["verified_by"]);
    // member_id references a member that may not exist in live; FKs are nullable
    if (txCollisions.has(p.id)) row.flutterwave_tx_ref = null;
    const { error } = await dst.from("payments").insert(row);
    if (error) {
      console.error(`  FAIL payments ${p.id}: ${error.message}`);
      continue;
    }
    pIns++;
  }
  console.log(`payments inserted: ${pIns}/${payments.length}`);

  // 5. Subscriptions
  const subs = missingByTable["membership_subscriptions"];
  let sIns = 0;
  for (const s of subs) {
    const { error } = await dst.from("membership_subscriptions").insert({ ...s });
    if (error) {
      console.error(`  FAIL membership_subscriptions ${s.id}: ${error.message}`);
      continue;
    }
    sIns++;
  }
  console.log(`membership_subscriptions inserted: ${sIns}/${subs.length}`);

  // 6. Reconcile membership_number_seq so future generated numbers don't collide
  await reconcileSequences();
}

async function reconcileSequences() {
  const { data: apps, error } = await dst
    .from("membership_applications")
    .select("membership_number, membership_type")
    .not("membership_number", "is", null);
  if (error) throw new Error(`seq read: ${error.message}`);

  const maxByKey = {};
  for (const a of apps) {
    const m = /^PPAU-(PRO|STU)-(\d{4})-(\d{5})$/.exec(a.membership_number);
    if (!m) continue;
    const key = `${a.membership_type}|${m[2]}`;
    const n = parseInt(m[3], 10);
    maxByKey[key] = Math.max(maxByKey[key] ?? 0, n);
  }
  console.log("\nReconciling membership_number_seq:");
  for (const [key, value] of Object.entries(maxByKey)) {
    const [type, year] = key.split("|");
    const { error } = await dst.from("membership_number_seq").upsert(
      { year: Number(year), membership_type: type, last_value: value },
      { onConflict: "year,membership_type", ignoreDuplicates: false },
    );
    if (error) console.error(`  FAIL seq ${key}: ${error.message}`);
    else console.log(`  ${key}: last_value -> ${value}`);
  }
}

const plan = await inventory();
await applyPlan(plan);
