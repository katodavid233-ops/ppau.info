import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { getServiceClient } from "./supabase.ts";

export type EmailTemplateSlug =
  | "application_submitted"
  | "payment_received"
  | "payment_reminder"
  | "approved"
  | "rejected"
  | "renewal_reminder"
  | "subscription_failed"
  | "member_invite"
  | "welcome"
  | "contact_submission";

const SLUG_MAP: Record<EmailTemplateSlug, string> = {
  approved: "welcome",
  application_submitted: "application_submitted",
  payment_received: "payment_received",
  payment_reminder: "payment_reminder",
  rejected: "rejected",
  renewal_reminder: "renewal_reminder",
  subscription_failed: "subscription_failed",
  member_invite: "member_invite",
  welcome: "welcome",
  contact_submission: "contact_submission",
};

type EmailSettingsRow = {
  from_name: string;
  from_email: string;
  reply_to: string | null;
  logo_url: string;
  primary_color: string;
  footer_html: string | null;
  app_url: string;
  email_provider?: string;
  smtp_host?: string | null;
  smtp_port?: number;
  smtp_user?: string | null;
  smtp_password?: string | null;
  smtp_secure?: boolean;
};

function renderVars(html: string, data: Record<string, string>) {
  let out = html;
  for (const [k, v] of Object.entries(data)) {
    out = out.replaceAll(`{{${k}}}`, v ?? "");
  }
  if (data.invite_link) {
    out = out.replaceAll(
      "{{invite_link_block}}",
      `<p><a href="${data.invite_link}" style="color:#0d9488">Set your password</a></p>`,
    );
  } else {
    out = out.replaceAll("{{invite_link_block}}", "");
  }
  return out;
}

function wrapEmail(
  body: string,
  settings: {
    logo_url: string;
    primary_color: string;
    footer_html: string | null;
  },
) {
  const footer = settings.footer_html ?? "<p>Pharmacy Professionals Association of Uganda</p>";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;">
<tr><td style="background:${settings.primary_color};padding:24px;text-align:center;">
<img src="${settings.logo_url}" alt="PPAU" width="100" style="display:block;margin:0 auto 12px;border-radius:8px;background:#fff;padding:8px;"/>
<p style="margin:0;color:#fff;font-size:14px;font-weight:600;">Pharmacy Professionals Association of Uganda</p>
</td></tr>
<tr><td style="padding:32px 28px;color:#18181b;font-size:15px;line-height:1.6;">${body}</td></tr>
<tr><td style="padding:20px 28px;background:#fafafa;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a;">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

const FALLBACK: Record<string, (d: Record<string, string>) => { subject: string; html: string }> = {
  application_submitted: (d) => ({
    subject: "PPAU Membership Application Received",
    html: `<p>Dear ${d.name},</p><p>Your application has been received. Reference: ${d.reference}</p>`,
  }),
  payment_received: (d) => ({
    subject: "PPAU Payment Confirmation",
    html: `<p>Dear ${d.name},</p><p>Payment of UGX ${d.amount} received.</p>`,
  }),
  payment_reminder: (d) => ({
    subject: "PPAU Membership — Complete Your Payment",
    html: `<p>Dear ${d.name},</p><p>Your PPAU membership application is awaiting payment of UGX ${d.amount}.</p><p><a href="${d.payment_link}">Pay now with Flutterwave</a></p>${d.how_to_pay ?? ""}`,
  }),
  welcome: (d) => ({
    subject: "Welcome to PPAU",
    html: `<p>Dear ${d.name},</p><p>Membership number: ${d.membership_number}</p>`,
  }),
  approved: (d) => ({
    subject: "Welcome to PPAU",
    html: `<p>Dear ${d.name},</p><p>Membership number: ${d.membership_number}</p>`,
  }),
  rejected: (d) => ({
    subject: "PPAU Application Update",
    html: `<p>Dear ${d.name},</p><p>${d.reason}</p>`,
  }),
  renewal_reminder: (d) => ({
    subject: "PPAU Renewal Reminder",
    html: `<p>Dear ${d.name},</p><p>Expires ${d.period_end}. <a href="${d.renew_url}">Renew</a></p>`,
  }),
  subscription_failed: (d) => ({
    subject: "Payment Failed",
    html: `<p>Dear ${d.name},</p><p><a href="${d.renew_url}">Renew</a></p>`,
  }),
  member_invite: (d) => ({
    subject: "PPAU Portal Invite",
    html: `<p>Dear ${d.name},</p><p><a href="${d.invite_link}">Set password</a></p>`,
  }),
  contact_submission: (d) => ({
    subject: `PPAU Contact: ${d.subject ?? "New message"}`,
    html: `<p><strong>From:</strong> ${d.name} (${d.email})</p><p><strong>Phone:</strong> ${d.phone ?? "—"}</p><p><strong>Subject:</strong> ${d.subject}</p><p>${d.message}</p>`,
  }),
};

async function loadSettings(): Promise<EmailSettingsRow | null> {
  const supabase = getServiceClient();
  const { data } = await supabase.from("email_settings").select("*").eq("id", 1).maybeSingle();
  return data as EmailSettingsRow | null;
}

async function sendViaResend(opts: {
  to: string;
  subject: string;
  html: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string | null;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    return { ok: false as const, skipped: true, error: "RESEND_API_KEY not configured in Supabase secrets" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${opts.fromName} <${opts.fromEmail}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      reply_to: opts.replyTo ?? undefined,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      ok: false as const,
      error: typeof body === "object" && body && "message" in body
        ? String((body as { message: string }).message)
        : JSON.stringify(body),
    };
  }
  return { ok: true as const, provider: "resend" as const };
}

async function sendViaSmtp(opts: {
  to: string;
  subject: string;
  html: string;
  fromName: string;
  fromEmail: string;
  settings: EmailSettingsRow;
}) {
  const host = opts.settings.smtp_host?.trim();
  const user = opts.settings.smtp_user?.trim();
  const password = opts.settings.smtp_password?.trim();
  const port = opts.settings.smtp_port ?? 587;

  if (!host || !user || !password) {
    return {
      ok: false as const,
      skipped: true,
      error: "SMTP host, username, and password are required in Email settings",
    };
  }

  const client = new SMTPClient({
    connection: {
      hostname: host,
      port,
      tls: opts.settings.smtp_secure !== false,
      auth: { username: user, password },
    },
  });

  try {
    await client.send({
      from: `${opts.fromName} <${opts.fromEmail}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      content: "auto",
    });
    await client.close();
    return { ok: true as const, provider: "smtp" as const };
  } catch (e) {
    try {
      await client.close();
    } catch {
      /* ignore */
    }
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "SMTP send failed",
    };
  }
}

async function dispatchEmail(opts: {
  to: string;
  subject: string;
  html: string;
  template: string;
  settings: EmailSettingsRow | null;
  metadata?: Record<string, string>;
}) {
  const supabase = getServiceClient();
  const settings = opts.settings;
  const appUrl = Deno.env.get("APP_URL") ?? settings?.app_url ?? "https://ppau.info";
  const logoUrl = settings?.logo_url ?? `${appUrl}/PPAU_logo.jpeg`;
  const fromEmail = settings?.from_email ?? Deno.env.get("RESEND_FROM_EMAIL") ?? "membership@ppau.info";
  const fromName = settings?.from_name ?? "PPAU Membership";
  const provider = settings?.email_provider === "smtp" ? "smtp" : "resend";

  const wrappedHtml = wrapEmail(opts.html, {
    logo_url: logoUrl,
    primary_color: settings?.primary_color ?? "#0d9488",
    footer_html: settings?.footer_html ?? null,
  });

  const sendOpts = {
    to: opts.to,
    subject: opts.subject,
    html: wrappedHtml,
    fromName,
    fromEmail,
    replyTo: settings?.reply_to,
  };

  const result = provider === "smtp"
    ? await sendViaSmtp({ ...sendOpts, settings: settings ?? { from_name: fromName, from_email: fromEmail, reply_to: null, logo_url: logoUrl, primary_color: "#0d9488", footer_html: null, app_url: appUrl } })
    : await sendViaResend(sendOpts);

  const status = result.ok ? "sent" : result.skipped ? "skipped" : "failed";

  await supabase.from("email_log").insert({
    recipient: opts.to,
    template: opts.template,
    subject: opts.subject,
    status,
    error_message: result.ok ? null : ("error" in result ? result.error : null),
    metadata: opts.metadata ?? null,
  });

  return result;
}

export async function sendTestEmail(to: string) {
  const settings = await loadSettings();
  const provider = settings?.email_provider === "smtp" ? "smtp" : "resend";
  const bodyHtml = `<p>This is a <strong>test email</strong> from the PPAU membership portal.</p>
<p>Delivery method: <strong>${provider === "smtp" ? "SMTP" : "Resend API"}</strong></p>
<p>If you received this message, your email configuration is working.</p>
<p style="color:#71717a;font-size:13px;">Sent at ${new Date().toISOString()}</p>`;

  return dispatchEmail({
    to,
    subject: "PPAU — Test email",
    html: bodyHtml,
    template: "test",
    settings,
  });
}

export async function sendEmail(
  template: EmailTemplateSlug,
  to: string,
  data: Record<string, string>,
) {
  const supabase = getServiceClient();
  const slug = SLUG_MAP[template] ?? template;
  const settings = await loadSettings();

  let subject: string;
  let bodyHtml: string;

  const { data: tpl } = await supabase
    .from("email_templates")
    .select("subject, body_html, enabled")
    .eq("slug", slug)
    .maybeSingle();

  if (tpl?.enabled !== false && tpl?.subject && tpl?.body_html) {
    subject = renderVars(tpl.subject, data);
    bodyHtml = renderVars(tpl.body_html, data);
  } else {
    const fb = FALLBACK[slug] ?? FALLBACK.application_submitted;
    const built = fb(data);
    subject = built.subject;
    bodyHtml = built.html;
  }

  return dispatchEmail({
    to,
    subject,
    html: bodyHtml,
    template: slug,
    settings,
    metadata: data,
  });
}
