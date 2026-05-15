-- UUID columns: prevent sequential ID enumeration by external users
-- Each public-facing table gets a UUID alongside its serial primary key.
-- The serial ID is used internally; external references should use uuid.

alter table internal.users add column if not exists uuid uuid not null default gen_random_uuid();
create unique index if not exists idx_users_uuid on internal.users(uuid);

alter table api.projects add column if not exists uuid uuid not null default gen_random_uuid();
create unique index if not exists idx_projects_uuid on api.projects(uuid);

alter table api.posts add column if not exists uuid uuid not null default gen_random_uuid();
create unique index if not exists idx_posts_uuid on api.posts(uuid);

alter table api.leads add column if not exists uuid uuid not null default gen_random_uuid();
create unique index if not exists idx_leads_uuid on api.leads(uuid);

-- ==========================================================================
-- Input validation: column constraints
-- These prevent oversized or malformed data from reaching the database.
-- PostgREST parameterizes all queries, so SQL injection is not a concern.
-- ==========================================================================

-- Text length limits
alter table api.projects add constraint if not exists chk_title_len check (char_length(title) <= 200);
alter table api.projects add constraint if not exists chk_slug_len check (char_length(slug) <= 200);
alter table api.projects add constraint if not exists chk_tagline_len check (char_length(tagline) <= 300);
alter table api.projects add constraint if not exists chk_project_title_not_empty check (char_length(trim(title)) > 0);

alter table api.posts add constraint if not exists chk_post_title_len check (char_length(title) <= 300);
alter table api.posts add constraint if not exists chk_post_slug_len check (char_length(slug) <= 200);
alter table api.posts add constraint if not exists chk_post_title_not_empty check (char_length(trim(title)) > 0);

alter table api.leads add constraint if not exists chk_lead_name_len check (char_length(name) <= 200);
alter table api.leads add constraint if not exists chk_lead_email_len check (char_length(email) <= 320);
alter table api.leads add constraint if not exists chk_lead_msg_len check (char_length(message) <= 5000);
alter table api.leads add constraint if not exists chk_lead_name_not_empty check (char_length(trim(name)) > 0);

alter table api.skills add constraint if not exists chk_skill_name_len check (char_length(name) <= 100);

alter table api.experiences add constraint if not exists chk_exp_company_not_empty check (char_length(trim(company)) > 0);
alter table api.experiences add constraint if not exists chk_exp_role_not_empty check (char_length(trim(role)) > 0);

-- Format validation
alter table api.leads add constraint if not exists chk_lead_email_format
  check (email is null or email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');

create or replace function internal.is_valid_url(url text) returns boolean
  language sql immutable set search_path to ''
as $$
  select url is null or url ~* '^https?://[^\s/$.?#].[^\s]*$';
$$;

alter table api.projects add constraint if not exists chk_project_live_url check (internal.is_valid_url(live_url));
alter table api.projects add constraint if not exists chk_project_repo_url check (internal.is_valid_url(repo_url));
alter table api.projects add constraint if not exists chk_project_image_url check (internal.is_valid_url(image_url));

-- Slug format: lowercase alphanumeric with hyphens only (no spaces, no special chars)
alter table api.projects add constraint if not exists chk_project_slug_format
  check (slug ~* '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table api.posts add constraint if not exists chk_post_slug_format
  check (slug ~* '^[a-z0-9]+(-[a-z0-9]+)*$');
