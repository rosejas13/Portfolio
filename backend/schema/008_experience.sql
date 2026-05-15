insert into internal.resources (name, description)
values ('experiences', 'Work experience history'), ('education', 'Education history')
on conflict (name) do nothing;

insert into internal.role_permissions (role_id, resource_id, action_id)
select r.id, res.id, a.id
from internal.roles r, internal.resources res, internal.actions a
where r.name = 'admin'
  and res.name in ('experiences', 'education');

insert into internal.role_permissions (role_id, resource_id, action_id)
select r.id, res.id, a.id
from internal.roles r, internal.resources res, internal.actions a
where r.name = 'collaborator'
  and res.name in ('experiences', 'education')
  and a.name in ('create', 'read', 'update');

insert into internal.role_permissions (role_id, resource_id, action_id)
select r.id, res.id, a.id
from internal.roles r, internal.resources res, internal.actions a
where r.name = 'agent'
  and res.name in ('experiences', 'education')
  and a.name in ('create', 'read');

create table api.experiences (
  id          serial primary key,
  company     text not null,
  role        text not null,
  location    text,
  start_date  date not null,
  end_date    date,
  current     boolean not null default false,
  description text,
  highlights  text[],
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table api.education (
  id          serial primary key,
  school      text not null,
  degree      text,
  field       text,
  start_date  date,
  end_date    date,
  description text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

grant select on api.experiences to anon;
grant select on api.education to anon;
grant select, insert, update, delete on api.experiences to web_admin, web_collaborator, web_agent;
grant select, insert, update, delete on api.education to web_admin, web_collaborator, web_agent;
grant usage on api.experiences_id_seq to web_admin, web_collaborator, web_agent;
grant usage on api.education_id_seq to web_admin, web_collaborator, web_agent;

alter table api.experiences enable row level security;
alter table api.education enable row level security;

create policy anon_read_experiences
  on api.experiences for select to anon using (true);

create policy anon_read_education
  on api.education for select to anon using (true);

create policy rbac_experiences
  on api.experiences for all to web_admin, web_collaborator, web_agent
  using (internal.has_permission('experiences', 'read'))
  with check (internal.has_permission('experiences', 'create')
    or internal.has_permission('experiences', 'update'));

create policy rbac_education
  on api.education for all to web_admin, web_collaborator, web_agent
  using (internal.has_permission('education', 'read'))
  with check (internal.has_permission('education', 'create')
    or internal.has_permission('education', 'update'));

create trigger trg_experiences_updated_at
  before update on api.experiences
  for each row execute function internal.set_updated_at();

create trigger trg_education_updated_at
  before update on api.education
  for each row execute function internal.set_updated_at();
