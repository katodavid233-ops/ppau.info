import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getUserClient, getServiceClient } from "../_shared/supabase.ts";
import { sendBroadcastEmail, type EmailAttachment } from "../_shared/email.ts";

const BATCH_SIZE = 40;
const CONCURRENCY = 3;
const SEND_DELAY_MS = 160;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

function parseAttachments(value: unknown): EmailAttachment[] {
  if (!Array.isArray(value)) return [];
  const out: EmailAttachment[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    const filename = typeof raw.filename === "string" ? raw.filename.trim() : "";
    const content = typeof raw.content === "string" ? raw.content.replace(/\s/g, "") : "";
    const contentType = typeof raw.contentType === "string" ? raw.contentType.trim() : undefined;
    if (!filename || !content) continue;
    if (!BASE64_RE.test(content)) {
      throw new Error(`Attachment "${filename}" is not valid base64`);
    }
    const padding = content.endsWith("==") ? 2 : content.endsWith("=") ? 1 : 0;
    const bytes = Math.floor((content.length * 3) / 4) - padding;
    if (bytes > MAX_ATTACHMENT_BYTES) {
      throw new Error(`Attachment "${filename}" exceeds the 10 MB limit`);
    }
    out.push({ filename: filename.slice(0, 200), content, contentType });
    if (out.length >= MAX_ATTACHMENTS) break;
  }
  return out;
}

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
    let attachments: EmailAttachment[];
    try {
      attachments = parseAttachments(body.attachments);
    } catch (e) {
      return jsonResponse({ error: e instanceof Error ? e.message : "Invalid attachment" }, 400);
    }
    const audience = typeof body.audience === "string" ? body.audience.trim() : "non_students";
    const offset = typeof body.offset === "number" ? Math.max(0, Math.floor(body.offset)) : 0;
    const runId = typeof body.runId === "string" && body.runId.trim() ? body.runId.trim() : null;
    // Send the html as-is when it is already a complete email document (e.g. a newsletter),
    // instead of wrapping it in the standard PPAU branding.
    const fullHtml = body.fullHtml === true || /^\s*(<!doctype html|<\s*html)/i.test(html);

    const service = getServiceClient();

    // Recipients: distinct member emails, stable order so batches never duplicate.
    // Audience: "non_students" (default), "students", or "all".
    let membersQuery = service
      .from("members")
      .select("email, full_name")
      .order("created_at", { ascending: true })
      .limit(50000);
    if (audience === "students") {
      membersQuery = membersQuery.eq("membership_type", "student");
    } else if (audience !== "all") {
      membersQuery = membersQuery.neq("membership_type", "student");
    }
    const { data: rows, error: rowsError } = await membersQuery;

    if (rowsError) {
      return jsonResponse({ error: `Failed to load members: ${rowsError.message}` }, 502);
    }

    const seen = new Set<string>();
    const recipients: { email: string; name: string; firstName: string }[] = [];
    for (const row of rows ?? []) {
      const email = typeof row.email === "string" ? row.email.trim().toLowerCase() : "";
      if (!email || !EMAIL_RE.test(email)) continue;
      if (seen.has(email)) continue;
      seen.add(email);
      const name = typeof row.full_name === "string" ? row.full_name : email;
      const firstName = name.trim().split(/\s+/)[0] ?? name;
      recipients.push({ email, name, firstName });
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
          data: { name: recipient.name, first_name: recipient.firstName },
          runId: runId ?? undefined,
          fullHtml,
          attachments,
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
