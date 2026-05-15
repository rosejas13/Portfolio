-- Simplify: use auth.users.app_metadata for roles instead of a separate table

-- Drop the user_roles table and its policies
drop table if exists api.user_roles cascade;

-- Helper to check current user's role from JWT app_metadata
create or replace function api.my_role()
  returns text
  language sql stable
  set search_path to ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'viewer');
$$;

grant execute on function api.my_role to authenticated;

-- Recreate RLS policies using app_metadata instead of user_roles table

drop policy if exists "admin_manage_roles" on api.site_config;
drop policy if exists "auth_all_projects" on api.projects;
drop policy if exists "auth_all_skills" on api.skills;
drop policy if exists "auth_all_posts" on api.posts;
drop policy if exists "auth_all_experiences" on api.experiences;
drop policy if exists "auth_all_education" on api.education;
drop policy if exists "auth_read_leads" on api.leads;
drop policy if exists "auth_manage_leads" on api.leads;
drop policy if exists "auth_delete_leads" on api.leads;
drop policy if exists "auth_read_site_config" on api.site_config;
drop policy if exists "auth_manage_site_config" on api.site_config;
drop policy if exists "viewer_read_projects" on api.projects;

-- Admins + collaborators: CRUD on content
create policy "role_crud_content"
  on api.projects for all to authenticated
  using (api.my_role() in ('admin', 'collaborator'))
  with check (api.my_role() in ('admin', 'collaborator'));

create policy "role_crud_skills"
  on api.skills for all to authenticated
  using (api.my_role() in ('admin', 'collaborator'))
  with check (api.my_role() in ('admin', 'collaborator'));

create policy "role_crud_posts"
  on api.posts for all to authenticated
  using (api.my_role() in ('admin', 'collaborator'))
  with check (api.my_role() in ('admin', 'collaborator'));

create policy "role_crud_experiences"
  on api.experiences for all to authenticated
  using (api.my_role() in ('admin', 'collaborator'))
  with check (api.my_role() in ('admin', 'collaborator'));

create policy "role_crud_education"
  on api.education for all to authenticated
  using (api.my_role() in ('admin', 'collaborator'))
  with check (api.my_role() in ('admin', 'collaborator'));

-- Leads: admins + collaborators can read/update; admin only for delete
create policy "role_read_leads"
  on api.leads for select to authenticated
  using (api.my_role() in ('admin', 'collaborator', 'viewer'));

create policy "role_update_leads"
  on api.leads for update to authenticated
  using (api.my_role() in ('admin', 'collaborator'));

create policy "role_delete_leads"
  on api.leads for delete to authenticated
  using (api.my_role() = 'admin');

-- Site config: admin only
create policy "role_read_config"
  on api.site_config for select to authenticated
  using (api.my_role() in ('admin', 'collaborator', 'viewer'));

create policy "role_write_config"
  on api.site_config for all to authenticated
  using (api.my_role() = 'admin')
  with check (api.my_role() = 'admin');

-- Viewer: read-only published content
create policy "viewer_read_published"
  on api.projects for select to authenticated
  using (api.my_role() = 'viewer' and status = 'published');
