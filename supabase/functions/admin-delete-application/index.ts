import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient, getUserClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const authHeader = req.headers.get("Authorization");
    const userClient = getUserClient(authHeader);
    const { data: { user } } = await userClient.auth.getUser();
    if (!user || user.app_metadata?.role !== "admin") {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { application_id } = await req.json();
    if (!application_id) {
      return jsonResponse({ error: "application_id required" }, 400);
    }

    const supabase = getServiceClient();

    const { data: app } = await supabase
      .from("membership_applications")
      .select("id, user_id, email")
      .eq("id", application_id)
      .maybeSingle();
    if (!app) return jsonResponse({ error: "Application not found" }, 404);

    const { data: members } = await supabase
      .from("members")
      .select("id")
      .eq("application_id", application_id);
    const memberIds = (members ?? []).map((m: { id: string }) => m.id);

    const { data: docs } = await supabase
      .from("application_documents")
      .select("id, storage_path")
      .eq("application_id", application_id);
    const storagePaths = (docs ?? [])
      .map((d: { storage_path: string }) => d.storage_path)
      .filter(Boolean);

    if (storagePaths.length) {
      await supabase.storage
        .from("membership-documents")
        .remove(storagePaths);
    }

    if (memberIds.length) {
      await supabase
        .from("membership_subscriptions")
        .delete()
        .in("member_id", memberIds);
    }

    await supabase
      .from("payments")
      .delete()
      .eq("application_id", application_id);

    await supabase
      .from("application_documents")
      .delete()
      .eq("application_id", application_id);

    if (memberIds.length) {
      await supabase.from("members").delete().in("id", memberIds);
    }

    await supabase
      .from("membership_applications")
      .delete()
      .eq("id", application_id);

    if (app.user_id) {
      const [{ count: otherMembers }, { count: otherApps }] = await Promise.all([
        supabase
          .from("members")
          .select("id", { count: "exact", head: true })
          .eq("user_id", app.user_id),
        supabase
          .from("membership_applications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", app.user_id),
      ]);

      if ((otherMembers ?? 0) === 0 && (otherApps ?? 0) === 0) {
        const { data: authUser } = await supabase.auth.admin.getUserById(app.user_id);
        if (authUser?.user?.app_metadata?.role !== "admin") {
          await supabase.auth.admin.deleteUser(app.user_id);
        }
      }
    }

    return jsonResponse({
      success: true,
      deleted: {
        application_id,
        members: memberIds.length,
        documents: docs?.length ?? 0,
      },
    });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});