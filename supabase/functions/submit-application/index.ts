import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";
import { sendEmail } from "../_shared/email.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const body = await req.json();
    const { application_id, declaration: _declaration, ...fields } = body;
    if (!application_id) return jsonResponse({ error: "application_id required" }, 400);

    const supabase = getServiceClient();
    const { data: existing } = await supabase
      .from("membership_applications")
      .select("membership_type, payment_status")
      .eq("id", application_id)
      .single();

    if (!existing) return jsonResponse({ error: "Application not found" }, 404);

    const status =
      existing.membership_type === "student"
        ? "pending_review"
        : existing.payment_status === "paid"
          ? "pending_review"
          : "pending_payment";

    let membership_number: string | null = null;
    if (existing.membership_type === "student") {
      const { data: appRow } = await supabase
        .from("membership_applications")
        .select("membership_number")
        .eq("id", application_id)
        .single();

      if (!appRow?.membership_number) {
        const { data: generated, error: numErr } = await supabase.rpc(
          "generate_membership_number",
          { p_type: "student" },
        );
        if (numErr) return jsonResponse({ error: numErr.message }, 400);
        membership_number = generated as string;
      } else {
        membership_number = appRow.membership_number;
      }
    }

    const update = {
      ...fields,
      status,
      ...(membership_number ? { membership_number } : {}),
      declaration_accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("membership_applications")
      .update(update)
      .eq("id", application_id);

    if (error) return jsonResponse({ error: error.message }, 400);

    const appUrl = Deno.env.get("APP_URL") ?? "https://ppau.info";
    const nextSteps =
      existing.membership_type === "student"
        ? membership_number
          ? `Your application is under review. Your student membership number is ${membership_number}.`
          : "Your application is under review."
        : "Please complete payment to proceed.";

    await sendEmail("application_submitted", fields.email ?? body.email, {
      name: fields.full_name ?? body.full_name,
      reference: application_id,
      next_steps: nextSteps,
      portal_url: `${appUrl}/member/login`,
      membership_number: membership_number ?? "",
    });

    return jsonResponse({ success: true, status, membership_number });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
