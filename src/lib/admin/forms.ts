import { getSupabase } from "@/lib/supabase/client";
import { DEFAULT_TEMPLATE_CONTENT, EMAIL_TEMPLATE_SLUGS } from "@/lib/admin/email-templates";
import type { MembershipFormConfig } from "@/lib/membership/form-config-defaults";
import {
  DEFAULT_PROFESSIONAL_CONFIG,
  DEFAULT_STUDENT_CONFIG,
} from "@/lib/membership/form-config-defaults";
import { mergeFormConfig } from "@/lib/membership/form-config-utils";

export async function fetchFormConfig(type: "professional" | "student") {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("membership_form_configs")
    .select("*")
    .eq("membership_type", type)
    .maybeSingle();
  if (error) throw error;
  const base = type === "professional" ? DEFAULT_PROFESSIONAL_CONFIG : DEFAULT_STUDENT_CONFIG;
  if (!data) return base;
  return mergeFormConfig(base, data as Partial<MembershipFormConfig>);
}

export async function saveFormConfig(
  type: "professional" | "student",
  config: Partial<MembershipFormConfig>,
) {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  const row = {
    membership_type: type,
    title: config.title,
    subtitle: config.subtitle,
    intro_html: config.intro_html,
    fee_ugx: config.fee_ugx,
    fee_label: config.fee_label,
    fields_config: config.fields_config,
    documents_config: config.documents_config,
    steps_config: config.steps_config,
    is_published: config.is_published ?? true,
    updated_at: new Date().toISOString(),
    updated_by: user?.id,
  };
  const { error } = await sb.from("membership_form_configs").upsert(row, {
    onConflict: "membership_type",
  });
  if (error) throw error;
}

export type EmailTemplate = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  subject: string;
  body_html: string;
  enabled: boolean;
};

export type EmailProvider = "resend" | "smtp";

export type EmailSettings = {
  from_name: string;
  from_email: string;
  reply_to: string | null;
  logo_url: string;
  primary_color: string;
  footer_html: string | null;
  app_url: string;
  reminders_enabled: boolean;
  reminder_days_before: number[];
  email_provider: EmailProvider;
  smtp_host: string | null;
  smtp_port: number;
  smtp_user: string | null;
  smtp_secure: boolean;
  /** True when a password is stored; password itself is never returned to the client */
  smtp_password_configured?: boolean;
};

export type EmailSettingsDraft = EmailSettings & {
  /** Only sent on save when the admin enters a new password */
  smtp_password_new?: string;
};

export async function fetchEmailTemplates() {
  const sb = getSupabase();
  const { data, error } = await sb.from("email_templates").select("*").order("name");
  if (error) throw error;
  return data as EmailTemplate[];
}

export async function fetchEmailTemplate(slug: string) {
  return fetchEmailTemplateBySlug(slug);
}

/** Load template from DB or return editable defaults (never throws for missing row). */
export async function fetchEmailTemplateBySlug(slug: string): Promise<EmailTemplate> {
  const sb = getSupabase();
  const { data, error } = await sb.from("email_templates").select("*").eq("slug", slug).maybeSingle();

  const meta = EMAIL_TEMPLATE_SLUGS.find((m) => m.slug === slug);
  const defaults = DEFAULT_TEMPLATE_CONTENT[slug];
  const fallbackName = meta?.name ?? defaults?.name ?? slug;
  const fallbackDesc = meta?.description ?? defaults?.description ?? "";

  if (data) {
    return data as EmailTemplate;
  }

  if (error) {
    console.warn("fetchEmailTemplateBySlug:", error.message);
  }

  if (defaults) {
    return {
      id: "",
      slug,
      name: fallbackName,
      description: fallbackDesc,
      subject: defaults.subject,
      body_html: defaults.body_html,
      enabled: true,
    };
  }

  throw new Error(`Unknown template: ${slug}`);
}

export async function saveEmailTemplate(template: Partial<EmailTemplate> & { slug: string }) {
  const sb = getSupabase();
  const row = {
    slug: template.slug,
    name: template.name ?? template.slug,
    description: template.description ?? null,
    subject: template.subject ?? "",
    body_html: template.body_html ?? "",
    enabled: template.enabled ?? true,
    updated_at: new Date().toISOString(),
  };
  const { error } = await sb.from("email_templates").upsert(row, { onConflict: "slug" });
  if (error) throw error;
}

export async function fetchEmailSettings(): Promise<EmailSettings> {
  const sb = getSupabase();
  const { data, error } = await sb.from("email_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  const row = data as EmailSettings & { smtp_password?: string | null };
  const { smtp_password, ...rest } = row;
  return {
    ...rest,
    email_provider: (rest.email_provider ?? "resend") as EmailProvider,
    smtp_port: rest.smtp_port ?? 587,
    smtp_secure: rest.smtp_secure ?? true,
    smtp_password_configured: Boolean(smtp_password?.length),
  };
}

export async function saveEmailSettings(settings: Partial<EmailSettingsDraft>) {
  const sb = getSupabase();
  const { smtp_password_new, smtp_password_configured: _c, ...rest } = settings;
  const row: Record<string, unknown> = {
    ...rest,
    updated_at: new Date().toISOString(),
  };
  if (smtp_password_new?.trim()) {
    row.smtp_password = smtp_password_new.trim();
  }
  const { error } = await sb.from("email_settings").update(row).eq("id", 1);
  if (error) throw error;
}

/** Public: read published form config (anon), merged with full field list */
export async function fetchPublicFormConfig(type: "professional" | "student") {
  const sb = getSupabase();
  const base = type === "professional" ? DEFAULT_PROFESSIONAL_CONFIG : DEFAULT_STUDENT_CONFIG;
  const { data } = await sb
    .from("membership_form_configs")
    .select(
      "title, subtitle, intro_html, fee_ugx, fee_label, fields_config, documents_config, steps_config, is_published",
    )
    .eq("membership_type", type)
    .eq("is_published", true)
    .maybeSingle();
  if (!data) return mergeFormConfig(base, null);
  return mergeFormConfig(base, data as Partial<MembershipFormConfig>);
}
