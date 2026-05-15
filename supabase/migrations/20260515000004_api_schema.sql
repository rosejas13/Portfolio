-- Expose the api schema to PostgREST so SSR pages can call our functions.
-- By default, Supabase PostgREST only exposes the public schema.
-- Our tables and RPC functions live in the api schema.

ALTER ROLE authenticator SET pgrst.db_schemas TO 'public, api';

NOTIFY pgrst, 'reload';
