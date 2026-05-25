-- Create custom roles for RBAC
-- These are created in backend/schema/001_init.sql but that file isn't a supabase migration
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'web_admin') then
    create role web_admin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'web_agent') then
    create role web_agent noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'web_collaborator') then
    create role web_collaborator noinherit;
  end if;
end;
$$;
