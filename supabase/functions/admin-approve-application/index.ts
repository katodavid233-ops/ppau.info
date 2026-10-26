import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient, getUserClient } from "../_shared/supabase.ts";
import { sendEmail } from "../_shared/email.ts";

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

    const { application_id, action, admin_notes } = await req.json();
    if (!application_id || !action) {
      return jsonResponse({ error: "application_id and action required" }, 400);
    }

    const supabase = getServiceClient();
    const appUrl = (Deno.env.get("APP_URL") ?? "https://ppau.info").replace(/\/+$/, "");
    const setPasswordUrl = "https://ppau.info/member/set-password";

    if (action === "reject") {
      const { data: appBefore } = await supabase
        .from("membership_applications")
        .select("email, full_name")
        .eq("id", application_id)
        .single();

      await supabase
        .from("membership_applications")
        .update({
          status: "rejected",
          admin_notes: admin_notes ?? null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", application_id);

      await supabase
        .from("members")
        .update({ status: "suspended", updated_at: new Date().toISOString() })
        .eq("application_id", application_id);

      if (appBefore) {
        await sendEmail("rejected", appBefore.email, {
          name: appBefore.full_name,
          reason: admin_notes ?? "Please contact the secretariat for details.",
        });
      }
      return jsonResponse({ success: true, status: "rejected" });
    }

    if (action === "verify_payment") {
      await supabase
        .from("membership_applications")
        .update({ payment_status: "paid", status: "pending_review" })
        .eq("id", application_id);
      await supabase
        .from("payments")
        .update({
          status: "completed",
          verified_at: new Date().toISOString(),
          verified_by: user.id,
        })
        .eq("application_id", application_id)
        .eq("method", "manual");
      return jsonResponse({ success: true });
    }

    if (action === "reject_payment_proof") {
      await supabase
        .from("membership_applications")
        .update({
          payment_status: "failed",
          admin_notes: admin_notes?.trim()
            ? `Payment proof rejected: ${admin_notes.trim()}`
            : "Payment proof rejected — please upload a valid proof or pay online.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", application_id);
      await supabase
        .from("payments")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("application_id", application_id)
        .eq("method", "manual");
      return jsonResponse({ success: true, payment_status: "failed" });
    }

    const isApprove = action === "approve" || action === "approve_without_payment";

    if (action === "approve_without_payment") {
      const reason = admin_notes?.trim();
      if (!reason) {
        return jsonResponse({ error: "A reason is required to approve without payment" }, 400);
      }

      const { data: appRow, error: fetchErr } = await supabase
        .from("membership_applications")
        .select("membership_type, payment_status, status")
        .eq("id", application_id)
        .single();

      if (fetchErr || !appRow) {
        return jsonResponse({ error: "Application not found" }, 404);
      }

      if (appRow.membership_type !== "professional") {
        return jsonResponse({ error: "Only professional applications require payment" }, 400);
      }

      if (appRow.payment_status === "paid" || appRow.payment_status === "not_required") {
        return jsonResponse({ error: "Payment is already satisfied" }, 400);
      }

      if (appRow.status === "approved" || appRow.status === "rejected") {
        return jsonResponse({ error: "Application cannot be approved in its current status" }, 400);
      }

      const { error: waiveErr } = await supabase
        .from("membership_applications")
        .update({
          payment_status: "waived",
          admin_notes: `Payment waived: ${reason}`,
        })
        .eq("id", application_id);

      if (waiveErr) {
        return jsonResponse({ error: waiveErr.message }, 400);
      }
    }

    if (action === "approve") {
      const { data: appRow, error: fetchErr } = await supabase
        .from("membership_applications")
        .select("membership_type, payment_status, status")
        .eq("id", application_id)
        .single();

      if (fetchErr || !appRow) {
        return jsonResponse({ error: "Application not found" }, 404);
      }

      if (
        appRow.membership_type === "professional" &&
        (appRow.payment_status === "unpaid" || appRow.payment_status === "failed")
      ) {
        return jsonResponse(
          {
            error:
              "Payment is outstanding. Approve without payment (with a reason) or verify payment first.",
          },
          400,
        );
      }
    }

    if (!isApprove) {
      return jsonResponse({ error: "Unknown action" }, 400);
    }

    const { data: result, error } = await supabase.rpc("approve_membership_application", {
      p_application_id: application_id,
      p_admin_id: user.id,
    });

    if (error) return jsonResponse({ error: error.message }, 400);

    const { data: app, error: appErr } = await supabase
      .from("membership_applications")
      .select("*")
      .eq("id", application_id)
      .single();

    if (appErr) return jsonResponse({ error: appErr.message }, 500);
    if (!app) return jsonResponse({ error: "Application not found" }, 404);

    const { data: claim, error: claimErr } = await supabase
      .from("approval_email_deliveries")
      .upsert(
        { application_id, status: "processing", processing_started_at: new Date().toISOString() },
        { onConflict: "application_id", ignoreDuplicates: true },
      )
      .select("application_id")
      .maybeSingle();
    if (claimErr) return jsonResponse({ error: claimErr.message }, 500);

    if (!claim) {
      const { data: currentDelivery, error: deliveryErr } = await supabase
        .from("approval_email_deliveries")
        .select("status, processing_started_at")
        .eq("application_id", application_id)
        .single();
      if (deliveryErr) return jsonResponse({ error: deliveryErr.message }, 500);
      if (currentDelivery.status === "sent") {
        return jsonResponse({ success: true, ...result, email_status: "sent" });
      }

      const staleBefore = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const retryQuery = supabase
        .from("approval_email_deliveries")
        .update({
          status: "processing",
          error_message: null,
          processing_started_at: new Date().toISOString(),
        })
        .eq("application_id", application_id);
      const retryResult =
        currentDelivery.status === "failed"
          ? await retryQuery.eq("status", "failed").select("application_id").maybeSingle()
          : await retryQuery
              .eq("status", "processing")
              .lt("processing_started_at", staleBefore)
              .select("application_id")
              .maybeSingle();
      if (retryResult.error) {
        return jsonResponse({ error: retryResult.error.message }, 500);
      }
      if (!retryResult.data) {
        return jsonResponse({ success: true, ...result, email_status: "processing" });
      }
    }

    try {
      const emailLower = app.email.trim().toLowerCase();
      let existing = null;
      for (let page = 1; page <= 20; page++) {
        const { data: users, error: usersErr } = await supabase.auth.admin.listUsers({
          page,
          perPage: 200,
        });
        if (usersErr) throw new Error(usersErr.message);
        existing = users.users.find((u) => u.email?.toLowerCase() === emailLower) ?? null;
        if (existing || users.users.length < 200) break;
      }

      let userId: string;
      let linkType: "invite" | "recovery";
      if (!existing) {
        const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
          email: emailLower,
          email_confirm: true,
          app_metadata: { role: "member" },
          user_metadata: { full_name: app.full_name },
        });
        if (createErr) throw new Error(createErr.message);
        if (!newUser.user) throw new Error("Could not create member account");
        userId = newUser.user.id;
        linkType = "invite";
      } else {
        // Do not downgrade existing admins (e.g. approving an app with the admin's email).
        if (existing.app_metadata?.role !== "admin") {
          const { error: updateUserErr } = await supabase.auth.admin.updateUserById(existing.id, {
            app_metadata: { ...existing.app_metadata, role: "member" },
          });
          if (updateUserErr) throw new Error(updateUserErr.message);
        }
        userId = existing.id;
        linkType = "recovery";
      }

      const { error: applicationUserErr } = await supabase
        .from("membership_applications")
        .update({ user_id: userId })
        .eq("id", application_id);
      if (applicationUserErr) throw new Error(applicationUserErr.message);
      const { error: memberUserErr } = await supabase
        .from("members")
        .update({ user_id: userId })
        .eq("application_id", application_id);
      if (memberUserErr) throw new Error(memberUserErr.message);

      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
        type: linkType,
        email: emailLower,
        options: { redirectTo: setPasswordUrl },
      });
      if (linkErr) throw new Error(linkErr.message);
      const inviteLink =
        linkData?.properties?.action_link ??
        (linkData as { action_link?: string })?.action_link ??
        "";
      if (!inviteLink) throw new Error("Could not generate password setup link");

      const emailResult = await sendEmail("approved", emailLower, {
        name: app.full_name,
        membership_number: result?.membership_number ?? app.membership_number ?? "",
        period_end: result?.current_period_end ?? "",
        portal_url: `${appUrl}/member`,
        invite_link: inviteLink,
        application_id,
      });
      if (!emailResult.ok) {
        throw new Error(
          "error" in emailResult ? emailResult.error : "Could not send approval email",
        );
      }

      const { error: sentErr } = await supabase
        .from("approval_email_deliveries")
        .update({
          status: "sent",
          error_message: null,
          sent_at: new Date().toISOString(),
          processing_started_at: null,
        })
        .eq("application_id", application_id);
      if (sentErr) throw new Error(sentErr.message);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      const { error: deliveryUpdateErr } = await supabase
        .from("approval_email_deliveries")
        .update({
          status: "failed",
          error_message: message,
          processing_started_at: null,
        })
        .eq("application_id", application_id);
      if (deliveryUpdateErr) {
        return jsonResponse(
          { error: `${message}; could not record delivery failure: ${deliveryUpdateErr.message}` },
          500,
        );
      }
      return jsonResponse({ error: message }, 502);
    }

    return jsonResponse({ success: true, ...result, email_status: "sent" });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
