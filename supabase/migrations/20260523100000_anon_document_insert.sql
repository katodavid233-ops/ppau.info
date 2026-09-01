-- Allow anonymous applicants to register uploaded document metadata
CREATE POLICY anon_insert_documents ON application_documents
  FOR INSERT
  WITH CHECK (true);
