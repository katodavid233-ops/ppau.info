import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { application_id, document_type, file_name, mime_type, file_size } =
      await req.json();

    if (!application_id || !document_type || !file_name) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }

    const supabase = getServiceClient();
    const path = `${application_id}/${document_type}/${Date.now()}-${file_name}`;

    const { data: signed, error: signError } = await supabase.storage
      .from("membership-documents")
      .createSignedUploadUrl(path);

    if (signError) return jsonResponse({ error: signError.message }, 400);

    await supabase.from("application_documents").insert({
      application_id,
      document_type,
      storage_path: path,
      file_name,
      mime_type: mime_type ?? null,
      file_size: file_size ?? null,
    });

    return jsonResponse({
      signed_url: signed?.signedUrl,
      path,
      token: signed?.token,
    });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
