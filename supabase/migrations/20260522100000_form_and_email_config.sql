-- Form configurations (professional / student)
CREATE TABLE membership_form_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_type membership_type NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  intro_html TEXT,
  fee_ugx INT,
  fee_label TEXT,
  fields_config JSONB NOT NULL DEFAULT '[]',
  documents_config JSONB NOT NULL DEFAULT '[]',
  steps_config JSONB NOT NULL DEFAULT '[]',
  is_published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email settings (singleton)
CREATE TABLE email_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  from_name TEXT NOT NULL DEFAULT 'PPAU Membership',
  from_email TEXT NOT NULL DEFAULT 'membership@ppau.info',
  reply_to TEXT,
  logo_url TEXT NOT NULL DEFAULT 'https://ppau.info/PPAU_logo.jpeg',
  primary_color TEXT NOT NULL DEFAULT '#0d9488',
  footer_html TEXT,
  app_url TEXT NOT NULL DEFAULT 'https://ppau.info',
  reminders_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_days_before INT[] NOT NULL DEFAULT '{30,7}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO email_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE membership_form_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_form_configs ON membership_form_configs
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY admin_email_templates ON email_templates
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY admin_email_settings ON email_settings
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Public read published form configs
CREATE POLICY public_read_form_configs ON membership_form_configs
  FOR SELECT USING (is_published = true);

CREATE POLICY public_read_email_templates ON email_templates
  FOR SELECT USING (enabled = true);

-- Seed email templates
INSERT INTO email_templates (slug, name, description, subject, body_html) VALUES
('welcome', 'Welcome (approved)', 'Sent when membership is approved', 'Welcome to PPAU — Membership Approved',
 '<p>Dear {{name}},</p><p>Congratulations! Your PPAU membership has been approved.</p><p><strong>Membership number:</strong> {{membership_number}}</p><p>Valid until: {{period_end}}</p><p><a href="{{portal_url}}">Access member portal</a></p>{{invite_link_block}}'),
('application_submitted', 'Application received', 'After form submission', 'PPAU Membership Application Received',
 '<p>Dear {{name}},</p><p>Your application has been received.</p><p><strong>Reference:</strong> {{reference}}</p><p>{{next_steps}}</p><p><a href="{{portal_url}}">View status</a></p>'),
('payment_received', 'Payment confirmation', 'After successful payment', 'PPAU Payment Confirmation',
 '<p>Dear {{name}},</p><p>We received your payment of UGX {{amount}}.</p><p>Reference: {{reference}}</p>'),
('rejected', 'Application rejected', 'When application is rejected', 'PPAU Membership Application Update',
 '<p>Dear {{name}},</p><p>Your application could not be approved at this time.</p><p>{{reason}}</p>'),
('renewal_reminder', 'Renewal reminder', 'Before membership expires', 'PPAU Membership Renewal Reminder',
 '<p>Dear {{name}},</p><p>Your membership expires on {{period_end}}. Annual fee: UGX 50,000.</p><p><a href="{{renew_url}}">Renew now</a></p>'),
('subscription_failed', 'Subscription failed', 'Failed recurring payment', 'PPAU Subscription Payment Failed',
 '<p>Dear {{name}},</p><p>Your subscription payment failed. <a href="{{renew_url}}">Update payment</a></p>'),
('member_invite', 'Member portal invite', 'Password setup invite', 'PPAU Member Portal Invitation',
 '<p>Dear {{name}},</p><p>Welcome! <a href="{{invite_link}}">Set your password</a> to access the member portal.</p>')
ON CONFLICT (slug) DO NOTHING;

-- Seed form configs
INSERT INTO membership_form_configs (membership_type, title, subtitle, intro_html, fee_ugx, fee_label, steps_config, documents_config) VALUES
('professional', 'Professional Membership Application', 'Annual subscription — UGX 50,000',
 '<p>Complete all sections accurately. Upload required documents before payment.</p>', 50000, 'UGX 50,000 per annum',
 '["Personal","Professional","Documents","Declaration"]'::jsonb,
 '[{"type":"photo","label":"Recent photograph","required":true},{"type":"ahpc_certificate","label":"Certificate of registration","required":true},{"type":"payment_proof","label":"Proof of payment (if paid manually)","required":false}]'::jsonb),
('student', 'Student Membership Application', 'Free student membership',
 '<p>For students in Certificate or Diploma in Pharmacy programmes.</p>', 0, 'Free',
 '["Personal","Academic","Documents","Declaration"]'::jsonb,
 '[{"type":"student_id","label":"Student ID","required":true},{"type":"photo","label":"Passport photograph","required":true},{"type":"admission_letter","label":"Admission letter","required":true},{"type":"cph_transcript","label":"CPH transcript / A level","required":false},{"type":"o_level_slip","label":"O level passlip","required":false}]'::jsonb)
ON CONFLICT (membership_type) DO NOTHING;
