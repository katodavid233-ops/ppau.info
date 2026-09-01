import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("membership_applications")
      .delete()
      .eq("status", "draft")
      .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .select("id");

    if (error) return jsonResponse({ error: error.message }, 400);

    return jsonResponse({ deleted: data?.length ?? 0 });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
