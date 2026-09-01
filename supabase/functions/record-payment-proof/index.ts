import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { application_id } = await req.json();
    if (!application_id) {
      return jsonResponse({ error: "application_id required" }, 400);
    }

    const supabase = getServiceClient();

    const { data: app, error: appErr } = await supabase
      .from("membership_applications")
      .select("id, membership_type, payment_status")
      .eq("id", application_id)
      .single();

    if (appErr || !app) {
      return jsonResponse({ error: "Application not found" }, 404);
    }

    if (app.membership_type !== "professional") {
      return jsonResponse({ error: "Not a professional application" }, 400);
    }

    if (app.payment_status === "paid" || app.payment_status === "waived") {
      return jsonResponse({ success: true, already_paid: true });
    }

    await supabase
      .from("membership_applications")
      .update({
        payment_status: "pending_verification",
        updated_at: new Date().toISOString(),
      })
      .eq("id", application_id);

    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("application_id", application_id)
      .eq("method", "manual")
      .maybeSingle();

    if (!existingPayment) {
      await supabase.from("payments").insert({
        application_id,
        method: "manual",
        amount_ugx: 50000,
        status: "pending",
      });
    }

    return jsonResponse({ success: true, payment_status: "pending_verification" });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
