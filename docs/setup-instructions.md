# Setup Instructions

## Prerequisites
- Node.js 20+
- Docker Desktop (for local backend)
- Supabase CLI (`brew install supabase/tap/supabase`)
- GitHub CLI (`brew install gh`)

## Quick Start

```bash
# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# Backend (separate terminal)
docker compose up -d  # PostgreSQL + PostgREST + Caddy
```

## Running Tests

```bash
# Unit tests (63)
npm test

# E2E against local dev server
npx playwright test --project=local

# E2E against production
npx playwright test --project=production

# SQL security tests (requires Docker backend)
docker compose exec db psql -U app -d app -f backend/tests/security.sql
```

## CI/CD

Push to `master` → CI runs (typecheck → lint → test → build) → Deploys to Vercel.

Branch protection is enabled on master: PR + 1 review + CI green required.

## Database Migrations

```bash
# Push pending migrations to Supabase
supabase db push

# View migration status
supabase migration list
```

## Environment Variables

See `frontend/lib/config.ts` for all required vars. Production values are set in Vercel project settings and GitHub secrets.
