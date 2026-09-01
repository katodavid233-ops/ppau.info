import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getSupabaseAnonJwt } from "@/lib/supabase/keys";

/** Public Edge Functions need legacy anon JWT in both Authorization and apikey (not sb_publishable_). */
function getEdgeFunctionHeaders(auth?: string): Record<string, string> {
  const anonJwt = getSupabaseAnonJwt();
  if (auth) {
    const token = auth.replace(/^Bearer\s+/i, "");
    return {
      "Content-Type": "application/json",
      Authorization: auth,
      apikey: token,
    };
  }
  if (!anonJwt) {
    throw new Error(
      "Add VITE_SUPABASE_ANON_KEY to .env.local (Supabase Dashboard → API → anon public legacy key), then restart the dev server.",
    );
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${anonJwt}`,
    apikey: anonJwt,
  };
}

async function invokeFunction<T>(
  name: string,
  body: Record<string, unknown>,
  auth?: string,
): Promise<T> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase not configured");
  }

  const baseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  // Use fetch (not supabase.functions.invoke) so a logged-in admin/member session
  // cannot override the anon JWT — avoids RLS errors on public membership flows.
  const res = await fetch(`${baseUrl}/functions/v1/${name}`, {
    method: "POST",
    headers: getEdgeFunctionHeaders(auth),
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    const message = data?.error ? String(data.error) : `Request failed (${res.status})`;
    if (message.includes("401") || message.toLowerCase().includes("unauthorized")) {
      throw new Error(
        "Membership service unauthorized — set VITE_SUPABASE_ANON_KEY on Vercel and redeploy.",
      );
    }
    throw new Error(message);
  }

  if (data && "error" in data && data.error) {
    throw new Error(String(data.error));
  }

  return data as T;
}

export async function createApplication(
  membership_type: "professional" | "student",
  email: string,
  full_name: string,
) {
  return invokeFunction<{ application_id: string }>("create-application", {
    membership_type,
    email,
    full_name,
  });
}

export async function submitApplication(
  application_id: string,
  payload: Record<string, unknown>,
) {
  const { declaration: _d, ...fields } = payload;
  return invokeFunction<{ success: boolean; status: string; membership_number?: string }>(
    "submit-application",
    {
      application_id,
      ...fields,
    },
  );
}

export async function createUploadUrl(
  application_id: string,
  document_type: string,
  file_name: string,
  mime_type?: string,
  file_size?: number,
) {
  const sb = getSupabase();
  const path = `${application_id}/${document_type}/${Date.now()}-${file_name}`;

  const { data: signed, error: signError } = await sb.storage
    .from("membership-documents")
    .createSignedUploadUrl(path);

  if (signError) {
    if (getSupabaseAnonJwt()) {
      return invokeFunction<{ signed_url: string; path: string; token?: string }>(
        "create-upload-url",
        { application_id, document_type, file_name, mime_type, file_size },
      );
    }
    throw new Error(signError.message);
  }

  const { error: docError } = await sb.from("application_documents").insert({
    application_id,
    document_type,
    storage_path: path,
    file_name,
    mime_type: mime_type ?? null,
    file_size: file_size ?? null,
  });

  if (docError) throw new Error(docError.message);

  return {
    signed_url: signed.signedUrl,
    path,
    token: signed.token,
  };
}

async function notifyPaymentProofUploaded(application_id: string, document_type: string) {
  if (document_type !== "payment_proof") return;
  await invokeFunction<{ success: boolean }>("record-payment-proof", { application_id });
}

export async function uploadDocument(
  application_id: string,
  document_type: string,
  file: File,
) {
  const sb = getSupabase();
  const path = `${application_id}/${document_type}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await sb.storage
    .from("membership-documents")
    .upload(path, file, { upsert: true, contentType: file.type || undefined });

  if (uploadError) {
    const { signed_url, token } = await createUploadUrl(
      application_id,
      document_type,
      file.name,
      file.type,
      file.size,
    );
    const headers: Record<string, string> = {
      "Content-Type": file.type || "application/octet-stream",
    };
    if (token) headers["x-upsert"] = "true";
    const res = await fetch(signed_url, { method: "PUT", headers, body: file });
    if (!res.ok) throw new Error("Upload failed");
    await notifyPaymentProofUploaded(application_id, document_type);
    return path;
  }

  const { error: docError } = await sb.from("application_documents").insert({
    application_id,
    document_type,
    storage_path: path,
    file_name: file.name,
    mime_type: file.type || null,
    file_size: file.size,
  });

  if (docError) throw new Error(docError.message);

  await notifyPaymentProofUploaded(application_id, document_type);

  return path;
}

export async function requestMemberPortalAccess(email: string, redirectTo?: string) {
  return invokeFunction<{ success: boolean; message?: string }>(
    "request-member-portal-access",
    { email, redirect_to: redirectTo },
  );
}

export async function initiatePayment(
  opts: {
    application_id?: string;
    member_id?: string;
    is_renewal?: boolean;
    use_subscription?: boolean;
  },
) {
  return invokeFunction<{ type: string; link: string; payment_id: string; tx_ref: string }>(
    "initiate-flutterwave-payment",
    opts,
  );
}

export async function resendPaymentEmail(application_id: string, accessToken: string) {
  return invokeFunction<{ success: boolean; email: string; payment_link: string }>(
    "admin-resend-payment-email",
    { application_id },
    `Bearer ${accessToken}`,
  );
}

export async function sendTestEmail(to: string, accessToken: string) {
  return invokeFunction<{ success: boolean; to: string; provider: string }>(
    "admin-test-email",
    { to },
    `Bearer ${accessToken}`,
  );
}

export async function adminAction(
  application_id: string,
  action:
    | "approve"
    | "approve_without_payment"
    | "reject"
    | "verify_payment"
    | "reject_payment_proof",
  admin_notes?: string,
  accessToken?: string,
) {
  const auth = accessToken ? `Bearer ${accessToken}` : undefined;
  return invokeFunction<Record<string, unknown>>(
    "admin-approve-application",
    { application_id, action, admin_notes },
    auth,
  );
}

export async function getDocumentUrl(document_id: string, accessToken: string) {
  return invokeFunction<{ url: string }>(
    "get-document-url",
    { document_id },
    `Bearer ${accessToken}`,
  );
}

export async function linkMemberAccount(accessToken: string) {
  return invokeFunction<{ success: boolean }>(
    "link-member-account",
    {},
    `Bearer ${accessToken}`,
  );
}

export async function importLegacyCsv(csv_text: string, accessToken: string) {
  return invokeFunction<{ imported: number; skipped: number }>(
    "import-legacy-members",
    { csv_text },
    `Bearer ${accessToken}`,
  );
}

export type ApplicationRow = {
  id: string;
  membership_type: "professional" | "student";
  status: string;
  payment_status: string;
  membership_number: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  [key: string]: unknown;
};

export async function fetchApplications(accessToken: string) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("membership_applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ApplicationRow[];
}

export async function fetchApplication(id: string, accessToken: string) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("membership_applications")
    .select("*, application_documents(*), payments(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchMemberDashboard(accessToken: string) {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: member } = await sb
    .from("members")
    .select("*, membership_subscriptions(*)")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: applications } = await sb
    .from("membership_applications")
    .select("*")
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .order("created_at", { ascending: false });

  const { data: payments } = await sb
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return { user, member, applications, payments };
}
