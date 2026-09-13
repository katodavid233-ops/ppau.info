-- Fix storage.buckets RLS: allow anon/member to SELECT the membership-documents bucket
-- so direct sb.storage.upload() and createSignedUploadUrl() work in the browser.
CREATE POLICY "bucket_anon_read" ON storage.buckets
  FOR SELECT
  USING (id = 'membership-documents');

-- Admin full access on buckets (create/alter if needed later)
CREATE POLICY "bucket_admin_all" ON storage.buckets
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Normalize the corrupt professional documents_config {Count,value} wrapper -> plain array
UPDATE public.membership_form_configs
SET documents_config = COALESCE(
  (SELECT jsonb_agg(elem)
   FROM jsonb_array_elements(documents_config->'value') AS elem),
  documents_config
)
WHERE membership_type = 'professional'
  AND documents_config ? 'value';
