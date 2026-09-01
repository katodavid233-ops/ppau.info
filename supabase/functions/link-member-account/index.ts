import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getUserClient, getServiceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const authHeader = req.headers.get("Authorization");
    const userClient = getUserClient(authHeader);
    const { data: { user } } = await userClient.auth.getUser();
    if (!user?.email) return jsonResponse({ error: "Unauthorized" }, 401);

    const supabase = getServiceClient();
    const email = user.email.toLowerCase();

    await supabase
      .from("membership_applications")
      .update({ user_id: user.id })
      .eq("email", email)
      .is("user_id", null);

    await supabase
      .from("members")
      .update({ user_id: user.id })
      .eq("email", email)
      .is("user_id", null);

    if (user.app_metadata?.role !== "admin") {
      await supabase.auth.admin.updateUserById(user.id, {
        app_metadata: { ...user.app_metadata, role: "member" },
      });
    }

    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
