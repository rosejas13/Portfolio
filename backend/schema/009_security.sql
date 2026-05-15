-- UUIDs for user identification (prevent enumeration)
alter table internal.users add column if not exists uuid uuid not null default gen_random_uuid();
create unique index if not exists idx_users_uuid on internal.users(uuid);

-- UUIDs for public-facing resources
alter table api.projects add column if not exists uuid uuid not null default gen_random_uuid();
create unique index if not exists idx_projects_uuid on api.projects(uuid);

alter table api.posts add column if not exists uuid uuid not null default gen_random_uuid();
create unique index if not exists idx_posts_uuid on api.posts(uuid);

alter table api.leads add column if not exists uuid uuid not null default gen_random_uuid();
create unique index if not exists idx_leads_uuid on api.leads(uuid);

-- Input validation: length limits on text columns
alter table api.projects add constraint chk_title_len check (char_length(title) <= 200);
alter table api.projects add constraint chk_slug_len check (char_length(slug) <= 200);
alter table api.projects add constraint chk_tagline_len check (char_length(tagline) <= 300);

alter table api.posts add constraint chk_post_title_len check (char_length(title) <= 300);
alter table api.posts add constraint chk_post_slug_len check (char_length(slug) <= 200);

alter table api.leads add constraint chk_lead_name_len check (char_length(name) <= 200);
alter table api.leads add constraint chk_lead_email_len check (char_length(email) <= 320);
alter table api.leads add constraint chk_lead_msg_len check (char_length(message) <= 5000);

alter table api.skills add constraint chk_skill_name_len check (char_length(name) <= 100);

-- Request logging
create table if not exists internal.request_log (
  id          serial primary key,
  method      text,
  path        text,
  role        text,
  user_uuid   uuid,
  ip_address  text,
  status_code smallint,
  duration_ms int,
  created_at  timestamptz not null default now()
);

grant select on internal.request_log to web_admin;

-- Clean response: return only requested fields, no DB internals
create function internal.safe_json(data jsonb, allowed_keys text[])
  returns jsonb
  language sql immutable
  set search_path to ''
as $$
  select coalesce(
    (select jsonb_object_agg(key, value) from jsonb_each(data) where key = any(allowed_keys)),
    '{}'::jsonb
  );
$$;

-- Update has_permission to use UUID
create or replace function internal.has_permission(resource text, action text)
  returns boolean
  language plpgsql stable
  security definer
  set search_path to ''
as $$
declare
  claims jsonb;
  user_uuid text;
begin
  claims := current_setting('request.jwt.claims', true)::jsonb;
  if claims is null then return false; end if;

  user_uuid := claims ->> 'user_uuid';
  if user_uuid is null then return false; end if;

  return exists (
    select 1
    from internal.user_roles ur
    join internal.users u on u.id = ur.user_id
    join internal.role_permissions rp on rp.role_id = ur.role_id
    join internal.resources res on res.id = rp.resource_id
    join internal.actions a on a.id = rp.action_id
    where u.uuid = user_uuid::uuid
      and res.name = has_permission.resource
      and a.name = has_permission.action
  );
end;
$$;

-- Update login_dev to use UUID
create or replace function api.login_dev()
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

-- Updated whoami - expose only what the client needs
create or replace function api.whoami()
  returns jsonb
  language sql stable
  security definer
  set search_path to ''
as $$
  select internal.safe_json(
    coalesce(
      current_setting('request.jwt.claims', true)::jsonb,
      '{"role":"anon"}'::jsonb
    ),
    array['role', 'user_uuid', 'name', 'email']
  );
$$;
