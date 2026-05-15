# Supabase Setup Guide

## Project Setup

1. Create two Supabase projects (free tier):
   - `all-in-pg-dev` — development/staging
   - `all-in-pg-prod` — production

2. Enable the pgcrypto extension in both projects:
   ```sql
   create extension if not exists pgcrypto;
   ```

## Schema Migration

Our schema files are in `backend/schema/`. Run them in order via the Supabase SQL editor or use the CLI.

### Files to skip or modify for Supabase:

| File | Action | Reason |
|------|--------|--------|
| `001_init.sql` | **Skip** roles section | Supabase already has `anon` and `authenticator` roles. Only run `pgcrypto` and schema creation |
| `002_auth.sql` | **Skip entirely** | Supabase Auth replaces our custom auth. Use `auth.uid()` in RLS instead |
| `003_permissions.sql` | **Modify** | Use Supabase's JWT claims format (`auth.role()` instead of `current_setting('request.jwt.claims')`) |
| `004_portfolio.sql` | **Run as-is** | Tables + RLS policies (update policies to use `auth.uid()`) |
| `005_seed.sql` | **Run as-is** | Seed data only |
| `006_blog.sql` + others | **Run as-is** | Tables + RLS |

## Key Configuration

### Auth Settings (Supabase Dashboard → Authentication → Settings)
- **Sessions**: Set JWT expiry to 86400 (24h)
- **Security**: Disable "Allow new user signups" (invite-only)
- **Providers**: Enable Email/Password or Passkeys as needed

### API Settings (Supabase Dashboard → Settings → API)
- **JWT secret**: Auto-generated, keep it safe
- **URL**: Your project URL (``https://<project>.supabase.co``)
- **Anon key**: Public, safe to expose in frontend
- **Service role key**: Secret, never expose to client

### RLS Policy Adjustments

In our local setup, RLS uses `internal.has_permission()` which reads JWT claims. In Supabase, use:

```sql
-- Instead of: current_setting('request.jwt.claims', true)::jsonb ->> 'user_id'
-- Use: auth.uid()
-- Instead of: current_setting('request.jwt.claims', true)::jsonb ->> 'role'
-- Use: auth.role()

-- Example: anon SELECT policy
create policy "anon can read published projects"
on api.projects for select
to anon
using (status = 'published');
```

## Frontend Configuration

Set environment variables in your deployment platform (Vercel):

```env
API_URL=https://<project>.supabase.co/rest/v1
```

The Next.js middleware and rewrites use `API_URL` to proxy API requests.

## Row Level Security

Supabase enforces RLS by default. Every table needs:
- An `INSERT` policy for `anon` (if public submissions are allowed)
- A `SELECT` policy for `anon` (if public read is allowed)
- Authenticated user policies using `auth.uid()`

Our current RLS policies already follow this pattern — they just need `auth.uid()` instead of our custom `has_permission()` function if you choose not to port that function.

## Dev vs Prod Strategy

| | Dev | Prod |
|---|---|---|
| **Supabase project** | `all-in-pg-dev` | `all-in-pg-prod` |
| **Branch** | `dev` | `main` |
| **Frontend URL** | `dev-portfolio.example.app` | `portfolio.example.com` |
| **Auth** | Dev login disabled, use Supabase Auth directly | Same |
| **Data** | Reset periodically with dummy data | Real data, never reset |
