-- PPAU Membership Portal schema

-- Enums
CREATE TYPE membership_type AS ENUM ('professional', 'student');
CREATE TYPE application_status AS ENUM (
  'draft',
  'pending_payment',
  'pending_review',
  'approved',
  'rejected'
);
CREATE TYPE payment_status AS ENUM (
  'not_required',
  'unpaid',
  'pending_verification',
  'paid',
  'failed'
);
CREATE TYPE payment_method AS ENUM ('flutterwave', 'manual');
CREATE TYPE payment_record_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);
CREATE TYPE member_status AS ENUM ('active', 'lapsed', 'suspended');
CREATE TYPE member_source AS ENUM ('portal', 'csv_import', 'google_form_import');
CREATE TYPE subscription_status AS ENUM (
  'active',
  'cancelled',
  'past_due',
  'completed'
);
CREATE TYPE document_type AS ENUM (
  'photo',
  'payment_proof',
  'ahpc_certificate',
  'national_id',
  'student_id',
  'admission_letter',
  'cph_transcript',
  'a_level_slip',
  'o_level_slip'
);
CREATE TYPE uganda_region AS ENUM ('Northern', 'Eastern', 'Western', 'Central');
CREATE TYPE gender_type AS ENUM ('Male', 'Female');
CREATE TYPE sector_type AS ENUM ('private', 'public');

-- Sequence for membership numbers per year/type
CREATE TABLE membership_number_seq (
  year INT NOT NULL,
  membership_type membership_type NOT NULL,
  last_value INT NOT NULL DEFAULT 0,
  PRIMARY KEY (year, membership_type)
);

-- Applications
CREATE TABLE membership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  membership_type membership_type NOT NULL,
  status application_status NOT NULL DEFAULT 'draft',
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  membership_number TEXT UNIQUE,
  source member_source NOT NULL DEFAULT 'portal',

  -- Section A
  full_name TEXT NOT NULL,
  gender gender_type,
  date_of_birth DATE,
  nationality TEXT,
  id_number TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  physical_address TEXT,
  region uganda_region,

  -- Professional Section B
  professional_qualification TEXT,
  additional_qualification TEXT,
  ahpc_registration_number TEXT,
  practice_area TEXT,
  sector sector_type,
  government_facility_name TEXT,
  work_address TEXT,
  years_experience INT,

  -- Student Section B
  institution_name TEXT,
  programme TEXT,
  date_of_admission DATE,
  year_of_study TEXT,
  semester TEXT,
  registration_number TEXT,
  expected_completion_year INT,
  admission_criteria TEXT,

  -- Section C
  interests TEXT[] DEFAULT '{}',
  student_interests TEXT[] DEFAULT '{}',
  willing_to_participate BOOLEAN,
  participation_area TEXT,

  declaration_accepted_at TIMESTAMPTZ,

  -- Admin
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_applications_email ON membership_applications (lower(email));
CREATE INDEX idx_applications_status ON membership_applications (status);
CREATE INDEX idx_applications_user_id ON membership_applications (user_id);

-- Members (canonical after approval)
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  application_id UUID REFERENCES membership_applications(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  membership_number TEXT NOT NULL UNIQUE,
  membership_type membership_type NOT NULL,
  status member_status NOT NULL DEFAULT 'active',
  source member_source NOT NULL DEFAULT 'portal',
  legacy_registration_number TEXT,
  phone TEXT,
  ahpc_registration_number TEXT,
  current_period_start DATE,
  current_period_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_members_email ON members (lower(email));
CREATE INDEX idx_members_user_id ON members (user_id);

-- Documents
CREATE TABLE application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES membership_applications(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_application ON application_documents (application_id);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES membership_applications(id) ON DELETE SET NULL,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  method payment_method NOT NULL,
  amount_ugx INT NOT NULL DEFAULT 50000,
  currency TEXT NOT NULL DEFAULT 'UGX',
  status payment_record_status NOT NULL DEFAULT 'pending',
  flutterwave_tx_ref TEXT UNIQUE,
  flutterwave_transaction_id TEXT,
  flutterwave_status TEXT,
  is_renewal BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_application ON payments (application_id);
CREATE INDEX idx_payments_member ON payments (member_id);

-- Subscriptions
CREATE TABLE membership_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  flutterwave_subscription_id TEXT UNIQUE,
  flutterwave_plan_id TEXT,
  status subscription_status NOT NULL DEFAULT 'active',
  amount_ugx INT NOT NULL DEFAULT 50000,
  billing_interval TEXT NOT NULL DEFAULT 'yearly',
  current_period_end DATE,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email audit log
CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  template TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migration conflicts
CREATE TABLE migration_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  row_data JSONB NOT NULL,
  conflict_reason TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_applications_updated
  BEFORE UPDATE ON membership_applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER tr_members_updated
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER tr_payments_updated
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER tr_subscriptions_updated
  BEFORE UPDATE ON membership_subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Generate membership number
CREATE OR REPLACE FUNCTION generate_membership_number(p_type membership_type)
RETURNS TEXT AS $$
DECLARE
  v_year INT := EXTRACT(YEAR FROM now())::INT;
  v_next INT;
  v_prefix TEXT;
BEGIN
  INSERT INTO membership_number_seq (year, membership_type, last_value)
  VALUES (v_year, p_type, 1)
  ON CONFLICT (year, membership_type)
  DO UPDATE SET last_value = membership_number_seq.last_value + 1
  RETURNING last_value INTO v_next;

  v_prefix := CASE WHEN p_type = 'professional' THEN 'PPAU-PRO' ELSE 'PPAU-STU' END;
  RETURN v_prefix || '-' || v_year::TEXT || '-' || lpad(v_next::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Approve application: creates member row
CREATE OR REPLACE FUNCTION approve_membership_application(
  p_application_id UUID,
  p_admin_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_app membership_applications%ROWTYPE;
  v_number TEXT;
  v_member_id UUID;
  v_period_end DATE;
BEGIN
  SELECT * INTO v_app FROM membership_applications WHERE id = p_application_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_app.status = 'approved' THEN
    RETURN jsonb_build_object('already_approved', true, 'membership_number', v_app.membership_number);
  END IF;

  v_number := COALESCE(v_app.membership_number, generate_membership_number(v_app.membership_type));
  v_period_end := (CURRENT_DATE + INTERVAL '1 year')::DATE;

  UPDATE membership_applications
  SET
    status = 'approved',
    membership_number = v_number,
    reviewed_by = p_admin_id,
    reviewed_at = now(),
    updated_at = now()
  WHERE id = p_application_id;

  INSERT INTO members (
    application_id, email, full_name, membership_number, membership_type,
    status, source, phone, ahpc_registration_number,
    current_period_start, current_period_end, user_id
  )
  VALUES (
    p_application_id, v_app.email, v_app.full_name, v_number, v_app.membership_type,
    'active', v_app.source, v_app.phone, v_app.ahpc_registration_number,
    CURRENT_DATE, v_period_end, v_app.user_id
  )
  ON CONFLICT (membership_number) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    status = 'active',
    current_period_end = EXCLUDED.current_period_end,
    updated_at = now()
  RETURNING id INTO v_member_id;

  RETURN jsonb_build_object(
    'member_id', v_member_id,
    'membership_number', v_number,
    'current_period_end', v_period_end
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: check admin role from JWT
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_member()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'member',
    false
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- RLS
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_number_seq ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY admin_applications_all ON membership_applications
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY admin_documents_all ON application_documents
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY admin_payments_all ON payments
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY admin_members_all ON members
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY admin_subscriptions_all ON membership_subscriptions
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY admin_email_log ON email_log
  FOR SELECT USING (is_admin());

CREATE POLICY admin_migration_conflicts ON migration_conflicts
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Member: own data via email or user_id
CREATE POLICY member_select_own_application ON membership_applications
  FOR SELECT USING (
    is_member() AND (
      user_id = auth.uid()
      OR lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

CREATE POLICY member_select_own_documents ON application_documents
  FOR SELECT USING (
    is_member() AND application_id IN (
      SELECT id FROM membership_applications
      WHERE user_id = auth.uid()
        OR lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

CREATE POLICY member_select_own_payments ON payments
  FOR SELECT USING (
    is_member() AND (
      member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      OR application_id IN (
        SELECT id FROM membership_applications
        WHERE user_id = auth.uid()
          OR lower(email) = lower(auth.jwt() ->> 'email')
      )
    )
  );

CREATE POLICY member_select_own_member ON members
  FOR SELECT USING (is_member() AND user_id = auth.uid());

CREATE POLICY member_select_own_subscription ON membership_subscriptions
  FOR SELECT USING (
    is_member() AND member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- Anon: insert applications (draft) - limited columns via policy
CREATE POLICY anon_insert_application ON membership_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY anon_update_own_draft ON membership_applications
  FOR UPDATE USING (status = 'draft')
  WITH CHECK (status IN ('draft', 'pending_payment', 'pending_review'));

-- Storage bucket (run via storage API or dashboard)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'membership-documents',
  'membership-documents',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY storage_admin_all ON storage.objects
  FOR ALL USING (
    bucket_id = 'membership-documents' AND is_admin()
  );

CREATE POLICY storage_member_read ON storage.objects
  FOR SELECT USING (
    bucket_id = 'membership-documents'
    AND is_member()
    AND (storage.foldername(name))[1] IN (
      SELECT id::TEXT FROM membership_applications
      WHERE user_id = auth.uid()
        OR lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

CREATE POLICY storage_anon_upload ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'membership-documents');
