create extension if not exists pgcrypto;

create schema if not exists api;
create schema if not exists internal;

-- anon: unauthenticated web users
create role anon noinherit;

-- web roles: authenticated users mapped via JWT "role" claim
create role web_admin;
create role web_collaborator;
create role web_agent;

grant usage on schema api to anon, web_admin, web_collaborator, web_agent;
grant usage on schema internal to web_admin;

grant anon to app;
grant web_admin to app;
grant web_collaborator to app;
grant web_agent to app;

alter database app set app.jwt_secret to 'dev-secret-change-in-production-this-is-32-chars!!';
alter database app set app.dev_mode to 'true';
alter database app set app.jwt_expiry to '24 hours';
