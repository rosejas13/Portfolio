-- Supabase-compatible schema for all-in-pg portfolio

create extension if not exists pgcrypto;

create schema if not exists api;
create schema if not exists internal;

grant usage on schema api to anon, authenticated;
grant usage on schema internal to authenticated;

-- Internal tables
create table if not exists internal.resources (
  id serial primary key,
  name text not null unique,
  description text
);

create table if not exists internal.actions (
  id serial primary key,
  name text not null unique
);

insert into internal.actions (name) values
  ('create'), ('read'), ('update'), ('delete')
on conflict (name) do nothing;

insert into internal.resources (name, description) values
  ('projects', 'Portfolio projects'),
  ('skills', 'Technical skills'),
  ('posts', 'Blog posts'),
  ('leads', 'Contact form leads'),
  ('site_config', 'Site settings'),
  ('experiences', 'Work history'),
  ('education', 'Education history')
on conflict (name) do nothing;

create table if not exists internal.request_log (
  id serial primary key,
  method text,
  path text,
  auth_role text,
  user_id uuid,
  status_code smallint,
  duration_ms int,
  created_at timestamptz not null default now()
);

grant select on internal.request_log to authenticated;

-- Helper: auto-update updated_at
create or replace function internal.set_updated_at()
  returns trigger
  language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Portfolio tables
create table if not exists api.projects (
  id serial primary key,
  title text not null check (char_length(title) <= 200),
  slug text not null unique check (char_length(slug) <= 200),
  tagline text check (char_length(tagline) <= 300),
  description text,
  tech_stack text[],
  image_url text,
  live_url text,
  repo_url text,
  start_date date,
  end_date date,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists api.skills (
  id serial primary key,
  name text not null unique check (char_length(name) <= 100),
  category text,
  icon_url text,
  sort_order int not null default 0
);

create table if not exists api.project_skills (
  project_id int not null references api.projects(id) on delete cascade,
  skill_id int not null references api.skills(id) on delete cascade,
  primary key (project_id, skill_id)
);

create table if not exists api.leads (
  id serial primary key,
  name text not null check (char_length(name) <= 200),
  email text check (char_length(email) <= 320),
  message text check (char_length(message) <= 5000),
  source text not null default 'contact_form',
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists api.site_config (
  key text primary key,
  value jsonb not null
);

create table if not exists api.posts (
  id serial primary key,
  title text not null check (char_length(title) <= 300),
  slug text not null unique check (char_length(slug) <= 200),
  content text,
  excerpt text,
  tags text[],
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists api.experiences (
  id serial primary key,
  company text not null,
  role text not null,
  location text,
  start_date date not null,
  end_date date,
  current boolean not null default false,
  description text,
  highlights text[],
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists api.education (
  id serial primary key,
  school text not null,
  degree text,
  field text,
  start_date date,
  end_date date,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Triggers
create trigger trg_projects_updated_at before update on api.projects
  for each row execute function internal.set_updated_at();
create trigger trg_posts_updated_at before update on api.posts
  for each row execute function internal.set_updated_at();
create trigger trg_experiences_updated_at before update on api.experiences
  for each row execute function internal.set_updated_at();
create trigger trg_education_updated_at before update on api.education
  for each row execute function internal.set_updated_at();

-- Seed data
insert into api.site_config (key, value) values
  ('site_title', '"My Portfolio"'),
  ('hero_tagline', '"Software Engineer"'),
  ('hero_bio', '""'),
  ('social_github', '"https://github.com/rosejas13"'),
  ('social_linkedin', '""'),
  ('social_email', '""'),
  ('theme', '"light"')
on conflict (key) do nothing;

-- Functions (after tables exist)
create or replace function api.get_site_config()
  returns jsonb
  language sql stable
  security definer
  set search_path to ''
as $$
  select jsonb_object_agg(key, value)
  from api.site_config;
$$;

grant execute on function api.get_site_config to anon, authenticated;

create or replace function api.health()
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

grant execute on function api.health to anon, authenticated;

-- Row Level Security
alter table api.projects enable row level security;
alter table api.skills enable row level security;
alter table api.project_skills enable row level security;
alter table api.leads enable row level security;
alter table api.site_config enable row level security;
alter table api.posts enable row level security;
alter table api.experiences enable row level security;
alter table api.education enable row level security;

-- Anon policies
create policy "anon_read_published_projects"
  on api.projects for select to anon using (status = 'published');

create policy "anon_read_skills"
  on api.skills for select to anon using (true);

create policy "anon_read_project_skills"
  on api.project_skills for select to anon using (true);

create policy "anon_insert_leads"
  on api.leads for insert to anon
  with check (source = 'contact_form' and status = 'new');

create policy "anon_read_published_posts"
  on api.posts for select to anon using (status = 'published');

create policy "anon_read_experiences"
  on api.experiences for select to anon using (true);

create policy "anon_read_education"
  on api.education for select to anon using (true);

-- Authenticated policies
create policy "auth_all_projects"
  on api.projects for all to authenticated using (true) with check (true);

create policy "auth_all_skills"
  on api.skills for all to authenticated using (true) with check (true);

create policy "auth_all_project_skills"
  on api.project_skills for all to authenticated using (true) with check (true);

create policy "auth_all_leads"
  on api.leads for all to authenticated using (true) with check (true);

create policy "auth_all_posts"
  on api.posts for all to authenticated using (true) with check (true);

create policy "auth_all_experiences"
  on api.experiences for all to authenticated using (true) with check (true);

create policy "auth_all_education"
  on api.education for all to authenticated using (true) with check (true);

create policy "auth_all_site_config"
  on api.site_config for all to authenticated using (true) with check (true);
