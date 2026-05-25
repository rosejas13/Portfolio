-- =============================================================================
-- Sync Infrastructure: register sources, track runs, enable change detection
-- =============================================================================

-- Registered sync sources (github, linkedin, resume_upload, etc.)
create table if not exists internal.sync_sources (
  id          serial primary key,
  name        text not null unique,
  label       text not null,
  description text,
  icon        text,
  enabled     boolean not null default true,
  config      jsonb,  -- source-specific config (e.g. { repo: 'org/repo', branch: 'main' })
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Sync run history: one row per sync attempt
create table if not exists internal.sync_runs (
  id            bigserial primary key,
  source_id     int not null references internal.sync_sources(id) on delete cascade,
  status        text not null default 'running'
    check (status in ('running', 'success', 'error', 'partial')),
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  duration_ms   int,
  items_synced  int not null default 0,
  items_skipped int not null default 0,
  error_count   int not null default 0,
  error_details jsonb,  -- [{ source: string, message: string }]
  metadata      jsonb   -- source-specific run metadata
);

-- Sync state: last successful sync per source (for change detection)
create table if not exists internal.sync_state (
  id               serial primary key,
  source_id        int not null references internal.sync_sources(id) on delete cascade unique,
  last_sync_at     timestamptz,
  last_success_at  timestamptz,
  last_change_at   timestamptz,  -- when source data last changed (for detection)
  etag             text,         -- HTTP ETag for conditional requests
  cursor           text,         -- pagination cursor for incremental sync
  checksum         text,         -- content hash for change detection
  sync_interval    interval not null default interval '1 hour',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_sync_runs_source on internal.sync_runs(source_id);
create index if not exists idx_sync_runs_status on internal.sync_runs(status);
create index if not exists idx_sync_runs_started on internal.sync_runs(started_at desc);

grant select, insert, update, delete on internal.sync_sources to web_admin;
grant select, insert, update, delete on internal.sync_runs to web_admin;
grant select, insert, update, delete on internal.sync_state to web_admin;
grant usage on internal.sync_sources_id_seq to web_admin;
grant usage on internal.sync_runs_id_seq to web_admin;
grant usage on internal.sync_state_id_seq to web_admin;

-- Helper: record a sync run start
create or replace function internal.start_sync(source_name text, metadata jsonb default null)
  returns int
  language plpgsql security definer set search_path to ''
as $$
declare
  src_id int;
  run_id int;
begin
  select id into src_id from internal.sync_sources where name = source_name;
  if src_id is null then
    raise exception 'unknown sync source: %', source_name;
  end if;

  insert into internal.sync_runs (source_id, metadata)
  values (src_id, metadata)
  returning id into run_id;

  return run_id;
end;
$$;

-- Helper: complete a sync run
create or replace function internal.complete_sync(
  p_run_id       int,
  p_status       text,
  p_items        int default 0,
  p_skipped      int default 0,
  p_errors       int default 0,
  p_error_details jsonb default null
)
  returns void
  language plpgsql security definer set search_path to ''
as $$
begin
  update internal.sync_runs
  set status = p_status,
      finished_at = now(),
      duration_ms = extract(epoch from (now() - started_at))::int * 1000,
      items_synced = p_items,
      items_skipped = p_skipped,
      error_count = p_errors,
      error_details = coalesce(p_error_details, error_details)
  where id = p_run_id;

  if p_status = 'success' then
    update internal.sync_state
    set last_sync_at = now(),
        last_success_at = now(),
        updated_at = now()
    where source_id = (select source_id from internal.sync_runs where id = p_run_id);
  else
    update internal.sync_state
    set last_sync_at = now(),
        updated_at = now()
    where source_id = (select source_id from internal.sync_runs where id = p_run_id);
  end if;
end;
$$;

-- Helper: update sync state after a sync
create or replace function internal.update_sync_state(
  p_source_name  text,
  p_etag         text default null,
  p_cursor       text default null,
  p_checksum     text default null,
  p_changed_at   timestamptz default null
)
  returns void
  language plpgsql security definer set search_path to ''
as $$
begin
  update internal.sync_state s
  set etag = coalesce(p_etag, etag),
      cursor = coalesce(p_cursor, cursor),
      checksum = coalesce(p_checksum, checksum),
      last_change_at = greatest(last_change_at, p_changed_at),
      last_sync_at = now(),
      updated_at = now()
  from internal.sync_sources src
  where src.id = s.source_id
    and src.name = p_source_name;

  if not found then
    insert into internal.sync_state (source_id, etag, cursor, checksum, last_change_at)
    select id, p_etag, p_cursor, p_checksum, p_changed_at
    from internal.sync_sources
    where name = p_source_name;
  end if;
end;
$$;

-- Helper: check if sync is needed (by source name)
create or replace function internal.sync_is_needed(p_source_name text)
  returns boolean
  language plpgsql stable security definer set search_path to ''
as $$
declare
  last_sync timestamptz;
  interval  interval;
begin
  select s.last_sync_at, st.sync_interval
  into last_sync, interval
  from internal.sync_sources s
  left join internal.sync_state st on st.source_id = s.id
  where s.name = p_source_name;

  return last_sync is null or last_sync + interval < now();
end;
$$;

-- Grant execute on helpers
grant execute on function internal.start_sync to web_admin;
grant execute on function internal.complete_sync to web_admin;
grant execute on function internal.update_sync_state to web_admin;
grant execute on function internal.sync_is_needed to web_admin;

-- Seed default sync sources
insert into internal.sync_sources (name, label, description, icon) values
  ('github', 'GitHub', 'Sync projects and repositories from GitHub', 'github'),
  ('linkedin', 'LinkedIn', 'Import work experience and education from LinkedIn', 'linkedin'),
  ('resume_upload', 'Resume Upload', 'Parse skills and experience from uploaded resume', 'file-text')
on conflict (name) do nothing;

-- RPC functions for admin dashboard (callable via PostgREST since internal is in extra_search_path)
create or replace function api.get_recent_syncs(max_rows int default 20)
  returns jsonb
  language sql stable security definer set search_path to ''
as $$
  select coalesce(
    (select jsonb_agg(to_jsonb(sub) order by sub.started_at desc)
     from (
       select r.*, s.label as source_name
       from internal.sync_runs r
       join internal.sync_sources s on s.id = r.source_id
       order by r.started_at desc
       limit greatest(least(max_rows, 100), 1)
     ) sub
    ),
    '[]'::jsonb
  );
$$;

create or replace function api.get_all_sync_states()
  returns jsonb
  language sql stable security definer set search_path to ''
as $$
  select coalesce(jsonb_agg(to_jsonb(st) || jsonb_build_object('source_name', s.label, 'needs_sync', st.last_sync_at is null or st.last_sync_at + st.sync_interval < now())), '[]'::jsonb)
  from internal.sync_state st
  join internal.sync_sources s on s.id = st.source_id;
$$;

grant execute on function api.get_recent_syncs to web_admin;
grant execute on function api.get_all_sync_states to web_admin;
