-- Contact page content (singleton) and form submissions
CREATE TABLE contact_page_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_eyebrow TEXT NOT NULL DEFAULT 'Contact',
  hero_title TEXT NOT NULL DEFAULT 'Connect With PPAU',
  hero_subtitle TEXT NOT NULL DEFAULT 'We would love to hear from you. Reach out about membership, events, or partnerships.',
  section_label TEXT NOT NULL DEFAULT 'Get in Touch',
  section_title TEXT NOT NULL DEFAULT 'We''re Here to Help',
  section_description TEXT NOT NULL DEFAULT 'Whether you have questions about membership, upcoming events, or professional development, our team is ready to assist you.',
  contact_items JSONB NOT NULL DEFAULT '[]',
  social_links JSONB NOT NULL DEFAULT '[]',
  map_embed_url TEXT NOT NULL DEFAULT 'https://www.google.com/maps?q=Nakawa,Kampala,Uganda&output=embed',
  form_title TEXT NOT NULL DEFAULT 'Send a Message',
  form_description TEXT NOT NULL DEFAULT 'Fill in the form below and we will get back to you shortly.',
  form_submit_label TEXT NOT NULL DEFAULT 'Send Message',
  success_message TEXT NOT NULL DEFAULT 'Your message was received. We will be in touch soon.',
  notification_email TEXT,
  form_enabled BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_submissions_created ON contact_submissions (created_at DESC);
CREATE INDEX idx_contact_submissions_status ON contact_submissions (status);

INSERT INTO contact_page_settings (id, contact_items, social_links, notification_email) VALUES (
  1,
  '[
    {"icon":"phone","label":"Phone","value":"+256 740 657759","sub":"Mon to Fri, 9:00 AM to 5:00 PM EAT","href":"tel:+256740657759"},
    {"icon":"mail","label":"General enquiries","value":"info@ppau.info","sub":"We reply within 24 hours","href":"mailto:info@ppau.info"},
    {"icon":"mail","label":"Secretary","value":"ppausecretary@gmail.com","sub":"Secretariat and membership correspondence","href":"mailto:ppausecretary@gmail.com"},
    {"icon":"mail","label":"President","value":"ppau.ltd@gmail.com","sub":"Office of the President","href":"mailto:ppau.ltd@gmail.com"},
    {"icon":"mapPin","label":"Office","value":"Nakawa, Kampala, Uganda","sub":"Visit us during office hours","href":null},
    {"icon":"clock","label":"Office Hours","value":"Mon to Fri: 9:00 AM to 5:00 PM","sub":"East Africa Time (EAT)","href":null}
  ]'::jsonb,
  '[
    {"label":"X (Twitter) @ppau_official","href":"https://twitter.com/ppau_official"},
    {"label":"TikTok @ppau_official","href":"https://www.tiktok.com/@ppau_official"}
  ]'::jsonb,
  'info@ppau.info'
) ON CONFLICT (id) DO NOTHING;

ALTER TABLE contact_page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_contact_settings ON contact_page_settings
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY admin_contact_submissions ON contact_submissions
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY public_read_contact_settings ON contact_page_settings
  FOR SELECT USING (is_published = true);

CREATE POLICY public_insert_contact_submission ON contact_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

INSERT INTO email_templates (slug, name, description, subject, body_html) VALUES
('contact_submission', 'Contact form (admin alert)', 'Sent to notification email when someone submits the contact form',
 'PPAU Contact Form: {{subject}}',
 '<p><strong>From:</strong> {{name}} &lt;{{email}}&gt;</p><p><strong>Phone:</strong> {{phone}}</p><p><strong>Subject:</strong> {{subject}}</p><p>{{message}}</p>')
ON CONFLICT (slug) DO NOTHING;
