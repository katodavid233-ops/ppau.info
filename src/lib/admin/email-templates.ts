export const EMAIL_TEMPLATE_SLUGS = [
  { slug: "welcome", name: "Welcome (approved)", description: "Membership approved — welcome email" },
  { slug: "application_submitted", name: "Application received", description: "After applicant submits form" },
  { slug: "payment_received", name: "Payment confirmation", description: "Successful Flutterwave or verified payment" },
  {
    slug: "payment_reminder",
    name: "Payment reminder",
    description: "Admin resend — payment link and how to pay (unpaid applications)",
  },
  { slug: "rejected", name: "Application rejected", description: "Includes rejection reason" },
  { slug: "renewal_reminder", name: "Renewal reminder", description: "Before membership expires" },
  { slug: "subscription_failed", name: "Subscription failed", description: "Failed auto-renewal" },
  { slug: "member_invite", name: "Portal invite", description: "Set password link for new members" },
  {
    slug: "contact_submission",
    name: "Contact form alert",
    description: "Sent to notification email when /contact form is submitted",
  },
] as const;

export const TEMPLATE_VARIABLES: Record<string, string[]> = {
  welcome: ["name", "membership_number", "period_end", "portal_url", "invite_link"],
  application_submitted: ["name", "reference", "next_steps", "portal_url"],
  payment_received: ["name", "amount", "reference", "portal_url"],
  payment_reminder: [
    "name",
    "amount",
    "reference",
    "payment_link",
    "payment_page_url",
    "how_to_pay",
    "portal_url",
  ],
  rejected: ["name", "reason"],
  renewal_reminder: ["name", "period_end", "renew_url"],
  subscription_failed: ["name", "renew_url"],
  member_invite: ["name", "invite_link", "portal_url"],
  contact_submission: ["name", "email", "phone", "subject", "message"],
};

export function renderTemplateVars(html: string, data: Record<string, string>) {
  let out = html;
  for (const [k, v] of Object.entries(data)) {
    out = out.replaceAll(`{{${k}}}`, v ?? "");
  }
  if (data.invite_link) {
    out = out.replaceAll(
      "{{invite_link_block}}",
      `<p><a href="${data.invite_link}">Set your password</a></p>`,
    );
  } else {
    out = out.replaceAll("{{invite_link_block}}", "");
  }
  return out;
}

export const DEFAULT_TEMPLATE_CONTENT: Record<
  string,
  { name: string; description: string; subject: string; body_html: string }
> = {
  welcome: {
    name: "Welcome (approved)",
    description: "Membership approved — welcome email",
    subject: "Welcome to PPAU — Membership Approved",
    body_html:
      "<p>Dear {{name}},</p><p>Congratulations! Your PPAU membership has been approved.</p><p><strong>Membership number:</strong> {{membership_number}}</p><p>Valid until: {{period_end}}</p><p><a href=\"{{portal_url}}\">Access member portal</a></p>{{invite_link_block}}",
  },
  application_submitted: {
    name: "Application received",
    description: "After applicant submits form",
    subject: "PPAU Membership Application Received",
    body_html:
      "<p>Dear {{name}},</p><p>Your application has been received.</p><p><strong>Reference:</strong> {{reference}}</p><p>{{next_steps}}</p><p><a href=\"{{portal_url}}\">View status</a></p>",
  },
  payment_received: {
    name: "Payment confirmation",
    description: "Successful payment",
    subject: "PPAU Payment Confirmation",
    body_html:
      "<p>Dear {{name}},</p><p>We received your payment of UGX {{amount}}.</p><p>Reference: {{reference}}</p>",
  },
  payment_reminder: {
    name: "Payment reminder",
    description: "Admin resend for unpaid applications",
    subject: "PPAU Membership — Complete Your Payment",
    body_html:
      "<p>Dear {{name}},</p><p>Your application is awaiting payment of <strong>UGX {{amount}}</strong>.</p><p><a href=\"{{payment_link}}\">Pay with Flutterwave</a></p>{{how_to_pay}}<p>Reference: {{reference}}</p>",
  },
  rejected: {
    name: "Application rejected",
    description: "Includes rejection reason",
    subject: "PPAU Membership Application Update",
    body_html:
      "<p>Dear {{name}},</p><p>Your application could not be approved at this time.</p><p>{{reason}}</p>",
  },
  renewal_reminder: {
    name: "Renewal reminder",
    description: "Before membership expires",
    subject: "PPAU Membership Renewal Reminder",
    body_html:
      "<p>Dear {{name}},</p><p>Your membership expires on {{period_end}}. Annual fee: UGX 50,000.</p><p><a href=\"{{renew_url}}\">Renew now</a></p>",
  },
  subscription_failed: {
    name: "Subscription failed",
    description: "Failed auto-renewal",
    subject: "PPAU Subscription Payment Failed",
    body_html:
      "<p>Dear {{name}},</p><p>Your subscription payment failed. <a href=\"{{renew_url}}\">Update payment</a></p>",
  },
  member_invite: {
    name: "Portal invite",
    description: "Set password link",
    subject: "PPAU Member Portal Invitation",
    body_html:
      "<p>Dear {{name}},</p><p>Welcome! <a href=\"{{invite_link}}\">Set your password</a> to access the member portal.</p>",
  },
  contact_submission: {
    name: "Contact form alert",
    description: "Admin notification for /contact submissions",
    subject: "PPAU Contact Form: {{subject}}",
    body_html:
      "<p><strong>From:</strong> {{name}} &lt;{{email}}&gt;</p><p><strong>Phone:</strong> {{phone}}</p><p><strong>Subject:</strong> {{subject}}</p><p>{{message}}</p>",
  },
};

export function wrapEmailHtml(body: string, opts: { logoUrl: string; primaryColor: string; footerHtml?: string }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;">
<tr><td style="background:${opts.primaryColor};padding:24px;text-align:center;">
<img src="${opts.logoUrl}" alt="PPAU" width="100" height="auto" style="display:block;margin:0 auto 12px;border-radius:8px;background:#fff;padding:8px;"/>
<p style="margin:0;color:#ffffff;font-size:14px;font-weight:600;">Pharmacy Professionals Association of Uganda</p>
</td></tr>
<tr><td style="padding:32px 28px;color:#18181b;font-size:15px;line-height:1.6;">${body}</td></tr>
<tr><td style="padding:20px 28px;background:#fafafa;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a;">
${opts.footerHtml ?? "<p>PPAU Secretariat · Kampala, Uganda</p>"}
</td></tr></table></td></tr></table></body></html>`;
}
