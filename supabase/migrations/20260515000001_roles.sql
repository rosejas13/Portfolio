-- Proper role-based access for Supabase
-- First user created via Auth dashboard gets admin; all others get viewer

create table if not exists api.user_roles (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'collaborator', 'viewer')),
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table api.user_roles enable row level security;

-- Only admins can manage roles
create policy "admin_manage_roles"
  on api.user_roles for all to authenticated
  using (
    exists (
      select 1 from api.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from api.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

grant select, insert, update, delete on api.user_roles to authenticated;
grant usage on api.user_roles_id_seq to authenticated;

-- Helper function to check current user's role
create or replace function api.my_role()
  returns text
  language sql stable
  security definer
  set search_path to ''
as $$
  select role from api.user_roles where user_id = auth.uid();
$$;

grant execute on function api.my_role to authenticated;

-- Auto-assign first user as admin
-- Run this after creating your user in Auth dashboard:
-- insert into api.user_roles (user_id, role)
-- values ('<your-user-uuid>', 'admin');

-- Update RLS policies to check roles instead of blanket authenticated

drop policy if exists "auth_all_projects" on api.projects;
create policy "auth_all_projects"
  on api.projects for all to authenticated
  using (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role in ('admin', 'collaborator'))
  )
  with check (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role in ('admin', 'collaborator'))
  );

drop policy if exists "auth_all_skills" on api.skills;
create policy "auth_all_skills"
  on api.skills for all to authenticated
  using (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role in ('admin', 'collaborator'))
  )
  with check (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role in ('admin', 'collaborator'))
  );

drop policy if exists "auth_all_posts" on api.posts;
create policy "auth_all_posts"
  on api.posts for all to authenticated
  using (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role in ('admin', 'collaborator'))
  )
  with check (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role in ('admin', 'collaborator'))
  );

drop policy if exists "auth_all_experiences" on api.experiences;
create policy "auth_all_experiences"
  on api.experiences for all to authenticated
  using (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role in ('admin', 'collaborator'))
  )
  with check (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role in ('admin', 'collaborator'))
  );

drop policy if exists "auth_all_education" on api.education;
create policy "auth_all_education"
  on api.education for all to authenticated
  using (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role in ('admin', 'collaborator'))
  )
  with check (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role in ('admin', 'collaborator'))
  );

-- Leads: admins/collaborators can read/update; viewer can read only
drop policy if exists "auth_all_leads" on api.leads;
create policy "auth_read_leads"
  on api.leads for select to authenticated
  using (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role in ('admin', 'collaborator', 'viewer'))
  );

create policy "auth_manage_leads"
  on api.leads for update to authenticated
  using (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role in ('admin', 'collaborator'))
  );

create policy "auth_delete_leads"
  on api.leads for delete to authenticated
  using (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role in ('admin', 'collaborator'))
  );

-- Site config: admin only
drop policy if exists "auth_all_site_config" on api.site_config;
create policy "auth_read_site_config"
  on api.site_config for select to authenticated
  using (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role in ('admin', 'collaborator', 'viewer'))
  );

create policy "auth_manage_site_config"
  on api.site_config for all to authenticated
  using (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role = 'admin')
  );

-- Viewer gets read-only on published content
create policy "viewer_read_projects"
  on api.projects for select to authenticated
  using (
    exists (select 1 from api.user_roles where user_id = auth.uid() and role = 'viewer')
    and status = 'published'
  );
