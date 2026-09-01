import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getUserClient } from "../_shared/supabase.ts";
import { sendTestEmail } from "../_shared/email.ts";

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

    const body = await req.json().catch(() => ({}));
    const to = typeof body.to === "string" && body.to.trim()
      ? body.to.trim()
      : user.email;

    if (!to) {
      return jsonResponse({ error: "Recipient email required" }, 400);
    }

    const result = await sendTestEmail(to);
    if (!result.ok) {
      return jsonResponse({
        error: result.error ?? "Failed to send test email",
        skipped: result.skipped ?? false,
      }, result.skipped ? 503 : 502);
    }

    return jsonResponse({ success: true, to, provider: result.provider });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Server error" }, 500);
  }
});
