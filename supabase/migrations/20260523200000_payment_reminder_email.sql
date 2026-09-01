INSERT INTO email_templates (slug, name, description, subject, body_html) VALUES
(
  'payment_reminder',
  'Payment reminder',
  'Resent by admin when payment is unpaid — includes Flutterwave link and manual payment instructions',
  'PPAU Membership — Complete Your Payment',
  '<p>Dear {{name}},</p><p>Your PPAU professional membership application is awaiting payment of <strong>UGX {{amount}}</strong>.</p><p><a href="{{payment_link}}" style="display:inline-block;padding:12px 24px;background:#0d9488;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Pay online with Flutterwave</a></p>{{how_to_pay}}<p>Reference: {{reference}}</p><p><a href="{{portal_url}}">Member portal</a></p>'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  updated_at = now();
