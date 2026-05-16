# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│  jcrose.dev ── Next.js 15 (SSR + ISR)              │
│                      │                             │
│               /api/* proxy                         │
│                      ▼                             │
│              Caddy (reverse proxy)                 │
│              port 3001 (TLS, CORS)                 │
│                      │                             │
│              PostgREST v12 (auto-REST)             │
│              port 3000 (internal)                  │
│                      │                             │
│              PostgreSQL 16                         │
│              (database = the server)               │
└─────────────────────────────────────────────────────┘
```

- **Frontend:** Next.js 15 App Router renders pages on the server (SSR) with 60-second ISR revalidation. Public pages are server components that call the PostgREST API server-side. Admin pages are client components that call `/api/*` endpoints proxied through Next.js to PostgREST.
- **Backend:** There is no traditional backend server. PostgREST auto-generates a REST API from the PostgreSQL schema. All business logic lives in SQL functions, triggers, and row-level security policies. This eliminates an entire application server tier.
- **Auth:** Development uses a custom JWT (HS256) with `login_dev()`. Production uses Supabase Auth JWTs verified by PostgREST's built-in JWT support.

## Frontend Architecture

### Route Map

```
/ ........................ HomePage (hero + recent posts)
/about .................. AboutPage (bio, skills, experience, education)
/projects ............... ProjectList (grid of cards)
/projects/[slug] ........ ProjectDetail (single project + links)
/blog ................... BlogList (post list)
/blog/[slug] ............ BlogPost (single post)
/contact ................ ContactPage (form → POST /api/leads)
/admin/login ............ AdminLogin (Supabase / dev JWT)
/admin .................. AdminDashboard (stats cards)
/admin/projects ......... AdminProjects (CRUD table)
/admin/skills ........... AdminSkills (CRUD grouped by category)
/admin/experience ....... AdminExperience (CRUD cards)
/admin/education ........ AdminEducation (CRUD cards)
/admin/blog ............. AdminBlog (CRUD table)
/admin/leads ............ AdminLeads (table + status)
/admin/config ........... AdminConfig (key/value via modal)
/admin/metrics .......... AdminMetrics (API stats)
/admin/security ......... AdminPasskeys (MFA TOTP)
```

### Component Organization

```
features/
├── home/          HomePage, home.module.css
├── about/         AboutPage, about.module.css
├── projects/      ProjectList, ProjectDetail, projects.module.css
├── blog/          BlogList, BlogPost, blog.module.css
├── contact/       ContactPage, contact.module.css
├── nav/           Nav (server), ThemeToggle + MobileMenu (client)
├── shell/         ClientShell, ErrorBoundary, shell.module.css
└── admin/         AdminLayout, AdminDashboard, AdminLogin,
                   AdminProjects, AdminSkills, AdminExperience,
                   AdminEducation, AdminBlog, AdminLeads,
                   AdminConfig, AdminMetrics, AdminPasskeys
```

### Data Flow

```
Server Component (public page)
  └─ fetchJson('/rpc/get_site_config')
      └─ fetch(API_URL + path, { next: { revalidate: 60 } })
          └─ PostgREST → PostgreSQL

Client Component (admin page)
  └─ useCrud('/projects')
      └─ get<T>('/projects?order=sort_order')
          └─ fetch('/api/projects?...')   ← proxied by middleware
              └─ Next.js rewrite → PostgREST
```

**Why server components for public pages:** Content rarely changes; ISR caches the render for 60 seconds. No client-side JavaScript needed for public browsing.

**Why client components for admin:** CRUD operations need interactive state (forms, modals, optimistic updates). Admin is authenticated, so JS bundle size is acceptable.

### Styling Architecture

Three layers:

1. **CSS custom properties** (`globals.css` — design tokens, OKLCH color system)
2. **Global component classes** (`globals.css` — `.card`, `.btn`, `.tag`, `.grid`, etc.)
3. **CSS Modules** (per-feature `.module.css` files — component-specific overrides)

**Why CSS Modules + globals:** Avoids runtime CSS-in-JS overhead. Global utility classes handle the 80% case; modules handle the 20% that's component-specific. No Tailwind dependency.

### Key Design Decisions

- **No Tailwind:** Keeps the dependency surface small. Custom properties are more expressive (OKLCH, `clamp()`, `var()`) and the CSS file is only ~630 lines.
- **No component library:** Every component is purpose-built for this site. No abstraction overhead.
- **Inline theme script in `<head>`:** Runs before React to prevent flash of wrong theme. Reads `localStorage` and `prefers-color-scheme`.
- **CSP in production only:** Content Security Policy headers are applied by middleware in production. Skipped in dev so Next.js HMR scripts work.

## Backend Architecture

### Schema-as-API

Tables in the `api` schema automatically become REST endpoints:

```
api.projects       → GET  /projects
                   → POST /projects
                   → PATCH /projects?id=eq.1
                   → DELETE /projects?id=eq.1

api.skills         → GET  /skills
api.leads          → POST /leads        (anon insert)
api.posts          → GET  /posts
api.experiences    → GET  /experiences
api.education      → GET  /education
api.site_config    → GET  /rpc/get_site_config
```

### Schema Layout

```
api (public)
├── projects, project_skills, skills
├── posts, leads, site_config
├── experiences, education
└── RPC: login_dev(), whoami(), health(), get_site_config(), metrics()

internal (private)
├── users, credentials
├── roles, resources, actions, role_permissions, user_roles
├── request_log, error_log
├── JWT: sign_jwt(), jwt_secret(), jwt_expiry()
├── Auth: has_permission(), before_request()
├── Logging: log_error(), cleanup_logs()
└── Utility: set_updated_at(), is_valid_url(), base64url_encode()
```

### Auth Flow

```
1. User POSTs credentials to /api/auth/login
2. Next.js route handler calls /rpc/login_dev (dev) or Supabase Auth (prod)
3. JWT is set as HttpOnly cookie or returned in response
4. Subsequent requests include JWT in Authorization header
5. PostgREST verifies JWT signature and extracts role + user_uuid
6. RLS policies call internal.has_permission(resource, action)
7. has_permission() joins JWT claims → user_roles → role_permissions
```

### RBAC Design

**Why data-driven:** Permissions are configurable at runtime without schema changes. Adding a new role or changing access for a resource is a data change, not a code change.

```
Roles:       admin, collaborator, agent
Resources:   projects, skills, posts, leads, experiences, education, site_config
Actions:     create, read, update, delete, manage

role_permissions:  role_id + resource_id + action_id
user_roles:        user_id + role_id
```

### Row-Level Security

Every `api` table has RLS policies:

```
Anon:  SELECT where status = 'published'
Admin: SELECT, INSERT, UPDATE, DELETE via has_permission('resource', 'action')
Collab: SELECT, INSERT, UPDATE (no DELETE) on most resources
```

**Why RLS:** Defense in depth. Even if the application layer auth has a bug, PostgreSQL enforces access at the row level.

### Security Hardening

- **UUID public IDs:** All public-facing tables have a `uuid` column. External references use UUIDs, not sequential integers, preventing ID enumeration.
- **Input validation at DB level:** CHECK constraints enforce length limits, slug format (`^[a-z0-9]+(-[a-z0-9]+)*$`), email format, and URL validation.
- **PII redaction in logs:** `log_error()` strips emails, JWTs, and JSON values before writing to `error_log`.
- **CORS lockdown:** Caddyfile restricts origins to `jcrose.dev` and `localhost`.
- **Rate limiting:** Next.js middleware enforces per-IP rate limits on login (10/min), contact form (5/min), admin mutations (30/min), and global API (100/min).
- **Security headers:** CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

### Migration Strategy

SQL migration files are numbered (`001_init.sql` through `010_logging.sql`) and applied in order by `docker-entrypoint-initdb.d`. Each file is idempotent where possible (`CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, `ADD COLUMN IF NOT EXISTS`).

## Observability

- **Request logging:** `before_request()` hook logs every write request (method, path, role, IP, user-agent) to `internal.request_log`
- **Error tracking:** `log_error()` captures SQLSTATE, message, and redacted context
- **Health endpoint:** `/rpc/health` returns uptime, active connections, recent errors/requests
- **Metrics dashboard:** Admin-only `/rpc/metrics` shows request counts (1h/24h/7d), top endpoints, error counts, and role breakdown
- **Log cleanup:** `cleanup_logs()` retains request logs 90 days, error logs 180 days
- **Frontend:** `ErrorBoundary` catches render errors and reports them via `POST /api/error`

## Deployment

- **Frontend:** Vercel (Next.js native support, ISR, edge middleware)
- **Database:** Supabase (managed PostgreSQL 16 with PostgREST)
- **DNS:** Cloudflare → Vercel (`jcrose.dev`)
- **Dev:** Docker Compose (PostgreSQL + PostgREST + Caddy on localhost)
