-- Public directory: active members only (no email exposed in app queries)
CREATE POLICY public_read_active_members ON members
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');
