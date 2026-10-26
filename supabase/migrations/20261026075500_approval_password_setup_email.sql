CREATE TABLE IF NOT EXISTS approval_email_deliveries (
  application_id UUID PRIMARY KEY
    REFERENCES membership_applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('processing', 'sent', 'failed')),
  error_message TEXT,
  processing_started_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE approval_email_deliveries ENABLE ROW LEVEL SECURITY;

UPDATE email_templates
SET
  name = 'Welcome (approved)',
  description = 'Sent once when membership is approved, with a password setup link',
  subject = 'You''re approved — set your password and enter the portal',
  body_html = '<p>Dear {{name}},</p><p>Your PPAU membership has been approved. Set your password and enter the member portal using the link below.</p><p><a href="{{invite_link}}">Set your password and enter the portal</a></p><p><strong>Membership number:</strong> {{membership_number}}</p><p>Valid until: {{period_end}}</p>',
  updated_at = now()
WHERE slug = 'welcome';
