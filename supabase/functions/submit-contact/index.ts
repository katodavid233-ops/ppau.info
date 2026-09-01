import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";
import { sendEmail } from "../_shared/email.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const body = await req.json();
    const full_name = String(body.full_name ?? "").trim();
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

    const notifyTo = settings?.notification_email?.trim();
    if (notifyTo) {
      await sendEmail(
        "contact_submission",
        notifyTo,
        {
          name: full_name,
          email,
          phone: phone ?? "—",
          subject,
          message: message.replace(/\n/g, "<br/>"),
        },
      );
    }

    return jsonResponse({ success: true });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Server error" }, 500);
  }
});
