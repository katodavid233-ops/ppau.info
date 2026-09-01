import { jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";
import { sendEmail } from "../_shared/email.ts";

Deno.serve(async (_req) => {
  try {
    const supabase = getServiceClient();
    const appUrl = Deno.env.get("APP_URL") ?? "https://ppau.info";
    const today = new Date();
    const in30 = new Date(today);
    in30.setDate(in30.getDate() + 30);
    const in7 = new Date(today);
    in7.setDate(in7.getDate() + 7);

    const targetDates = [
      in30.toISOString().slice(0, 10),
      in7.toISOString().slice(0, 10),
    ];

    const { data: members } = await supabase
      .from("members")
      .select("*")
      .eq("membership_type", "professional")
      .eq("status", "active")
      .in("current_period_end", targetDates);

    let sent = 0;
    for (const m of members ?? []) {
      if (m.email.includes("@import.ppau.local")) continue;
      await sendEmail("renewal_reminder", m.email, {
        name: m.full_name,
        period_end: m.current_period_end ?? "",
        renew_url: `${appUrl}/member/renew`,
      });
      sent++;
    }

    return jsonResponse({ sent });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
