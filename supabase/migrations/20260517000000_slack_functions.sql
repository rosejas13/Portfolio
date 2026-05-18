-- Slack integration: lead query and deletion functions
-- These run as SECURITY DEFINER so the anon role can call them

-- Query leads for Slack /leads command
create or replace function api.list_leads(
  status_filter text default null,
  result_limit int default 5
)
returns table(
  id int,
  name text,
  email text,
  message text,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select id, name, email, message, status, created_at
  from api.leads
  where (status_filter is null or status = status_filter)
  order by created_at desc
  limit result_limit;
$$;

grant execute on function api.list_leads(text, int) to anon;
grant execute on function api.list_leads(text, int) to authenticated;

-- Delete leads by email (for GDPR deletion requests)
create or replace function api.delete_leads_by_email(target_email text)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count int;
begin
  delete from api.leads where email = target_email;
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

grant execute on function api.delete_leads_by_email(text) to anon;
grant execute on function api.delete_leads_by_email(text) to authenticated;

-- Update lead status (for Slack interactive buttons)
create or replace function api.update_lead_status(
  lead_id int,
  new_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update api.leads set status = new_status where id = lead_id;
  if not found then
    raise exception 'Lead not found';
  end if;
end;
$$;

grant execute on function api.update_lead_status(int, text) to anon;
grant execute on function api.update_lead_status(int, text) to authenticated;

-- Delete a single lead by ID (for Slack interactive buttons)
create or replace function api.delete_lead_by_id(lead_id int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from api.leads where id = lead_id;
  if not found then
    raise exception 'Lead not found';
  end if;
end;
$$;

grant execute on function api.delete_lead_by_id(int) to anon;
grant execute on function api.delete_lead_by_id(int) to authenticated;
