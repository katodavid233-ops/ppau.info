import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getUserClient, getServiceClient } from "../_shared/supabase.ts";
import { sendBroadcastEmail } from "../_shared/email.ts";

const BATCH_SIZE = 40;
const CONCURRENCY = 3;
const SEND_DELAY_MS = 160;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Run async work with limited concurrency, preserving input order. */
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
      await sleep(SEND_DELAY_MS);
    }
  });
  await Promise.all(workers);
  return results;
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const authHeader = req.headers.get("Authorization");
    const userClient = getUserClient(authHeader);
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user || user.app_metadata?.role !== "admin") {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const html = typeof body.html === "string" ? body.html.trim() : "";
    if (!subject || !html) {
      return jsonResponse({ error: "Subject and message body are required" }, 400);
    }
    const offset = typeof body.offset === "number" ? Math.max(0, Math.floor(body.offset)) : 0;
    const runId = typeof body.runId === "string" && body.runId.trim() ? body.runId.trim() : null;

    const service = getServiceClient();

    // Recipients: distinct member emails, stable order so batches never duplicate.
    const { data: rows, error: rowsError } = await service
      .from("members")
      .select("email, full_name")
      .order("created_at", { ascending: true })
      .limit(50000);

    if (rowsError) {
      return jsonResponse({ error: `Failed to load members: ${rowsError.message}` }, 502);
    }

    const seen = new Set<string>();
    const recipients: { email: string; name: string }[] = [];
    for (const row of rows ?? []) {
      const email = typeof row.email === "string" ? row.email.trim().toLowerCase() : "";
      if (!email || !EMAIL_RE.test(email)) continue;
      if (seen.has(email)) continue;
      seen.add(email);
      recipients.push({
        email,
        name: typeof row.full_name === "string" ? row.full_name : email,
      });
    }

    // Skip anyone already delivered earlier in this run (retry-safe, no duplicates).
    let alreadySent = new Set<string>();
    if (runId) {
      const { data: sentLogs, error: sentError } = await service
        .from("email_log")
        .select("recipient")
        .eq("template", "broadcast")
        .eq("metadata->>run_id", runId)
        .eq("status", "sent");
      if (sentError) {
        return jsonResponse({ error: `Failed to load sent log: ${sentError.message}` }, 502);
      }
      alreadySent = new Set(
        (sentLogs ?? [])
          .map((r) => (typeof r.recipient === "string" ? r.recipient.trim().toLowerCase() : ""))
          .filter(Boolean),
      );
    }

    const total = recipients.length;
    if (offset >= total) {
      return jsonResponse({
        total,
        offset,
        processed: total,
        sent: 0,
        failed: 0,
        next_offset: total,
        done: true,
        failures: [],
      });
    }

    const windowEnd = Math.min(total, offset + BATCH_SIZE);
    const batch = recipients.slice(offset, windowEnd).filter((r) => !alreadySent.has(r.email));

    const results = await mapLimit(batch, CONCURRENCY, async (recipient) => {
      try {
        const result = await sendBroadcastEmail({
          to: recipient.email,
          subject,
          html,
          data: { name: recipient.name },
          runId: runId ?? undefined,
        });
        if (result.ok) return { email: recipient.email, ok: true as const };
        return {
          email: recipient.email,
          ok: false as const,
          error: result.error ?? "Send failed",
        };
      } catch (e) {
        return {
          email: recipient.email,
          ok: false as const,
          error: e instanceof Error ? e.message : "Send failed",
        };
      }
    });

    const failures = results
      .filter((r): r is { email: string; ok: false; error: string } => !r.ok)
      .map((r) => ({ email: r.email, error: r.error }));
    const sent = results.length - failures.length;
    const processed = windowEnd;
    const done = processed >= total;

    return jsonResponse({
      total,
      offset,
      processed,
      sent: sent,
      failed: failures.length,
      next_offset: processed,
      done,
      failures,
    });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Server error" }, 500);
  }
});
