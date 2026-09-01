import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient, getUserClient } from "../_shared/supabase.ts";

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const userClient = getUserClient(authHeader);
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return { error: jsonResponse({ error: "Unauthorized" }, 401) };
  }
  return { user, supabase: getServiceClient() };
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const auth = await requireAdmin(req);
    if ("error" in auth) return auth.error;

    const { supabase } = auth;
    const body = req.method === "GET" ? {} : await req.json();
    const action = body.action ?? (req.method === "GET" ? "list" : body.action);

    if (action === "list" || action === "list_admins") {
      const { data, error } = await supabase.auth.admin.listUsers({ perPage: 200 });
      if (error) return jsonResponse({ error: error.message }, 400);
      const admins = (data.users ?? []).filter(
        (u) => u.app_metadata?.role === "admin",
      ).map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      }));
      return jsonResponse({ admins });
    }

    if (action === "create") {
      const { email, password, full_name } = body;
      if (!email || !password) {
        return jsonResponse({ error: "email and password required" }, 400);
      }
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { role: "admin" },
        user_metadata: full_name ? { full_name } : {},
      });
      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse({ user: { id: data.user?.id, email: data.user?.email } });
    }

    if (action === "remove_admin") {
      const { user_id } = body;
      if (!user_id) return jsonResponse({ error: "user_id required" }, 400);
      const { error } = await supabase.auth.admin.updateUserById(user_id, {
        app_metadata: { role: "member" },
      });
      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Unknown action" }, 400);
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
