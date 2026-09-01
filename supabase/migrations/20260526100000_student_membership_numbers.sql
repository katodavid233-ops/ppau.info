-- Assign membership numbers to student applications that were submitted before auto-assignment
DO $$
DECLARE
  r RECORD;
  v_number TEXT;
BEGIN
  FOR r IN
    SELECT id
    FROM membership_applications
    WHERE membership_type = 'student'
      AND membership_number IS NULL
  LOOP
    v_number := generate_membership_number('student');
    UPDATE membership_applications
    SET membership_number = v_number, updated_at = now()
    WHERE id = r.id;
  END LOOP;
END $$;
