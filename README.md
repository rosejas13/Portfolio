# jcrose.dev — Personal Portfolio

Personal portfolio and blog for Jasper Cordova, powered by Next.js 15, PostgreSQL 16, and PostgREST. Public marketing site with a private admin CMS for managing projects, skills, blog posts, work experience, and site configuration.

## Quick Start

```bash
# 1. Start the backend
docker compose up -d

# 2. Start the frontend
cd frontend
cp .env.example .env.development
npm install
npm run dev        # → http://localhost:5173

# 3. Seed dev data
# The Docker stack auto-runs SQL migrations and seeds a dev user.
# Login at /admin/login with email: dev@localhost
```

## Architecture

```
Browser ─→ Next.js 15 (SSR + ISR, port 5173 dev / Vercel prod)
                │
          /api/* proxy
                │
           Caddy (TLS, CORS, port 3001)
                │
          PostgREST v12 (auto-REST from PostgreSQL)
                │
          PostgreSQL 16 (database = the server)
```

- **Frontend:** Next.js 15 App Router, React 19, CSS custom properties (OKLCH color system), Sora + Onest fonts
- **Backend:** PostgreSQL with PostgREST — tables in `api` schema become REST endpoints; `internal` schema holds auth, RBAC, and logging
- **Auth:** JWT (HS256) in dev; Supabase Auth in production. Dynamic RBAC with row-level security
- **Design:** Teal + coral on warm neutrals, fluid type scale, light/dark theme toggle
- **Full architecture:** see [ARCHITECTURE.md](ARCHITECTURE.md)

## Commands

| Command | Directory | Description |
|---|---|---|
| `docker compose up -d` | root | Start PostgreSQL, PostgREST, Caddy |
| `docker compose down` | root | Stop backend |
| `npm run dev` | `frontend/` | Next.js dev server (port 5173) |
| `npm run build` | `frontend/` | Production build |
| `npm test` | `frontend/` | Run unit tests (Vitest) |
| `npm run lint` | `frontend/` | Run ESLint |
| `npm run typecheck` | `frontend/` | TypeScript check (tsc --noEmit) |
| `npm run test:e2e` | `frontend/` | Playwright E2E tests (needs dev server) |

### Backend

| Command | Description |
|---|---|
| `docker compose exec db psql -U app -d app -f backend/tests/security.sql` | Run SQL security tests |
| `docker compose exec db psql -U app -d app -c "SELECT internal.cleanup_logs()"` | Manual log cleanup |
| `docker compose exec caddy cat /var/log/caddy/api.log` | View Caddy access log |

## Directory Structure

```
├── frontend/               # Next.js 15 App Router
│   ├── app/                # Routes, layout, globals.css, middleware
│   ├── features/           # Feature modules (home, about, blog, admin, etc.)
│   ├── lib/                # Shared utilities, design tokens, API clients
│   └── test/               # Playwright security tests
├── backend/                # PostgreSQL schema + migrations
│   ├── schema/             # 001_init.sql through 010_logging.sql
│   └── tests/              # SQL integration tests
├── docs/                   # Project documentation
├── scripts/                # Deployment and utility scripts
├── docker-compose.yml      # Local dev stack
└── Caddyfile               # Reverse proxy config
```

## Documentation

| Document | Purpose |
|---|---|
| [PRODUCT.md](PRODUCT.md) | Brand, users, design principles, anti-references |
| [DESIGN.md](DESIGN.md) | Color tokens, typography, spacing, motion system |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Full system architecture (frontend + backend) |
| [docs/supabase-setup.md](docs/supabase-setup.md) | Supabase project configuration |
| [docs/security-posture.md](docs/security-posture.md) | Security design and hardening |
| [docs/security-audit.md](docs/security-audit.md) | Security audit findings |
| [docs/logging-monitoring.md](docs/logging-monitoring.md) | Observability pipeline |
| [docs/domain-and-sprints.md](docs/domain-and-sprints.md) | Custom domain and sprint plan |

## Environments

| Environment | URL | Notes |
|---|---|---|
| Local dev | `http://localhost:5173` | `npm run dev`, Docker backend |
| Production | `https://jcrose.dev` | Vercel + Supabase |

## CI/CD

### Pipeline
- **CI** (`.github/workflows/ci.yml`): Runs `tsc --noEmit` → `eslint` → `vitest` → `next build` on every push and PR.
- **Deploy** (`.github/workflows/deploy.yml`): Deploys to Vercel after CI passes on `master`.

### Branch Protection (Required)
Deploy runs only on pushes to `master` after CI succeeds. To enforce PR + review:

1. GitHub → Settings → Branches → Add branch protection rule
2. Branch: `master`
3. Enable **Require a pull request before merging**
4. Enable **Require status checks** — select `build` (the CI job name)
5. Enable **Require branches to be up to date**

This ensures no direct pushes to master bypass CI or skip review.
