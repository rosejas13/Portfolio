# Environment Setup Guide

## Architecture

```
 Local Dev                              Production
 ┌──────────┐                           ┌──────────┐
 │ Vite/Next │ :5173                     │ Vercel   │ (Next.js hosting)
 │  dev svr  │                           │  deploy  │
 └────┬─────┘                           └────┬─────┘
      │ /api/* rewrite                      │ /api/* rewrite
      ▼                                     ▼
 ┌──────────┐ :3001                     ┌──────────┐
 │  Caddy   │ (proxy + CORS)            │ Supabase │ (managed PostgREST)
 └────┬─────┘                           │ PostgREST│
      │                                  └────┬─────┘
      ▼                                       │
 ┌──────────┐ :3000                           ▼
 │PostgREST │                           ┌──────────┐
 └────┬─────┘                           │ Supabase │ (managed PostgreSQL)
      │                                  │    PG    │
      ▼                                  └──────────┘
 ┌──────────┐ :5432
 │PostgreSQL│ (Docker)
 └──────────┘
```

## Files and Their Purpose

| File | Purpose | Commit? |
|---|---|---|
| `.env` (root) | Docker stack secrets (JWT_SECRET) | No (.gitignore) |
| `.env.example` (root) | Template for `.env` | Yes |
| `frontend/.env.development` | Local dev config for Next.js | Yes |
| `frontend/.env.production` | Production config reference | Yes |
| `frontend/.env.local` | Local overrides (auto-loaded by Next.js) | No (.gitignore) |
| `Caddyfile` | Dev block active, prod block commented | Yes |
| `docker-compose.yml` | Local stack definition | Yes |

## What You Need to Do

### 1. Create root `.env` for Docker

```bash
cp .env.example .env
# Edit .env and set:
JWT_SECRET=<generate with: openssl rand -hex 32>
```

### 2. Set up Vercel

```bash
# Navigate to the frontend directory
cd frontend

# Link to Vercel (if not already linked)
vercel link

# Set environment variables in Vercel dashboard (or via CLI):
vercel env add API_URL production
# Value: https://fhantuyujrusrtrvctzw.supabase.co/rest/v1

vercel env add NODE_ENV production
# Value: production

# Deploy
vercel --prod
```

### 3. Set up GitHub Secrets

Go to: `https://github.com/rosejas13/all-in-pg/settings/secrets/actions`

Add these secrets:

| Secret | Value | Where to find it |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | `sbp_xxx...` | Supabase dashboard → Account → Access Tokens |
| `SUPABASE_DB_PASSWORD` | Your DB password | Supabase dashboard → Project Settings → Database |
| `SUPABASE_PROJECT_ID` | `fhantuyujrusrtrvctzw` | Supabase dashboard → Project Settings → General |
| `SUPABASE_URL` | `https://fhantuyujrusrtrvctzw.supabase.co` | Supabase dashboard → Project Settings → API |
| `VERCEL_TOKEN` | `xxx...` | Vercel dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | `xxx...` | `vercel link` output or Vercel dashboard |
| `VERCEL_PROJECT_ID` | `xxx...` | `vercel link` output or Vercel dashboard |

### 4. Supabase Auth Setup (if you want production auth beyond dev login)

The current production setup uses Supabase's built-in Auth:
1. Go to Supabase dashboard → Authentication → Settings
2. Set Site URL to `https://jcrose.dev`
3. Add redirect URL: `https://jcrose.dev/admin`
4. Disable "Enable email confirmations" if using dev login
5. The `app_metadata.role` field controls access (set via Auth dashboard or API)

Currently, the custom `login_dev()` RPC only works in dev mode. For production auth:
- Use Supabase Auth's built-in email/password/OAuth
- Set `app_metadata: { role: "admin" }` on your user
- The RLS policies read from `auth.jwt() -> 'app_metadata' ->> 'role'`

### 5. Branch Strategy (choose one)

**Option A: Keep `master` (already done)**
- I've added `master` to both CI and deploy workflows

**Option B: Rename to `main`**
```bash
git branch -m master main
git push -u origin main
# Then update GitHub default branch to main in repo settings
```

### 6. Multi-Environment Notes

The project already supports environment switching via branches:

| Branch | Environment | API_URL | Deploy Target |
|---|---|---|---|
| `dev` | Development | Staging Supabase project | Vercel preview |
| `main`/`master` | Production | Production Supabase project | Vercel production |

To add a staging environment:
1. Create a second Supabase project for staging
2. Set `SUPABASE_URL` and `SUPABASE_PROJECT_ID` differently per GitHub Environment
3. Push to `dev` branch triggers staging deploy

### 7. Verify Everything

```bash
# Local: start Docker stack
docker compose up -d

# Local: start Next.js dev server
cd frontend && npm run dev

# Visit http://localhost:5173 — public pages should load
# Visit http://localhost:5173/admin/login — click "Sign in with Dev Account"
# Visit http://localhost:5173/admin/metrics — should show metrics dashboard

# API health check
curl http://localhost:3001/rpc/health

# Run tests
cd frontend && npm test

# Typecheck
cd frontend && npm run typecheck
```

### 8. Current State

| Component | Status |
|---|---|
| Docker stack (local) | Running, healthy |
| Supabase project | Linked, migrations applied |
| GitHub | Pushed (branch: master) |
| Vercel | **Needs setup** (see step 2) |
| GitHub Secrets | **Needs setup** (see step 3) |
| CI (typecheck + test + build) | Configured, runs on push |
| CD (schema + deploy) | Configured, needs secrets |
