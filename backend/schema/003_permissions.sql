-- Dynamic RBAC system
-- Permissions are data-driven and configurable at runtime via admin console

create table internal.roles (
  id          serial primary key,
  name        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

create table internal.resources (
  id          serial primary key,
  name        text not null unique,
  description text
);

create table internal.actions (
  id          serial primary key,
  name        text not null unique
);

create table internal.role_permissions (
  id          serial primary key,
  role_id     int not null references internal.roles(id) on delete cascade,
  resource_id int not null references internal.resources(id) on delete cascade,
  action_id   int not null references internal.actions(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (role_id, resource_id, action_id)
);

create table internal.user_roles (
  id         serial primary key,
  user_id    int not null references internal.users(id) on delete cascade,
  role_id    int not null references internal.roles(id) on delete cascade,
  granted_at timestamptz not null default now(),
  unique (user_id, role_id)
);

insert into internal.actions (name) values
  ('create'), ('read'), ('update'), ('delete');

insert into internal.resources (name) values
  ('projects'), ('skills'), ('leads'), ('site_config'), ('users'), ('permissions');

insert into internal.roles (name, description) values
  ('admin', 'Full access to everything'),
  ('collaborator', 'Can manage projects and skills'),
  ('agent', 'Limited automated access for Gas City agents');

-- admin gets everything
insert into internal.role_permissions (role_id, resource_id, action_id)
select r.id, res.id, a.id
from internal.roles r
cross join internal.resources res
cross join internal.actions a
where r.name = 'admin';

-- collaborator: projects + skills CRUD, leads read
insert into internal.role_permissions (role_id, resource_id, action_id)
select r.id, res.id, a.id
from internal.roles r, internal.resources res, internal.actions a
where r.name = 'collaborator'
  and res.name in ('projects', 'skills');

insert into internal.role_permissions (role_id, resource_id, action_id)
select r.id, res.id, a.id
from internal.roles r, internal.resources res, internal.actions a
where r.name = 'collaborator'
  and res.name = 'leads'
  and a.name = 'read';

-- agent: create + read projects and skills
insert into internal.role_permissions (role_id, resource_id, action_id)
select r.id, res.id, a.id
from internal.roles r, internal.resources res, internal.actions a
where r.name = 'agent'
  and res.name in ('projects', 'skills')
  and a.name in ('create', 'read');

create function internal.has_permission(resource text, action text)
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

grant execute on function internal.has_permission to web_admin, web_collaborator, web_agent;
