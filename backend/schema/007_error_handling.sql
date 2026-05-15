create table internal.error_log (
  id          serial primary key,
  endpoint    text,
  method      text,
  role        text,
  error_code  text,
  error_msg   text,
  detail      text,
  stack       text,
  created_at  timestamptz not null default now()
);

grant select on internal.error_log to web_admin;

create or replace function internal.before_request()
  returns void
  language plpgsql
  security definer
  set search_path to ''
as $$
begin
  -- reserved for future use: audit logging, rate limiting
  -- In production, this can log request metadata
end;
$$;

create function api.health()
  returns jsonb
  language sql stable
  security definer
  set search_path to ''
as $$
  select jsonb_build_object(
    'status', 'ok',
    'db_time', now(),
    'version', '1.0.0'
  );
$$;

grant execute on function api.health to anon, web_admin, web_collaborator, web_agent;

create function api.get_site_config()
  returns jsonb
  language sql stable
  security definer
  set search_path to ''
as $$
  select jsonb_object_agg(key, value)
  from api.site_config
  where key not like 'internal.%';
$$;

grant execute on function api.get_site_config to anon;
