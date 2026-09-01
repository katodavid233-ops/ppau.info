-- Enable pg_cron extension if not already enabled
create extension if not exists pg_cron with schema pg_catalog;

-- Schedule daily cleanup of draft applications older than 24 hours
select
  cron.schedule(
    'cleanup-drafts',
    '0 3 * * *',
    $$
    select
      net.http_post(
        url := current_setting('app.settings.functions_base_url') || '/cleanup-drafts',
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body := '{}'
      ) as req_id;
    $$
  );

-- Also delete stale drafts directly as a safety net
delete from membership_applications
where status = 'draft'
  and created_at < now() - interval '24 hours';
