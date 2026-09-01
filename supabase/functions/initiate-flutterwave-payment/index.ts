import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { application_id, member_id, is_renewal, use_subscription } =
      await req.json();

    const secret = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    if (!secret) return jsonResponse({ error: "Flutterwave not configured" }, 500);

    const amount = Number(Deno.env.get("MEMBERSHIP_FEE_UGX") ?? 50000);
    const appUrl = Deno.env.get("APP_URL") ?? "https://ppau.info";
    const supabase = getServiceClient();

    let email = "";
    let name = "";
    let phone = "";

    if (application_id) {
      const { data: app } = await supabase
        .from("membership_applications")
        .select("*")
        .eq("id", application_id)
        .single();
      if (!app) return jsonResponse({ error: "Application not found" }, 404);
      email = app.email;
      name = app.full_name;
      phone = app.phone ?? "";
    } else if (member_id) {
      const { data: member } = await supabase
        .from("members")
        .select("*")
        .eq("id", member_id)
        .single();
      if (!member) return jsonResponse({ error: "Member not found" }, 404);
      email = member.email;
      name = member.full_name;
      phone = member.phone ?? "";
    } else {
      return jsonResponse({ error: "application_id or member_id required" }, 400);
    }

    const { data: payment, error: payErr } = await supabase
      .from("payments")
      .insert({
        application_id: application_id ?? null,
        member_id: member_id ?? null,
        method: "flutterwave",
        amount_ugx: amount,
        status: "pending",
        is_renewal: !!is_renewal,
        flutterwave_tx_ref: crypto.randomUUID(),
      })
      .select()
      .single();

    if (payErr) return jsonResponse({ error: payErr.message }, 400);

    const txRef = payment.flutterwave_tx_ref;
    const redirectUrl = application_id
      ? `${appUrl}/membership-form/payment/callback?application_id=${application_id}`
      : `${appUrl}/member/renew/callback?member_id=${member_id}`;

    const planId = use_subscription ? Deno.env.get("FLUTTERWAVE_PLAN_ID") : null;
    if (use_subscription && !planId) {
      return jsonResponse({ error: "FLUTTERWAVE_PLAN_ID not set" }, 500);
    }

    const phoneDigits = (phone || "0000000000").replace(/\D/g, "").slice(-15) || "0000000000";

    const paymentBody: Record<string, unknown> = {
      tx_ref: txRef,
      amount,
      currency: "UGX",
      redirect_url: redirectUrl,
      customer: { email, name, phonenumber: phoneDigits },
      customizations: {
        title: "PPAU Membership",
        description: use_subscription
          ? "Annual membership with auto-renewal"
          : is_renewal
            ? "Annual renewal"
            : "Annual membership fee",
        logo: `${appUrl}/PPAU_logo.jpeg`,
      },
    };

    // Recurring: attach payment plan on standard checkout (not POST /subscriptions)
    if (use_subscription && planId) {
      paymentBody.payment_plan = Number(planId) || planId;
    }

    const fwRes = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentBody),
    });

    const fwText = await fwRes.text();
    let fwData: Record<string, unknown> = {};
    try {
      fwData = fwText ? JSON.parse(fwText) : {};
    } catch {
      console.error("Flutterwave non-JSON response:", fwText);
      return jsonResponse(
        { error: fwText.slice(0, 200) || "Invalid response from Flutterwave" },
        400,
      );
    }

    if (!fwRes.ok) {
      const fwMsg =
        (fwData.message as string) ??
        ((fwData.error as { message?: string })?.message) ??
        (typeof fwData.error === "string" ? fwData.error : null) ??
        "Payment init failed";
      console.error("Flutterwave payments error:", fwData);
      return jsonResponse(
        {
          error: fwMsg.includes("authorization")
            ? `Flutterwave: ${fwMsg} — check FLUTTERWAVE_SECRET_KEY starts with FLWSECK- (not FFLWSECK-) in Edge Function secrets`
            : fwMsg,
        },
        400,
      );
    }

    const data = fwData.data as { link?: string } | undefined;
    if (!data?.link) {
      return jsonResponse({ error: "No payment link returned from Flutterwave" }, 400);
    }

    return jsonResponse({
      type: use_subscription ? "subscription" : "payment",
      link: data.link,
      payment_id: payment.id,
      tx_ref: txRef,
    });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
