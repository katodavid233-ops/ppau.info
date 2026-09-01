-- SMTP delivery option alongside Resend API
ALTER TABLE email_settings
  ADD COLUMN IF NOT EXISTS email_provider TEXT NOT NULL DEFAULT 'resend'
    CHECK (email_provider IN ('resend', 'smtp')),
  ADD COLUMN IF NOT EXISTS smtp_host TEXT,
  ADD COLUMN IF NOT EXISTS smtp_port INT NOT NULL DEFAULT 587,
  ADD COLUMN IF NOT EXISTS smtp_user TEXT,
  ADD COLUMN IF NOT EXISTS smtp_password TEXT,
  ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN email_settings.email_provider IS 'resend = Resend API (RESEND_API_KEY secret); smtp = custom SMTP server';
COMMENT ON COLUMN email_settings.smtp_password IS 'Admin-only; used by Edge Functions for outbound mail';
