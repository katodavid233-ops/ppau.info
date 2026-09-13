import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient, getUserClient } from "../_shared/supabase.ts";

const PERSONAL_FIELDS = [
  "full_name",
  "email",
  "phone",
  "physical_address",
  "region",
  "nationality",
  "gender",
  "date_of_birth",
] as const;

const PROFESSIONAL_FIELDS = [
  "ahpc_registration_number",
  "practice_area",
  "sector",
  "government_facility_name",
  "work_address",
] as const;

const LOCKED_FIELDS = new Set([
  "membership_number",
  "membership_type",
  "status",
  "payment_status",
  "user_id",
  "id",
  "created_at",
  "updated_at",
]);

const REGIONS = new Set(["Northern", "Eastern", "Western", "Central"]);
const GENDERS = new Set(["Male", "Female"]);
const SECTORS = new Set(["private", "public"]);

function normalizeField(key: string, value: unknown): { error?: string; value?: unknown } {
  if (value === undefined || value === null || value === "") return { value: null };

  switch (key) {
    case "full_name": {
      const v = String(value).trim().toUpperCase();
      if (v.length < 2) return { error: "Full name must be at least 2 characters" };
      return { value: v };
    }
    case "email": {
      const v = String(value).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { error: "Invalid email address" };
      return { value: v };
    }
    case "phone": {
      const v = String(value).trim();
      return { value: v };
    }
    case "region": {
      const v = String(value);
      if (!REGIONS.has(v)) return { error: "Invalid region" };
      return { value: v };
    }
    case "gender": {
      const v = String(value);
      if (!GENDERS.has(v)) return { error: "Invalid gender" };
      return { value: v };
    }
    case "sector": {
      const v = String(value);
      if (!SECTORS.has(v)) return { error: "Invalid sector" };
      return { value: v };
    }
    case "date_of_birth": {
      const v = String(value);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return { error: "Invalid date of birth" };
      return { value: v };
    }
    default:
      return { value: String(value).trim() };
  }
}

function editableFieldsForType(type: string | undefined): string[] {
  const fields = [...PERSONAL_FIELDS] as string[];
  if (type === "professional") fields.push(...PROFESSIONAL_FIELDS);
  return fields;
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const authHeader = req.headers.get("Authorization");
    const userClient = getUserClient(authHeader);
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

    const supabase = getServiceClient();

    let { data: target } = await supabase
      .from("members")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!target) {
      const byEmail = await supabase
        .from("members")
        .select("*")
        .eq("email", user.email ?? "")
        .maybeSingle();
      target = byEmail.data ?? null;
    }

    if (!target) return jsonResponse({ error: "Member record not found" }, 404);

    const editable = new Set(editableFieldsForType(target.membership_type));

    const body = await req.json();
    const entries = Object.entries(body ?? {}).filter(
      ([key, value]) => value !== undefined && value !== null && value !== "",
    );

    const appUpdate: Record<string, unknown> = {};
    const memberUpdate: Record<string, unknown> = {};
    const errors: Record<string, string> = {};

    for (const [key, value] of entries) {
      if (key === "membership_number" || LOCKED_FIELDS.has(key)) {
        errors[key] = "This field cannot be edited";
        continue;
      }
      if (!editable.has(key)) {
        errors[key] = "This field cannot be edited";
        continue;
      }
      const normalized = normalizeField(key, value);
      if (normalized.error) {
        errors[key] = normalized.error;
        continue;
      }
      const finalValue = normalized.value;
      appUpdate[key] = finalValue;
      if (["full_name", "email", "phone"].includes(key)) memberUpdate[key] = finalValue;
    }

    if (Object.keys(errors).length > 0) {
      return jsonResponse({ error: "Some fields could not be updated", details: errors }, 400);
    }

    if (Object.keys(appUpdate).length === 0) {
      return jsonResponse({ error: "Nothing to update" }, 400);
    }

    if (appUpdate.email && appUpdate.email !== user.email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(user.id, {
        email: appUpdate.email as string,
        email_confirm: true,
      });
      if (authError) {
        return jsonResponse(
          { error: `Could not update email: ${authError.message}` },
          400,
        );
      }
    }

    if (target.application_id) {
      const { error: appError } = await supabase
        .from("membership_applications")
        .update({ ...appUpdate, updated_at: new Date().toISOString() })
        .eq("id", target.application_id);
      if (appError) return jsonResponse({ error: appError.message }, 400);
    }

    if (Object.keys(memberUpdate).length > 0) {
      const { error: memberError } = await supabase
        .from("members")
        .update({ ...memberUpdate, updated_at: new Date().toISOString() })
        .eq("id", target.id);
      if (memberError) return jsonResponse({ error: memberError.message }, 400);
    }

    return jsonResponse({ success: true, updated: Object.keys(appUpdate) });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});