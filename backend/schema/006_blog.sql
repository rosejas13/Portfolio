insert into internal.resources (name, description)
values ('posts', 'Blog posts')
on conflict (name) do nothing;

insert into internal.role_permissions (role_id, resource_id, action_id)
select r.id, res.id, a.id
from internal.roles r, internal.resources res, internal.actions a
where r.name = 'admin'
  and res.name = 'posts';

insert into internal.role_permissions (role_id, resource_id, action_id)
select r.id, res.id, a.id
from internal.roles r, internal.resources res, internal.actions a
where r.name = 'collaborator'
  and res.name = 'posts'
  and a.name in ('create', 'read', 'update');

insert into internal.role_permissions (role_id, resource_id, action_id)
select r.id, res.id, a.id
from internal.roles r, internal.resources res, internal.actions a
where r.name = 'agent'
  and res.name = 'posts'
  and a.name in ('create', 'read');

create table api.posts (
  id           serial primary key,
  title        text not null,
  slug         text not null unique,
  content      text,
  excerpt      text,
  tags         text[],
  status       text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

grant select on api.posts to anon;
grant select, insert, update, delete on api.posts to web_admin, web_collaborator, web_agent;
grant usage on api.posts_id_seq to web_admin, web_collaborator, web_agent;

alter table api.posts enable row level security;

create policy anon_read_published_posts
  on api.posts for select to anon
  using (status = 'published');

create policy anon_read_archived_posts
  on api.posts for select to anon
  using (status = 'archived');

create policy rbac_posts
  on api.posts for all to web_admin, web_collaborator, web_agent
  using (internal.has_permission('posts', 'read'))
  with check (internal.has_permission('posts', 'create')
    or internal.has_permission('posts', 'update'));

create trigger trg_posts_updated_at
  before update on api.posts
  for each row execute function internal.set_updated_at();
