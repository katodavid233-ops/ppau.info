-- Public membership forms: allow draft applications without admin role.
-- (Edge Functions use service role; these policies cover direct client access.)

-- Insert draft applications (anonymous applicants or logged-in members, not admins-only)
DROP POLICY IF EXISTS anon_insert_application ON membership_applications;
CREATE POLICY public_insert_draft_application ON membership_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'draft');

-- Logged-in users can read/update their own in-progress draft (by email on the form)
CREATE POLICY applicant_select_own_draft ON membership_applications
  FOR SELECT
  TO authenticated
  USING (
    status = 'draft'
    AND lower(email) = lower((auth.jwt() ->> 'email'))
  );

DROP POLICY IF EXISTS anon_update_own_draft ON membership_applications;
CREATE POLICY public_update_draft_application ON membership_applications
  FOR UPDATE
  TO anon, authenticated
  USING (status = 'draft')
  WITH CHECK (status IN ('draft', 'pending_payment', 'pending_review'));

-- Admins retain full access; members must not use FOR ALL policies that block public insert
-- (admin_applications_all unchanged)
