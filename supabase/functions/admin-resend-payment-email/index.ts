import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient, getUserClient } from "../_shared/supabase.ts";
import { sendEmail } from "../_shared/email.ts";

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

    const { application_id } = await req.json();
    if (!application_id) {
      return jsonResponse({ error: "application_id required" }, 400);
    }

    const supabase = getServiceClient();
    const { data: app } = await supabase
      .from("membership_applications")
      .select("id, email, full_name, phone, payment_status, membership_type")
      .eq("id", application_id)
      .single();

    if (!app) return jsonResponse({ error: "Application not found" }, 404);
    if (app.membership_type === "student") {
      return jsonResponse({ error: "Student applications do not require payment" }, 400);
    }
    if (app.payment_status === "paid" || app.payment_status === "not_required") {
      return jsonResponse({ error: "Application is already paid or payment not required" }, 400);
    }

    const appUrl = Deno.env.get("APP_URL") ?? "https://ppau.info";
    const amount = Number(Deno.env.get("MEMBERSHIP_FEE_UGX") ?? 50000);
    const paymentPageUrl = `${appUrl}/membership-form/payment?application_id=${application_id}`;

    const howToPayHtml = `
<p><strong>Option 1 — Pay by mobile money or bank transfer</strong></p>
<ul>
<li><strong>Airtel:</strong> Press *185*7# → select (1) bank and follow prompts.</li>
<li><strong>MTN:</strong> Press *165*6# and follow prompts.</li>
<li><strong>Bank:</strong> Equity Bank — Pharmacy Professionals Association of Uganda (PPAU) Ltd, Account <strong>1001203324987</strong>.</li>
</ul>
<p>After paying, open the <a href="${paymentPageUrl}">payment page</a> and upload your proof of payment.</p>
<p>Application reference: <strong>${application_id}</strong></p>`;

    const result = await sendEmail("payment_reminder", app.email, {
      name: app.full_name,
      amount: String(amount),
      reference: application_id,
      payment_link: paymentPageUrl,
      payment_page_url: paymentPageUrl,
      how_to_pay: howToPayHtml,
      portal_url: `${appUrl}/member/login`,
    });

    if (!result.ok && !result.skipped) {
      return jsonResponse({ error: "Failed to send email" }, 500);
    }

    return jsonResponse({
      success: true,
      email: app.email,
      payment_link: paymentPageUrl,
      skipped: result.skipped ?? false,
    });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
