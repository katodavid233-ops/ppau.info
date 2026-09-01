import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getSupabaseAnonJwt } from "@/lib/supabase/keys";
import { DEFAULT_CONTACT_PAGE, type ContactPageSettings, type ContactSubmission } from "./defaults";

function parseSettings(row: Record<string, unknown>): ContactPageSettings {
  return {
    hero_eyebrow: String(row.hero_eyebrow ?? DEFAULT_CONTACT_PAGE.hero_eyebrow),
    hero_title: String(row.hero_title ?? DEFAULT_CONTACT_PAGE.hero_title),
    hero_subtitle: String(row.hero_subtitle ?? DEFAULT_CONTACT_PAGE.hero_subtitle),
    section_label: String(row.section_label ?? DEFAULT_CONTACT_PAGE.section_label),
    section_title: String(row.section_title ?? DEFAULT_CONTACT_PAGE.section_title),
    section_description: String(row.section_description ?? DEFAULT_CONTACT_PAGE.section_description),
    contact_items: (row.contact_items as ContactPageSettings["contact_items"]) ?? DEFAULT_CONTACT_PAGE.contact_items,
    social_links: (row.social_links as ContactPageSettings["social_links"]) ?? DEFAULT_CONTACT_PAGE.social_links,
    map_embed_url: String(row.map_embed_url ?? DEFAULT_CONTACT_PAGE.map_embed_url),
    form_title: String(row.form_title ?? DEFAULT_CONTACT_PAGE.form_title),
    form_description: String(row.form_description ?? DEFAULT_CONTACT_PAGE.form_description),
    form_submit_label: String(row.form_submit_label ?? DEFAULT_CONTACT_PAGE.form_submit_label),
    success_message: String(row.success_message ?? DEFAULT_CONTACT_PAGE.success_message),
    notification_email: (row.notification_email as string | null) ?? null,
    form_enabled: row.form_enabled !== false,
    is_published: row.is_published !== false,
  };
}

export async function fetchPublicContactPage(): Promise<ContactPageSettings> {
  if (!isSupabaseConfigured) return DEFAULT_CONTACT_PAGE;

  const sb = getSupabase();
  const { data, error } = await sb
    .from("contact_page_settings")
    .select("*")
    .eq("id", 1)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) return DEFAULT_CONTACT_PAGE;
  return parseSettings(data);
}

export async function fetchContactPageSettings(): Promise<ContactPageSettings> {
  const sb = getSupabase();
  const { data, error } = await sb.from("contact_page_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return parseSettings(data);
}

export async function saveContactPageSettings(settings: ContactPageSettings) {
  const sb = getSupabase();
  const { error } = await sb
    .from("contact_page_settings")
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw error;
}

export async function fetchContactSubmissions() {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ContactSubmission[];
}

export async function updateContactSubmissionStatus(
  id: string,
  status: ContactSubmission["status"],
) {
  const sb = getSupabase();
  const { error } = await sb.from("contact_submissions").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function submitContactForm(payload: {
  full_name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  if (!isSupabaseConfigured) {
    throw new Error("Contact form is not configured yet");
  }

  const anonJwt = getSupabaseAnonJwt();
  if (!anonJwt) {
    throw new Error("Add VITE_SUPABASE_ANON_KEY to .env.local and restart the dev server.");
  }

  const sb = getSupabase();
  const { data, error } = await sb.functions.invoke("submit-contact", {
    body: payload,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonJwt}`,
      apikey: anonJwt,
    },
  });

  if (error) {
    const ctx = (error as { context?: Response }).context;
    let message = error.message;
    if (ctx) {
      try {
        const json = await ctx.json();
        if (json?.error) message = String(json.error);
      } catch {
        /* ignore */
      }
    }
    throw new Error(message);
  }

  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(String(data.error));
  }

  return data as { success: boolean };
}
