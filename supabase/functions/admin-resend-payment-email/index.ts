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

    let paymentLink = paymentPageUrl;
    const secret = Deno.env.get("FLUTTERWAVE_SECRET_KEY");

    if (secret) {
      try {
        const { data: payment, error: payErr } = await supabase
          .from("payments")
          .insert({
            application_id,
            method: "flutterwave",
            amount_ugx: amount,
            status: "pending",
            flutterwave_tx_ref: crypto.randomUUID(),
          })
          .select()
          .single();

        if (!payErr && payment) {
          const txRef = payment.flutterwave_tx_ref;
          const redirectUrl =
            `${appUrl}/membership-form/payment/callback?application_id=${application_id}`;

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);

          const fwRes = await fetch("https://api.flutterwave.com/v3/payments", {
            signal: controller.signal,
            method: "POST",
            headers: {
              Authorization: `Bearer ${secret}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tx_ref: txRef,
              amount,
              currency: "UGX",
              redirect_url: redirectUrl,
              customer: {
                email: app.email,
                name: app.full_name,
                phonenumber: app.phone?.replace(/\D/g, "") || "0000000000",
              },
              customizations: {
                title: "PPAU Membership",
                description: "Annual membership fee",
                logo: `${appUrl}/PPAU_logo.jpeg`,
              },
            }),
          });
          clearTimeout(timeout);

          const fwData = await fwRes.json();
          if (fwRes.ok && fwData.data?.link) {
            paymentLink = fwData.data.link;
          }
        }
      } catch {
        /* Flutterwave call failed — email will still go out with manual payment link */
      }
    }

    const howToPayHtml = `
<p><strong>Option 1 — Pay online</strong><br/>
<a href="${paymentLink}" style="display:inline-block;margin:8px 0;padding:12px 24px;background:#0d9488;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Pay UGX ${amount.toLocaleString()} with Flutterwave</a></p>
<p>You can also open the <a href="${paymentPageUrl}">membership payment page</a> to pay or upload proof.</p>
<p><strong>Option 2 — Mobile money</strong></p>
<ul>
<li><strong>Airtel:</strong> Press *185*7# → select (1) bank and follow prompts.</li>
<li><strong>MTN:</strong> Press *165*6# and follow prompts.</li>
</ul>
<p><strong>Option 3 — Bank transfer</strong><br/>
Equity Bank — Pharmacy Professionals Association of Uganda (PPAU) Ltd<br/>
Account: <strong>1001203324987</strong></p>
<p>After manual payment, upload proof on the <a href="${paymentPageUrl}">payment page</a>.</p>
<p>Application reference: <strong>${application_id}</strong></p>`;

    const result = await sendEmail("payment_reminder", app.email, {
      name: app.full_name,
      amount: String(amount),
      reference: application_id,
      payment_link: paymentLink,
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
      payment_link: paymentLink,
      skipped: result.skipped ?? false,
    });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
