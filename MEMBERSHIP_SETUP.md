# PPAU Membership Portal Setups

## 1. Supabase

1. Copy env: `cp .env.example .env.local` (or use the existing `.env.local` with `VITE_SUPABASE_*`)
2. Link project (requires `supabase login` first): `supabase link --project-ref cjshrgxpvfstjoapurph`
3. Migrations are in `supabase/migrations/` — applied to remote via MCP / SQL Editor if `db push` fails (wrong DB password or IPv6)
4. Deploy Edge Functions: `supabase functions deploy`
4. Set Edge Function secrets (Dashboard → Edge Functions → Secrets):
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET`, `FLUTTERWAVE_PLAN_ID`
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (when using Resend)
   - `APP_URL`, `MEMBERSHIP_FEE_UGX=50000`

**Email delivery:** Admin → **Email → Settings** (`/admin/email/settings`). Choose **Resend API** (secrets above) or **SMTP** (host, port, username, password saved in `email_settings`). Use **Send test email** after saving.

## 2. Flutterwave

1. Create a **yearly** subscription plan (UGX 50,000) and copy plan ID to `FLUTTERWAVE_PLAN_ID`
2. Set webhook URL to: `https://<project-ref>.supabase.co/functions/v1/flutterwave-webhook`
3. Set webhook hash secret to `FLUTTERWAVE_WEBHOOK_SECRET`

## 3. Admin users

**Seeded admin** (change password after first login):

- Email: `nakisisageorge@gmail.com`
- Temporary password: `PpauAdmin2026!Secure`
- `app_metadata.role`: `admin`

Create more admins via CLI after `supabase login`:

```bash
chmod +x supabase/seed-admin.sh
./supabase/seed-admin.sh 'YourSecurePassword'
```

Or set **app_metadata** in the dashboard (not `user_metadata`):

```json
{ "role": "admin" }
```

## 4. Frontend env

Copy `.env.example` to `.env.local` and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (new `sb_publishable_…` key — database & auth)
- `VITE_SUPABASE_ANON_KEY` (legacy `eyJ…` anon JWT — **Edge Functions** like payment if you see 401)

Dashboard → Project Settings → API → **anon public** (legacy) for the JWT value.

## 5. Legacy CSV import

- Admin UI: `/admin/migration` (after login)
- CLI: `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/migrate-legacy-members.ts`

## 6. Scheduled renewal reminders

Invoke daily via Supabase cron or external scheduler:

```
POST https://<project>.supabase.co/functions/v1/send-renewal-reminders
```

## Routes

| Path | Purpose |
|------|---------|
| `/membership-form` | Application hub |
| `/membership-form/professional` | Professional form |
| `/membership-form/student` | Student form (free) |
| `/membership-form/payment` | Payment step |
| `/member/login` | Member portal |
| `/admin/login` | Admin sign-in |
| `/admin` | **Dashboard** (stats, recent applications) |
| `/admin/applications` | All applications |
| `/admin/payments` | Payments ledger |
| `/admin/members/accepted` | Accepted members & approved applications |
| `/admin/members/rejected` | Rejected applications |
| `/admin/forms/professional` | Edit professional application form |
| `/admin/forms/student` | Edit student application form |
| `/admin/email/templates` | Email templates (welcome, reminders, etc.) |
| `/admin/email/templates/$slug` | Edit a single template |
| `/admin/email/settings` | Sender, logo (`/PPAU_logo.jpeg`), colors, reminders |
| `/admin/admins` | Admins management (requires `admin-manage-users` Edge Function) |
