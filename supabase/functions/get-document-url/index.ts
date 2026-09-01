import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient, getUserClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { document_id } = await req.json();
    if (!document_id) return jsonResponse({ error: "document_id required" }, 400);

    const authHeader = req.headers.get("Authorization");
    const userClient = getUserClient(authHeader);
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

    const supabase = getServiceClient();
    const { data: doc } = await supabase
      .from("application_documents")
      .select("*, membership_applications(email, user_id)")
      .eq("id", document_id)
      .single();

    if (!doc) return jsonResponse({ error: "Not found" }, 404);

    const isAdmin = user.app_metadata?.role === "admin";
    const app = doc.membership_applications as { email: string; user_id: string } | null;
    const isOwner =
      app?.user_id === user.id ||
      app?.email?.toLowerCase() === user.email?.toLowerCase();

    if (!isAdmin && !isOwner) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    const { data: signed, error } = await supabase.storage
      .from("membership-documents")
      .createSignedUrl(doc.storage_path, 3600);

    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse({ url: signed.signedUrl });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
