import { jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";
import { sendEmail } from "../_shared/email.ts";

Deno.serve(async (req) => {
  try {
    const secretHash = Deno.env.get("FLUTTERWAVE_WEBHOOK_SECRET");
    const signature = req.headers.get("verif-hash");
    if (secretHash && signature !== secretHash) {
      return jsonResponse({ error: "Invalid signature" }, 401);
    }

    const payload = await req.json();
    const event = payload.event;
    const data = payload.data;
    const supabase = getServiceClient();
    const appUrl = Deno.env.get("APP_URL") ?? "https://ppau.info";

    const txRef = data?.tx_ref ?? data?.txRef;
    if (!txRef) return jsonResponse({ received: true });

    const { data: payment } = await supabase
      .from("payments")
      .select("*, membership_applications(*), members(*)")
      .eq("flutterwave_tx_ref", txRef)
      .maybeSingle();

    if (event === "charge.completed" && data?.status === "successful") {
      if (payment) {
        await supabase
          .from("payments")
          .update({
            status: "completed",
            flutterwave_transaction_id: String(data.id),
            flutterwave_status: data.status,
            verified_at: new Date().toISOString(),
          })
          .eq("id", payment.id);

        if (payment.application_id) {
          await supabase
            .from("membership_applications")
            .update({
              payment_status: "paid",
              status: "pending_review",
            })
            .eq("id", payment.application_id);

          const app = payment.membership_applications;
          if (app?.email) {
            await sendEmail("payment_received", app.email, {
              name: app.full_name,
              amount: String(payment.amount_ugx),
              reference: txRef,
              portal_url: `${appUrl}/member/login`,
            });
          }
        }

        if (payment.member_id && payment.is_renewal) {
          const end = new Date();
          end.setFullYear(end.getFullYear() + 1);
          await supabase
            .from("members")
            .update({
              status: "active",
              current_period_end: end.toISOString().slice(0, 10),
            })
            .eq("id", payment.member_id);
        }
      }
    }

    if (
      event?.includes("subscription") ||
      payload.type === "subscription"
    ) {
      const subId = data?.id ?? data?.subscription_id;
      const memberId = payment?.member_id;
      if (memberId && subId) {
        const end = new Date();
        end.setFullYear(end.getFullYear() + 1);
        await supabase.from("membership_subscriptions").upsert({
          member_id: memberId,
          flutterwave_subscription_id: String(subId),
          flutterwave_plan_id: Deno.env.get("FLUTTERWAVE_PLAN_ID"),
          status: "active",
          current_period_end: end.toISOString().slice(0, 10),
        });
        await supabase
          .from("members")
          .update({
            status: "active",
            current_period_end: end.toISOString().slice(0, 10),
          })
          .eq("id", memberId);
      }
    }

    return jsonResponse({ received: true });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
