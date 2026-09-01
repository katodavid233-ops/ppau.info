#!/usr/bin/env bash
# Create admin via Supabase CLI (requires: supabase login && supabase link)
# Usage: ./supabase/seed-admin.sh [password]
set -euo pipefail
EMAIL="${ADMIN_EMAIL:-nakisisageorge@gmail.com}"
PASSWORD="${1:-PpauAdmin2026!Secure}"

supabase auth admin create-user \
  --email "$EMAIL" \
  --password "$PASSWORD" \
  --email-confirm \
  --app-metadata '{"role":"admin"}'

echo "Admin created: $EMAIL"
