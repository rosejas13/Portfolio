-- Logging, monitoring, and metrics for Supabase production DB
-- Brings remote in sync with local schema (010_logging.sql)

-- Error log table (doesn't exist on Supabase yet)
create table if not exists internal.error_log (
  id          bigserial primary key,
  request_id  uuid,
  error_code  text,
  error_msg   text,
  context     text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_error_log_created_at on internal.error_log(created_at desc);
create index if not exists idx_error_log_request_id on internal.error_log(request_id);

grant select on internal.error_log to authenticated;

-- Request log: add missing indexes (table exists from initial migration)
create index if not exists idx_request_log_created_at on internal.request_log(created_at desc);
create index if not exists idx_request_log_path on internal.request_log(path);
create index if not exists idx_request_log_role on internal.request_log(auth_role);
create index if not exists idx_request_log_user on internal.request_log(user_id);

-- Error logger: sanitized error capture function
-- Call from exception handlers: perform internal.log_error(sqlstate, sqlerrm, 'function_name');
create or replace function internal.log_error(
  p_sqlstate text,
  p_message  text,
  p_context  text default null
)
  returns void
  language plpgsql
  set search_path to ''
as $$
declare
  safe_msg text;
begin
  safe_msg := regexp_replace(p_message, '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[EMAIL]', 'g');
  safe_msg := regexp_replace(safe_msg, 'eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+', '[JWT]', 'g');
  safe_msg := regexp_replace(safe_msg, '"email":\s*"[^"]*"', '"email":"[REDACTED]"', 'g');
  safe_msg := left(safe_msg, 1000);

  insert into internal.error_log (error_code, error_msg, context)
  values (p_sqlstate, safe_msg, p_context);
end;
$$;

-- Enhanced health check with real metrics
create or replace function api.health()
  returns jsonb
  language plpgsql stable
  security definer
  set search_path to ''
as $$
declare
  db_start        timestamptz;
  active_conns    int;
  recent_errors   int;
  last_error_at   timestamptz;
begin
  select pg_postmaster_start_time() into db_start;
  select count(*) into active_conns from pg_stat_activity where state = 'active';

  select count(*) into recent_errors
  from internal.error_log
  where created_at > now() - interval '1 hour';

  select max(created_at) into last_error_at from internal.error_log;

  return jsonb_build_object(
    'status', 'ok',
    'db_time', now(),
    'uptime_seconds', extract(epoch from now() - db_start)::int,
    'active_connections', active_conns,
    'errors_last_hour', recent_errors,
    'last_error_at', last_error_at,
    'version', '1.1.0'
  );
end;
$$;

grant execute on function api.health to anon, authenticated;

-- Metrics RPC: detailed analytics (authenticated users only)
create or replace function api.metrics()
  returns jsonb
  language plpgsql stable
  security definer
  set search_path to ''
as $$
begin
  return jsonb_build_object(
    'errors', jsonb_build_object(
      'last_hour',  (select count(*) from internal.error_log where created_at > now() - interval '1 hour'),
      'last_24h',   (select count(*) from internal.error_log where created_at > now() - interval '24 hours')
    ),
    'top_endpoints', (
      select coalesce(jsonb_agg(
        jsonb_build_object('path', path, 'count', cnt)
          order by cnt desc
      ), '[]'::jsonb)
      from (
        select path, count(*) as cnt
        from internal.request_log
        where created_at > now() - interval '24 hours'
        group by path order by cnt desc limit 10
      ) t
    ),
    'recent_errors', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'error_code', error_code,
          'error_msg',  error_msg,
          'context',    context,
          'created_at', created_at
        )
          order by created_at desc
      ), '[]'::jsonb)
      from internal.error_log
      where created_at > now() - interval '24 hours'
      order by created_at desc limit 20
    ),
    'generated_at', now()
  );
end;
$$;

grant execute on function api.metrics to authenticated;

-- Auto-cleanup for log retention
create or replace function internal.cleanup_logs()
  returns void
  language plpgsql
  set search_path to ''
as $$
begin
  delete from internal.request_log where created_at < now() - interval '90 days';
  delete from internal.error_log   where created_at < now() - interval '180 days';
end;
$$;
