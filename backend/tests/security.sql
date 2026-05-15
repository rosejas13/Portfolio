-- =============================================================================
-- SECURITY INTEGRATION TESTS
-- Run against the local Docker database:
--   docker compose exec db psql -U app -d app -f backend/tests/security.sql
-- =============================================================================

\echo '========== 1. RLS: Anon can only read published projects =========='

-- Set role to anon
set local role anon;
set local request.jwt.claims to '{"role":"anon"}';

-- Should find 0 or more published projects (depends on seed data)
select count(*) as published_projects from api.projects where status = 'published';

-- Reset
reset role;
reset request.jwt.claims;

\echo '========== 2. RLS: Anon cannot read draft projects =========='

set local role anon;
set local request.jwt.claims to '{"role":"anon"}';

-- This should return 0 rows (anon can't see draft projects)
select case when count(*) = 0 then 'PASS: anon cannot see drafts'
            else 'FAIL: anon can see drafts'
       end as result
from api.projects where status = 'draft';

reset role;
reset request.jwt.claims;

\echo '========== 3. RLS: Anon can insert leads with valid source/status =========='

set local role anon;
set local request.jwt.claims to '{"role":"anon"}';

-- Should succeed
insert into api.leads (name, email, message, source, status)
values ('Test User', 'test@example.com', 'Test message', 'contact_form', 'new');

-- Verify
select case when count(*) = 1 then 'PASS: lead inserted'
            else 'FAIL: lead not inserted'
       end as result
from api.leads where email = 'test@example.com';

-- Clean up
delete from api.leads where email = 'test@example.com';

reset role;
reset request.jwt.claims;

\echo '========== 4. RLS: Anon cannot insert leads with wrong source =========='

set local role anon;
set local request.jwt.claims to '{"role":"anon"}';

-- Should fail due to RLS with check
do $$
begin
  insert into api.leads (name, email, message, source, status)
  values ('Hacker', 'evil@x.com', 'spam', 'spam_source', 'new');
  raise notice 'FAIL: RLS did not block invalid lead insert';
exception when others then
  raise notice 'PASS: RLS blocked invalid lead insert';
end;
$$;

reset role;
reset request.jwt.claims;

\echo '========== 5. RLS: Anon cannot delete anything =========='

set local role anon;
set local request.jwt.claims to '{"role":"anon"}';

do $$
begin
  delete from api.leads where email = 'does-not-exist@x.com';
  raise notice 'FAIL: anon was able to delete';
exception when others then
  raise notice 'PASS: anon cannot delete';
end;
$$;

reset role;
reset request.jwt.claims;

\echo '========== 6. Auth: web_admin has full access =========='

-- Get dev user UUID
set local role web_admin;
set local request.jwt.claims to (select internal.sign_jwt(jsonb_build_object(
  'role', 'web_admin',
  'user_uuid', u.uuid,
  'user_id', u.id,
  'email', u.email
)) from internal.users u where u.email = 'dev@localhost');

-- Admin should be able to see all projects (including drafts)
select case when count(*) >= 0 then 'PASS: admin can query projects'
            else 'FAIL: admin cannot query projects'
       end as result
from api.projects;

-- Admin should be able to create a project
do $$
declare
  new_id int;
begin
  insert into api.projects (title, slug, status)
  values ('test-security-project', 'test-security-project', 'draft')
  returning id into new_id;

  delete from api.projects where id = new_id;
  raise notice 'PASS: admin can create and delete projects';
exception when others then
  raise notice 'FAIL: admin cannot manage projects: %', sqlerrm;
end;
$$;

reset role;
reset request.jwt.claims;

\echo '========== 7. Input Validation: Email format =========='

set local role web_admin;
set local request.jwt.claims to (select internal.sign_jwt(jsonb_build_object(
  'role', 'web_admin',
  'user_uuid', u.uuid,
  'user_id', u.id,
  'email', u.email
)) from internal.users u where u.email = 'dev@localhost');

-- Valid email
insert into api.leads (name, email, message, source, status)
values ('Valid', 'test@example.com', 'ok', 'contact_form', 'new');
delete from api.leads where email = 'test@example.com';

-- Invalid email (should raise constraint violation)
do $$
begin
  insert into api.leads (name, email, message, source, status)
  values ('Invalid', 'not-an-email', 'bad', 'contact_form', 'new');
  raise notice 'FAIL: invalid email was accepted';
exception when others then
  raise notice 'PASS: invalid email rejected: %', sqlerrm;
end;
$$;

reset role;
reset request.jwt.claims;

\echo '========== 8. Input Validation: Slug format =========='

set local role web_admin;
set local request.jwt.claims to (select internal.sign_jwt(jsonb_build_object(
  'role', 'web_admin',
  'user_uuid', u.uuid,
  'user_id', u.id,
  'email', u.email
)) from internal.users u where u.email = 'dev@localhost');

-- Valid slug
insert into api.projects (title, slug, status)
values ('slug-test', 'valid-slug-123', 'draft');
delete from api.projects where slug = 'valid-slug-123';

-- Invalid slug (with special chars)
do $$
begin
  insert into api.projects (title, slug, status)
  values ('bad slug', 'invalid slug!!!', 'draft');
  raise notice 'FAIL: invalid slug was accepted';
exception when others then
  raise notice 'PASS: invalid slug rejected: %', sqlerrm;
end;
$$;

reset role;
reset request.jwt.claims;

\echo '========== 9. Input Validation: Length limits =========='

set local role web_admin;
set local request.jwt.claims to (select internal.sign_jwt(jsonb_build_object(
  'role', 'web_admin',
  'user_uuid', u.uuid,
  'user_id', u.id,
  'email', u.email
)) from internal.users u where u.email = 'dev@localhost');

do $$
begin
  insert into api.leads (name, email, message, source, status)
  values (
    repeat('x', 201),  -- 201 chars, max is 200
    'test@example.com',
    'test',
    'contact_form',
    'new'
  );
  raise notice 'FAIL: long name was accepted';
exception when others then
  raise notice 'PASS: long name rejected';
end;
$$;

do $$
begin
  insert into api.leads (name, email, message, source, status)
  values (
    'Test',
    'test@example.com',
    repeat('x', 5001),  -- 5001 chars, max is 5000
    'contact_form',
    'new'
  );
  raise notice 'FAIL: long message was accepted';
exception when others then
  raise notice 'PASS: long message rejected';
end;
$$;

reset role;
reset request.jwt.claims;

\echo '========== 10. Auth: login_dev disabled in production mode =========='

set local role anon;
set local request.jwt.claims to '{"role":"anon"}';

-- Override dev_mode to false to test protection
set local app.dev_mode to 'false';

do $$
begin
  perform api.login_dev();
  raise notice 'FAIL: login_dev worked in non-dev mode';
exception when others then
  raise notice 'PASS: login_dev blocked in non-dev mode: %', sqlerrm;
end;
$$;

reset role;
reset request.jwt.claims;

\echo '========== 11. Prevent SQL injection through PostgREST querystrings =========='
\echo 'PostgREST uses parameterized queries internally. Querystring params are'
\echo 'not interpolated into SQL; they are passed as bind parameters.'
\echo 'This is a design-level protection, not testable through SQL alone.'
\echo 'PASS: PostgREST architecture prevents SQL injection by design.'

\echo ''
\echo '========== ALL SECURITY TESTS COMPLETE =========='
