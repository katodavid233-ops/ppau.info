import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";
import { sendEmail } from "../_shared/email.ts";

const ALLOWED_REDIRECT_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:5173",
  "https://ppau.info",
  "https://www.ppau.info",
];

function resolveRedirectTo(requested: unknown, appUrl: string): string {
  const fallback = `${appUrl.replace(/\/$/, "")}/member/set-password`;
  if (typeof requested !== "string" || !requested.trim()) return fallback;
  try {
    const url = new URL(requested.trim());
    const origin = url.origin;
    if (
      ALLOWED_REDIRECT_ORIGINS.includes(origin) &&
      url.pathname === "/member/set-password"
    ) {
      return url.toString();
    }
  } catch {
    /* use fallback */
  }
  return fallback;
}

async function findAuthUserByEmail(
  supabase: ReturnType<typeof getServiceClient>,
  emailLower: string,
) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === emailLower);
    if (match) return match;
    if (data.users.length < 200) break;
  }
  return null;
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const body = await req.json();
    const { email, redirect_to: redirectToRequest } = body ?? {};
    if (!email || typeof email !== "string") {
      return jsonResponse({ error: "Email is required" }, 400);
    }

    const emailLower = email.trim().toLowerCase();
    const supabase = getServiceClient();
    const appUrl = Deno.env.get("APP_URL") ?? "https://ppau.info";
    const redirectTo = resolveRedirectTo(redirectToRequest, appUrl);

    const { data: member } = await supabase
      .from("members")
      .select("id, email, full_name, user_id, status")
      .ilike("email", emailLower)
      .eq("status", "active")
      .maybeSingle();

    const { data: approvedApps } = await supabase
      .from("membership_applications")
      .select("id, email, full_name, status, user_id")
      .ilike("email", emailLower)
      .eq("status", "approved")
      .order("reviewed_at", { ascending: false })
      .limit(1);
    const app = approvedApps?.[0] ?? null;

    // Always return success to avoid email enumeration
    const genericSuccess = {
      success: true,
      message: "If this email is registered, you will receive a link to set your password.",
    };

    if (!member && !app) {
      return jsonResponse(genericSuccess);
    }

    const fullName = member?.full_name ?? app?.full_name ?? "Member";
    let userId = member?.user_id ?? app?.user_id ?? null;

    let authUser = await findAuthUserByEmail(supabase, emailLower);

    if (!authUser) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: emailLower,
        email_confirm: true,
        app_metadata: { role: "member" },
        user_metadata: { full_name: fullName },
      });
      if (createErr) {
        return jsonResponse({ error: createErr.message }, 400);
      }
      authUser = created.user ?? undefined;
      userId = authUser?.id ?? null;
    } else if (authUser.app_metadata?.role !== "admin") {
      await supabase.auth.admin.updateUserById(authUser.id, {
        app_metadata: { ...authUser.app_metadata, role: "member" },
      });
      userId = authUser.id;
    }

    if (userId) {
      if (app?.id) {
        await supabase
          .from("membership_applications")
          .update({ user_id: userId })
          .eq("id", app.id);
      }
      if (member?.id) {
        await supabase.from("members").update({ user_id: userId }).eq("id", member.id);
      }
    }

    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: emailLower,
      options: { redirectTo },
    });

    if (linkErr) {
      return jsonResponse({ error: linkErr.message }, 400);
    }

    const inviteLink =
      linkData?.properties?.action_link ?? (linkData as { action_link?: string })?.action_link ?? "";

    if (!inviteLink) {
      return jsonResponse({ error: "Could not generate portal link" }, 500);
    }

    await sendEmail("member_invite", emailLower, {
      name: fullName,
      invite_link: inviteLink,
      portal_url: `${appUrl}/member/login`,
    });

    return jsonResponse(genericSuccess);
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
