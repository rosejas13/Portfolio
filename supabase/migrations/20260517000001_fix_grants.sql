-- Fix sequence permissions for contact form anon inserts
-- and ensure RPC functions are properly scoped

grant usage on api.leads_id_seq to anon;

-- Restrict RPC functions to authenticated (called by API routes with anon key)
grant execute on function api.list_leads(text, int) to authenticated;
grant execute on function api.delete_leads_by_email(text) to authenticated;
grant execute on function api.update_lead_status(int, text) to authenticated;
grant execute on function api.delete_lead_by_id(int) to authenticated;
