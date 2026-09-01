-- Reset professional form config so merged code defaults apply (Section B/C updates)
UPDATE membership_form_configs
SET
  steps_config = '["Personal","Professional","Other","Documents","Declaration"]'::jsonb,
  fields_config = '[]'::jsonb,
  updated_at = now()
WHERE membership_type = 'professional';
