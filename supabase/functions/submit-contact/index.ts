import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";
import { sendEmail } from "../_shared/email.ts";

function splitRecipients(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
}

async function sendViaWeb3Forms(data: Record<string, string>) {
  const accessKey = Deno.env.get("WEB3FORMS_ACCESS_KEY");
  if (!accessKey) {
    return { ok: false as const, skipped: true, error: "WEB3FORMS_ACCESS_KEY not configured in Supabase secrets" };
  }

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: data.subject ?? "PPAU Contact: New message",
        from_name: data.name,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        botcheck: "",
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body?.success !== true) {
      return {
        ok: false as const,
        error: typeof body?.message === "string"
          ? body.message
          : `Web3Forms responded ${res.status}`,
      };
    }
    return { ok: true as const, provider: "web3forms" as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Web3Forms request failed" };
  }
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const body = await req.json();
    const full_name = String(body.full_name ?? "").trim().toUpperCase();
    const email = String(body.email ?? "").trim();
    const phone = body.phone ? String(body.phone).trim() : null;
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!full_name || !email || !subject || !message) {
      return jsonResponse({ error: "full_name, email, subject, and message are required" }, 400);
    }

    const supabase = getServiceClient();

    const { data: settings } = await supabase
      .from("contact_page_settings")
      .select("form_enabled, is_published, notification_email")
      .eq("id", 1)
      .maybeSingle();

    if (settings?.is_published === false) {
      return jsonResponse({ error: "Contact form is not available" }, 503);
    }
    if (settings?.form_enabled === false) {
      return jsonResponse({ error: "Contact form is disabled" }, 503);
    }

    const { error: insertError } = await supabase.from("contact_submissions").insert({
      full_name,
      email,
      phone,
      subject,
      message,
      status: "new",
    });

    if (insertError) return jsonResponse({ error: insertError.message }, 400);

    const templateData = {
      name: full_name,
      email,
      phone: phone ?? "—",
      subject,
      message: message.replace(/\n/g, "<br/>"),
    };

    const recipients = splitRecipients(settings?.notification_email);

    let allFailed = recipients.length === 0;
    if (recipients.length > 0) {
      const results = await Promise.all(
        recipients.map((to) => sendEmail("contact_submission", to, templateData)),
      );
      allFailed = results.every((r) => !r.ok);
    }

    if (allFailed) {
      const fallbackResult = await sendViaWeb3Forms(templateData);
      if (!fallbackResult.ok && !fallbackResult.skipped) {
        console.error("Contact notification failed (primary + web3forms):", fallbackResult.error);
        return jsonResponse({
          success: true,
          warning: "Message stored, but notification delivery failed",
        }, 202);
      }
    }

    return jsonResponse({ success: true });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Server error" }, 500);
  }
});
