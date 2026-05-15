-- seed data for development

-- create a dev user and assign admin role
insert into internal.users (email, name)
values ('dev@localhost', 'Dev User')
on conflict (email) do nothing;

insert into internal.user_roles (user_id, role_id)
select u.id, r.id
from internal.users u, internal.roles r
where u.email = 'dev@localhost'
  and r.name = 'admin'
  and not exists (
    select 1 from internal.user_roles ur
    where ur.user_id = u.id and ur.role_id = r.id
  );

-- sample project
insert into api.projects (title, slug, tagline, description, tech_stack, status, sort_order)
values (
  'All-in-PG',
  'all-in-pg',
  'PostgREST-powered full-stack portfolio',
  'A portfolio site built with React, PostgREST, and PostgreSQL. No traditional backend — the database is the server, and Gas City agents orchestrate the development workflow.',
  array['React', 'TypeScript', 'PostgreSQL', 'PostgREST', 'Gas City'],
  'published',
  1
);

-- sample skills
insert into api.skills (name, category, sort_order) values
  ('React', 'Frontend', 1),
  ('TypeScript', 'Language', 2),
  ('PostgreSQL', 'Backend', 3),
  ('PostgREST', 'Backend', 4),
  ('Docker', 'DevOps', 5),
  ('Python', 'Language', 6),
  ('Git', 'Tools', 7);
