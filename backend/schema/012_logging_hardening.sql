-- =============================================================================
-- Logging Hardening: injection prevention, IP scrubbing, auto-capture, cleanup
-- =============================================================================

-- Remove vestigial columns from error_log that are never populated
-- (detail and stack columns exist in 007_error_handling.sql but
-- internal.log_error() never writes to them)
alter table internal.error_log drop column if exists detail;
alter table internal.error_log drop column if exists stack;

-- Sanitize text for log injection prevention
-- Strips ASCII control characters (0x00-0x1F except \t, \n, \r)
-- that could be used for CRLF injection or log forging
create or replace function internal.sanitize_log(input text)
  returns text
  language sql immutable
  set search_path to ''
as $$
  select regexp_replace(input, '[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]', '', 'g');
$$;

-- Validate that a string looks like an IP address (v4 or v6)
create or replace function internal.is_valid_ip(input text)
  returns boolean
  language sql immutable
  set search_path to ''
as $$
  select input ~ '^(\d{1,3}\.){3}\d{1,3}$'
      or input ~ '^[0-9a-fA-F:]+$'
      or input = 'unknown';
$$;

-- =============================================================================
-- Updated error logger with:
--   1. IP address sanitization (regex replace)
--   2. Log injection prevention (strip control chars)
--   3. Truncation (1000 chars)
-- =============================================================================
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
  safe_msg := coalesce(p_message, '');
  safe_msg := internal.sanitize_log(safe_msg);

  -- Redact emails
  safe_msg := regexp_replace(safe_msg, '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[EMAIL]', 'g');
  -- Redact JWTs
  safe_msg := regexp_replace(safe_msg, 'eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+', '[JWT]', 'g');
  -- Redact email fields in JSON
  safe_msg := regexp_replace(safe_msg, '"email":\s*"[^"]*"', '"email":"[REDACTED]"', 'g');
  -- Redact IP addresses
  safe_msg := regexp_replace(safe_msg, '\b(\d{1,3}\.){3}\d{1,3}\b', '[IP]', 'g');
  safe_msg := regexp_replace(safe_msg, '\b[0-9a-fA-F]{4}:[0-9a-fA-F:]+(:[0-9a-fA-F]{1,4}){2,7}\b', '[IP]', 'g');

  safe_msg := left(safe_msg, 1000);

  insert into internal.error_log (error_code, error_msg, context)
  values (p_sqlstate, safe_msg, internal.sanitize_log(coalesce(p_context, '')));
end;
$$;

-- =============================================================================
-- Updated before_request() with log injection prevention on all fields
-- =============================================================================
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

  -- Validate IP format to prevent log injection via spoofed headers
  if not internal.is_valid_ip(log_ip) then
    log_ip := 'invalid';
  end if;

  log_ua := coalesce(req_headers ->> 'user-agent', 'unknown');
  log_ua := internal.sanitize_log(log_ua);
  log_ua := left(log_ua, 500);

  if req_method in ('POST', 'PATCH', 'PUT', 'DELETE') then
    begin
      insert into internal.request_log (method, path, role, user_uuid, ip_address, user_agent)
      values (
        internal.sanitize_log(req_method),
        internal.sanitize_log(coalesce(req_path, 'unknown')),
        internal.sanitize_log(log_role),
        log_uuid,
        log_ip,
        log_ua
      );
    exception when others then
      -- Silently skip if insert fails (e.g. read-only transaction)
    end;
  end if;
end;
$$;

-- =============================================================================
-- DDL event trigger: log schema changes (admin operations only)
-- Catches CREATE/ALTER/DROP on internal schema for audit trail
-- =============================================================================
create or replace function internal.log_schema_change()
  returns event_trigger
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  claims jsonb;
  log_role text;
  log_uuid uuid;
begin
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

  insert into internal.request_log (method, path, role, user_uuid, ip_address, user_agent)
  values (
    'DDL',
    tg_tag || ': ' || current_schema(),
    log_role,
    log_uuid,
    current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for',
    'internal'
  );
end;
$$;

-- =============================================================================
-- IP pseudonymization: hash IP addresses in request_log after 7 days
-- Retains audit utility (same IP always hashes to same value) while
-- preventing long-term association of specific IPs to user activity.
-- =============================================================================
create or replace function internal.pseudonymize_ips()
  returns void
  language plpgsql
  security definer
  set search_path to ''
as $$
begin
  update internal.request_log
  set ip_address = 'pseudo:' || encode(hmac(ip_address, 'ip-pseudonymization-key', 'sha256'), 'hex')
  where created_at < now() - interval '7 days'
    and ip_address is not null
    and ip_address not like 'pseudo:%';
end;
$$;

-- =============================================================================
-- pg_cron: automated log cleanup + IP pseudonymization
-- Runs daily at 3 AM UTC. Wraps in exception block so local postgres:16-alpine
-- (which lacks pg_cron) doesn't fail — skip the install and schedule manually.
-- =============================================================================
do $$
begin
  create extension if not exists pg_cron with schema pg_catalog;
  perform cron.schedule('cleanup-logs', '0 3 * * *', $$select internal.cleanup_logs()$$);
  perform cron.schedule('pseudonymize-ips', '0 4 * * *', $$select internal.pseudonymize_ips()$$);
exception when others then
  raise notice 'pg_cron not available — skipping auto-schedule. Install in postgres image or run manually:';
  raise notice '  SELECT internal.cleanup_logs();';
  raise notice '  SELECT internal.pseudonymize_ips();';
end;
$$;

-- View running cron jobs:
--   select * from cron.job;
--   select * from cron.job_run_details order by start_time desc limit 10;
-- Manual operations:
--   SELECT internal.cleanup_logs();
--   SELECT internal.pseudonymize_ips();
