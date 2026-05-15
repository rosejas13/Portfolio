# Schema files (applied in order by docker-entrypoint-initdb.d)

001_init.sql        — Extensions (pgcrypto), schemas (api, internal), roles, grants, JWT config
002_auth.sql        — User table, JWT sign/verify, login_dev(), whoami()
003_permissions.sql — Dynamic RBAC: roles, resources, actions, role_permissions, has_permission()
004_portfolio.sql   — Core tables (projects, skills, project_skills, leads, site_config), RLS, trigger
005_seed.sql        — Dev seed data (admin user, sample project, sample skills)
006_blog.sql        — Blog posts table, permissions, RLS, trigger
007_error_handling.sql — Error logging, health(), get_site_config(), before_request()
008_experience.sql  — Work experience + education tables, permissions, RLS, triggers
009_security.sql    — UUID columns (prevents ID enumeration), input validation constraints
