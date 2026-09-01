import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { membership_type, email, full_name } = await req.json();
    if (!membership_type || !email || !full_name) {
      return jsonResponse({ error: "membership_type, email, full_name required" }, 400);
    }

    const supabase = getServiceClient();
    const payment_status =
      membership_type === "student" ? "not_required" : "unpaid";

    const { data, error } = await supabase
      .from("membership_applications")
      .insert({
        membership_type,
        email,
        full_name,
        status: "draft",
        payment_status,
      })
      .select("id")
      .single();

    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse({ application_id: data.id });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
