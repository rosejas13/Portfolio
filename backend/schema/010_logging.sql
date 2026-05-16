-- ==========================================================================
-- Request & Error Logging — populates the audit trail
-- Writes to internal.request_log on every API call.
-- Writes to internal.error_log on any DB-level exception.
-- ==========================================================================

-- Request log: one row per API call, written before the query executes.
-- Status code and duration are captured by Caddy's access log (JSON).
-- Correlate via timestamp + path + method + ip.
create table if not exists internal.request_log (
  id          bigserial primary key,
  request_id  uuid not null default gen_random_uuid(),
  method      text not null,
  path        text not null,
  role        text not null,
  user_uuid   uuid,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_request_log_created_at on internal.request_log(created_at desc);
create index if not exists idx_request_log_path on internal.request_log(path);
create index if not exists idx_request_log_role on internal.request_log(role);
create index if not exists idx_request_log_ip on internal.request_log(ip_address);

grant select on internal.request_log to web_admin;

-- Error log: captures exception details when DB operations fail.
-- Error messages are sanitized — no PII, no raw data.
-- Table created by 007_error_handling.sql — migrate columns for v010.
alter table internal.error_log add column if not exists request_id uuid;
alter table internal.error_log add column if not exists context text;

create index if not exists idx_error_log_created_at on internal.error_log(created_at desc);
create index if not exists idx_error_log_request_id on internal.error_log(request_id);

grant select on internal.error_log to web_admin;

-- ==========================================================================
-- Request logger: called by PostgREST before every request.
-- PostgREST sets request-scoped GUCs (method, path, headers, jwt.claims).
-- We extract only metadata — never request bodies or tokens.
-- ==========================================================================
create or replace function internal.before_request()
  returns void
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  req_method text;
  req_path   text;
  req_headers jsonb;
  claims     jsonb;
  log_role   text;
  log_uuid   uuid;
  log_ip     text;
  log_ua     text;
begin
  req_method := current_setting('request.method', true);
  req_path   := current_setting('request.path', true);

  begin
    req_headers := current_setting('request.headers', true)::jsonb;
  exception when others then
    req_headers := '{}'::jsonb;
  end;

  begin
    claims := current_setting('request.jwt.claims', true)::jsonb;
    log_role := coalesce(claims ->> 'role', 'anon');

    begin
      log_uuid := (claims ->> 'user_uuid')::uuid;
    exception when others then
      log_uuid := null;
    end;
  exception when others then
    log_role := 'anon';
    log_uuid := null;
  end;

  log_ip := coalesce(
    req_headers ->> 'x-forwarded-for',
    req_headers ->> 'x-real-ip',
    'unknown'
  );
  log_ua := coalesce(req_headers ->> 'user-agent', 'unknown');
  log_ua := left(log_ua, 500);

  -- Writes (INSERT/UPDATE/DELETE) run in read-write transactions,
  -- reads (GET) run in read-only. Only log write requests to the DB.
  -- Caddy's access log captures all requests including reads.
  if req_method in ('POST', 'PATCH', 'PUT', 'DELETE') then
    begin
      insert into internal.request_log (method, path, role, user_uuid, ip_address, user_agent)
      values (req_method, req_path, log_role, log_uuid, log_ip, log_ua);
    exception when others then
      -- Silently skip if insert fails (e.g. read-only transaction)
    end;
  end if;
end;
$$;

-- ==========================================================================
-- Error logger: call from exception handlers in triggers and functions.
-- Usage: perform internal.log_error(sqlstate, sqlerrm, 'function_name');
-- ==========================================================================
create or replace function internal.log_error(
  p_sqlstate text,
  p_message  text,
  p_context  text default null
)
  returns void
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  safe_msg text;
begin
  -- Sanitize: redact anything that looks like an email, token, or raw data
  safe_msg := regexp_replace(p_message, '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[EMAIL]', 'g');
  safe_msg := regexp_replace(safe_msg, 'eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+', '[JWT]', 'g');
  safe_msg := regexp_replace(safe_msg, '"email":\s*"[^"]*"', '"email":"[REDACTED]"', 'g');

  -- Truncate to prevent log abuse
  safe_msg := left(safe_msg, 1000);

  insert into internal.error_log (error_code, error_msg, context)
  values (p_sqlstate, safe_msg, p_context);
end;
$$;

-- ==========================================================================
-- Health check with real metrics (no secrets, no PII)
-- Public endpoint for uptime monitoring.
-- ==========================================================================
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
  recent_requests int;
  last_error_at   timestamptz;
begin
  -- When did the DB start? (PostgreSQL tracks this)
  select pg_postmaster_start_time() into db_start;

  -- Active connections
  select count(*) into active_conns from pg_stat_activity where state = 'active';

  -- Errors in last hour
  select count(*) into recent_errors
  from internal.error_log
  where created_at > now() - interval '1 hour';

  -- Requests in last hour
  select count(*) into recent_requests
  from internal.request_log
  where created_at > now() - interval '1 hour';

  -- Last error time
  select max(created_at) into last_error_at
  from internal.error_log;

  return jsonb_build_object(
    'status', 'ok',
    'db_time', now(),
    'uptime_seconds', extract(epoch from now() - db_start)::int,
    'active_connections', active_conns,
    'requests_last_hour', recent_requests,
    'errors_last_hour', recent_errors,
    'last_error_at', last_error_at,
    'version', '1.1.0'
  );
end;
$$;

grant execute on function api.health to anon, web_admin, web_collaborator, web_agent;

-- ==========================================================================
-- Metrics endpoint (admin only) — detailed analytics for the dashboard
-- ==========================================================================
create or replace function api.metrics()
  returns jsonb
  language plpgsql stable
  security definer
  set search_path to ''
as $$
declare
  claims     jsonb;
  log_role   text;
begin
  -- Only admins can see metrics
  claims := current_setting('request.jwt.claims', true)::jsonb;
  log_role := coalesce(claims ->> 'role', 'anon');
  if log_role <> 'web_admin' then
    raise exception 'Unauthorized';
  end if;

  return jsonb_build_object(
    'requests', jsonb_build_object(
      'last_hour',  (select count(*) from internal.request_log where created_at > now() - interval '1 hour'),
      'last_24h',   (select count(*) from internal.request_log where created_at > now() - interval '24 hours'),
      'last_7d',    (select count(*) from internal.request_log where created_at > now() - interval '7 days')
    ),
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
        group by path
        order by cnt desc
        limit 10
      ) t
    ),
    'roles_breakdown', (
      select coalesce(jsonb_object_agg(role, cnt), '{}'::jsonb)
      from (
        select role, count(*) as cnt
        from internal.request_log
        where created_at > now() - interval '24 hours'
        group by role
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
      order by created_at desc
      limit 20
    ),
    'generated_at', now()
  );
end;
$$;

grant execute on function api.metrics to web_admin, web_agent;

-- ==========================================================================
-- Data retention: auto-cleanup of old log entries
-- Keeps 90 days of request logs, 180 days of error logs.
-- ==========================================================================
create or replace function internal.cleanup_logs()
  returns void
  language plpgsql
  security definer
  set search_path to ''
as $$
begin
  delete from internal.request_log where created_at < now() - interval '90 days';
  delete from internal.error_log   where created_at < now() - interval '180 days';
end;
$$;
