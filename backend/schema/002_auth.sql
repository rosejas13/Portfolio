create table internal.users (
  id         serial primary key,
  email      text unique not null,
  name       text not null,
  avatar_url text,
  disabled   boolean not null default false,
  created_at timestamptz not null default now()
);

create table internal.credentials (
  id              serial primary key,
  user_id         int not null references internal.users(id) on delete cascade,
  credential_id   text unique not null,
  public_key      bytea not null,
  sign_count      bigint not null default 0,
  transports      jsonb,
  created_at      timestamptz not null default now()
);

create index on internal.credentials(credential_id);

-- called by PostgREST before each request
-- use for request-scoped setup
create function internal.before_request()
  returns void
  language plpgsql stable
as $$
begin
  -- reserved for future use (rate limiting, audit logging, etc.)
end;
$$;

create function internal.jwt_secret() returns text
  language plpgsql stable
as $$
begin
  return current_setting('app.jwt_secret', true);
exception when undefined_object then
  raise exception 'app.jwt_secret is not configured';
end;
$$;

create function internal.jwt_expiry() returns interval
  language plpgsql stable
as $$
begin
  return coalesce(
    current_setting('app.jwt_expiry', true)::interval,
    interval '24 hours'
  );
end;
$$;

create function internal.base64url_encode(data bytea) returns text
  language sql immutable
as $$
  select replace(replace(replace(replace(encode(data, 'base64'), chr(10), ''), '+', '-'), '/', '_'), '=', '');
$$;

create function internal.sign_jwt(payload jsonb) returns text
  language plpgsql stable
  set search_path to 'public'
as $$
declare
  header  text := internal.base64url_encode(convert_to('{"alg":"HS256","typ":"JWT"}', 'utf8'));
  payload_b64 text;
  secret  text;
  sig     text;
begin
  payload := jsonb_set(payload, '{iat}', to_jsonb(extract(epoch from now())::int));
  payload := jsonb_set(payload, '{exp}', to_jsonb(extract(epoch from now() + internal.jwt_expiry())::int));
  payload_b64 := internal.base64url_encode(convert_to(payload::text, 'utf8'));
  secret := internal.jwt_secret();
  sig := internal.base64url_encode(
    hmac(convert_to(header || '.' || payload_b64, 'utf8'), convert_to(secret, 'utf8'), 'sha256')
  );
  return header || '.' || payload_b64 || '.' || sig;
end;
$$;

create function api.login_dev()
  returns text
  language plpgsql security definer
  set search_path to ''
as $$
declare
  usr internal.users;
  token text;
begin
  if current_setting('app.dev_mode', true) <> 'true' then
    raise exception 'dev mode is disabled';
  end if;

  select * into usr from internal.users limit 1;

  if usr.id is null then
    insert into internal.users (email, name)
    values ('dev@localhost', 'Dev User')
    returning * into usr;
  end if;

  token := internal.sign_jwt(jsonb_build_object(
    'role', 'web_admin',
    'user_uuid', usr.uuid,
    'user_id', usr.id,
    'email', usr.email,
    'name', usr.name
  ));

  return token;
end;
$$;

create function api.whoami()
  returns jsonb
  language sql stable
  security definer
  set search_path to ''
as $$
  select coalesce(
    (select jsonb_object_agg(key, value)
     from jsonb_each(coalesce(current_setting('request.jwt.claims', true)::jsonb, '{"role":"anon"}'::jsonb))
     where key = any(array['role', 'user_uuid', 'name', 'email'])),
    '{"role":"anon"}'::jsonb
  );
$$;

-- grant execute on function api.login_dev to anon;  -- disabled: dev-only, not for production
grant execute on function api.whoami to anon, web_admin, web_collaborator, web_agent;
