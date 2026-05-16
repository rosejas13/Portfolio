# Pipeline Fix — Deployment Race Conditions

## Issues Found

1. **Double-deploy conflict** — Two mechanisms were deploying simultaneously:
   - **Vercel Git Integration** — auto-deploys on every push to master
   - **GitHub Actions `Deploy` workflow** — also triggers `vercel deploy --prod` on push to master
   - These raced each other. One deploy would alias `jcrose.dev`, then the other would clobber it milliseconds later with a possibly-stale build cache.

2. **Constant redeploy loop** — The Vercel Git integration triggered a build every few seconds, even without new commits. Likely a webhook retry loop or configuration issue.

3. **Build cache staleness** — Vercel's build cache was restoring from an old deployment that didn't include the `apikey` header fix, so even fresh deploys served stale server code.

4. **Root directory mismatch** — The CLI `vercel deploy` uploaded the entire repo (including node_modules, 1.4GB) because the project root is the repo root, but the Next.js app lives in `frontend/`. Added `vercel.json` at repo root with correct `buildCommand`, `outputDirectory`, and `installCommand` pointing to `frontend/`.

## Current State (temporary)

- **Vercel Git Integration** — DISCONNECTED (no auto-deploy on push)
- **GitHub Actions workflows** — DISABLED (renamed to `.disabled`)
- **Manual deploys** — working via `npx vercel --prod --yes` from `frontend/`
- **Supabase API** — working. `get_site_config()` created in both `public` and `api` schemas. Anon key header added to `fetchJson`.

## What Needs Fixing

- [ ] **Re-enable one deploy mechanism** — Choose either Vercel Git Integration OR GitHub Actions, not both
- [ ] **Fix root directory** — Configure Vercel project root directory to `frontend/` in the Vercel dashboard, or keep the root `vercel.json` with `buildCommand: cd frontend && npm run build`
- [ ] **Add `.vercelignore`** — Already done at `frontend/.vercelignore`, verify it's respected
- [ ] **Add `api` schema to Supabase exposed schemas** — In Supabase Dashboard → Settings → API → Exposed schemas, add `api` alongside the existing `public`. This avoids the need for the `public` wrapper function
- [ ] **Investigate webhook loop** — The Git integration was firing builds with no new commits. Check Vercel project settings for webhook configuration
- [ ] **Consider `supabase db push` for schema management** — The `get_site_config` function was created ad-hoc via `supabase db query`. A proper migration should be added to `supabase/migrations/`

## Files to Re-enable

```
.github/workflows/ci.yml.disabled     → rename to ci.yml
.github/workflows/deploy.yml.disabled → rename to deploy.yml (or delete, if using Vercel Git)
```

## URLs

- Production: https://jcrose.dev
- Vercel Dashboard: https://vercel.com/jcrose/all-in-pg
- Supabase Dashboard: https://supabase.com/dashboard/project/fhantuyujrusrtrvctzw
