create table api.projects (
  id          serial primary key,
  title       text not null,
  slug        text not null unique,
  tagline     text,
  description text,
  tech_stack  text[],
  image_url   text,
  live_url    text,
  repo_url    text,
  start_date  date,
  end_date    date,
  status      text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table api.skills (
  id          serial primary key,
  name        text not null unique,
  category    text,
  icon_url    text,
  sort_order  int not null default 0
);

create table api.project_skills (
  project_id int not null references api.projects(id) on delete cascade,
  skill_id   int not null references api.skills(id) on delete cascade,
  primary key (project_id, skill_id)
);

create table api.leads (
  id          serial primary key,
  name        text not null,
  email       text,
  message     text,
  source      text not null default 'contact_form',
  status      text not null default 'new'
    check (status in ('new', 'read', 'replied', 'archived')),
  notes       text,
  created_at  timestamptz not null default now()
);

create table api.site_config (
  key   text primary key,
  value jsonb not null
);

-- seed default site config
insert into api.site_config (key, value) values
  ('site_title', '"My Portfolio"'),
  ('hero_tagline', '"Full-Stack Developer"'),
  ('hero_bio', '""'),
  ('social_github', '""'),
  ('social_linkedin', '""'),
  ('social_email', '""'),
  ('theme', '"light"');

-- grants
grant select on api.projects to anon;
grant select on api.skills to anon;
grant select on api.project_skills to anon;
grant insert on api.leads to anon;
grant usage on api.leads_id_seq to anon;

grant select, insert, update, delete on all tables in schema api to web_admin, web_collaborator, web_agent;
grant usage on all sequences in schema api to web_admin, web_collaborator, web_agent;

-- RLS

alter table api.projects enable row level security;
alter table api.skills enable row level security;
alter table api.project_skills enable row level security;
alter table api.leads enable row level security;
alter table api.site_config enable row level security;

-- anon: read published projects + skills, insert leads
create policy anon_read_published_projects
  on api.projects for select to anon
  using (status = 'published');

create policy anon_read_skills
  on api.skills for select to anon
  using (true);

create policy anon_read_project_skills
  on api.project_skills for select to anon
  using (true);

create policy anon_insert_leads
  on api.leads for insert to anon
  with check (source = 'contact_form' and status = 'new');

-- no anon access to site_config table — use api.get_site_config() instead

-- web roles: dynamic RBAC via internal.has_permission

create policy rbac_projects
  on api.projects for all to web_admin, web_collaborator, web_agent
  using (internal.has_permission('projects', 'read'))
  with check (internal.has_permission('projects', 'create')
    or internal.has_permission('projects', 'update'));

create policy rbac_skills
  on api.skills for all to web_admin, web_collaborator, web_agent
  using (internal.has_permission('skills', 'read'))
  with check (internal.has_permission('skills', 'create')
    or internal.has_permission('skills', 'update'));

create policy rbac_project_skills
  on api.project_skills for all to web_admin, web_collaborator, web_agent
  using (true)
  with check (internal.has_permission('projects', 'update'));

create policy rbac_leads
  on api.leads for all to web_admin, web_collaborator, web_agent
  using (internal.has_permission('leads', 'read'))
  with check (internal.has_permission('leads', 'create')
    or internal.has_permission('leads', 'update'));

create policy rbac_site_config
  on api.site_config for all to web_admin, web_collaborator, web_agent
  using (internal.has_permission('site_config', 'read'))
  with check (internal.has_permission('site_config', 'update'));

-- auto-update updated_at
create or replace function internal.set_updated_at()
  returns trigger
  language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_projects_updated_at
  before update on api.projects
  for each row execute function internal.set_updated_at();
