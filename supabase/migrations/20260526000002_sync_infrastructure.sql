-- Sync Infrastructure: register sources, track runs, enable change detection
-- See backend/schema/013_sync_infrastructure.sql for full source

create table if not exists internal.sync_sources (
  id          serial primary key,
  name        text not null unique,
  label       text not null,
  description text,
  icon        text,
  enabled     boolean not null default true,
  config      jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

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
  error_details jsonb,
  metadata      jsonb
);

create table if not exists internal.sync_state (
  id               serial primary key,
  source_id        int not null references internal.sync_sources(id) on delete cascade unique,
  last_sync_at     timestamptz,
  last_success_at  timestamptz,
  last_change_at   timestamptz,
  etag             text,
  cursor           text,
  checksum         text,
  sync_interval    interval not null default interval '1 hour',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

grant select, insert, update, delete on internal.sync_sources to web_admin;
grant select, insert, update, delete on internal.sync_runs to web_admin;
grant select, insert, update, delete on internal.sync_state to web_admin;
grant usage on internal.sync_sources_id_seq to web_admin;
grant usage on internal.sync_runs_id_seq to web_admin;
grant usage on internal.sync_state_id_seq to web_admin;

insert into internal.sync_sources (name, label, description, icon) values
  ('github', 'GitHub', 'Sync projects and repositories from GitHub', 'github'),
  ('linkedin', 'LinkedIn', 'Import work experience and education from LinkedIn', 'linkedin'),
  ('resume_upload', 'Resume Upload', 'Parse skills and experience from uploaded resume', 'file-text')
on conflict (name) do nothing;

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
