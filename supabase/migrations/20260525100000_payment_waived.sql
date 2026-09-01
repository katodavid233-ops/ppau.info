-- Allow admins to record payment waived on approval
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'waived';
