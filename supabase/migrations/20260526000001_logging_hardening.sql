-- Logging Hardening: injection prevention, IP scrubbing, auto-capture, cleanup
-- See backend/schema/012_logging_hardening.sql for the full source

alter table internal.error_log drop column if exists detail;
alter table internal.error_log drop column if exists stack;

create or replace function internal.sanitize_log(input text)
  returns text
  language sql immutable
  set search_path to ''
as $$
  select regexp_replace(input, '[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]', '', 'g');
$$;

create or replace function internal.is_valid_ip(input text)
  returns boolean
  language sql immutable
  set search_path to ''
as $$
  select input ~ '^(\d{1,3}\.){3}\d{1,3}$'
      or input ~ '^[0-9a-fA-F:]+$'
      or input = 'unknown';
$$;

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
  safe_msg := regexp_replace(safe_msg, '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[EMAIL]', 'g');
  safe_msg := regexp_replace(safe_msg, 'eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+', '[JWT]', 'g');
  safe_msg := regexp_replace(safe_msg, '"email":\s*"[^"]*"', '"email":"[REDACTED]"', 'g');
  safe_msg := regexp_replace(safe_msg, '\b(\d{1,3}\.){3}\d{1,3}\b', '[IP]', 'g');
  safe_msg := regexp_replace(safe_msg, '\b[0-9a-fA-F]{4}:[0-9a-fA-F:]+(:[0-9a-fA-F]{1,4}){2,7}\b', '[IP]', 'g');
  safe_msg := left(safe_msg, 1000);
  insert into internal.error_log (error_code, error_msg, context)
  values (p_sqlstate, safe_msg, internal.sanitize_log(coalesce(p_context, '')));
end;
$$;

-- Updated before_request with IP validation + log injection prevention
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
  log_ip := coalesce(req_headers ->> 'x-forwarded-for', req_headers ->> 'x-real-ip', 'unknown');
  if not internal.is_valid_ip(log_ip) then log_ip := 'invalid'; end if;
  log_ua := coalesce(req_headers ->> 'user-agent', 'unknown');
  log_ua := internal.sanitize_log(log_ua);
  log_ua := left(log_ua, 500);
  if req_method in ('POST', 'PATCH', 'PUT', 'DELETE') then
    begin
      insert into internal.request_log (method, path, role, user_uuid, ip_address, user_agent)
      values (internal.sanitize_log(req_method), internal.sanitize_log(coalesce(req_path, 'unknown')),
              internal.sanitize_log(log_role), log_uuid, log_ip, log_ua);
    exception when others then end;
  end if;
end;
$$;

-- IP pseudonymization: hash IPs after 7 days
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

-- DDL event trigger for schema change audit
create or replace function internal.log_schema_change()
  returns event_trigger
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  claims jsonb; log_role text; log_uuid uuid;
begin
  begin
    claims := current_setting('request.jwt.claims', true)::jsonb;
    log_role := coalesce(claims ->> 'role', 'anon');
    begin log_uuid := (claims ->> 'user_uuid')::uuid; exception when others then log_uuid := null; end;
  exception when others then
    log_role := 'anon'; log_uuid := null;
  end;
  insert into internal.request_log (method, path, role, user_uuid, ip_address, user_agent)
  values ('DDL', tg_tag || ': ' || current_schema(), log_role, log_uuid, 'schema', 'internal');
end;
$$;
