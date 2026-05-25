# Manual Setup Instructions

Items that couldn't be automated. Most take < 1 minute.

---

## 1. Enable Branch Protection on master

1. Go to **https://github.com/rosejas13/Portfolio/settings/branches**
2. Click **"Add branch protection rule"**
3. Set **Branch name pattern**: `master`
4. Enable:
   - ☑ **Require a pull request before merging**
     - **Required approvals**: 1
     - ☑ **Dismiss stale pull request approvals when new commits are pushed**
   - ☑ **Require status checks to pass before merging**
     - ☑ **Require branches to be up to date before merging**
     - Search and select: **build** (the CI job name)
   - ☑ **Require linear history**
   - ☑ **Do not allow force pushes**
   - Click **Create**

After this, every change needs a PR + passing CI + review. No direct pushes.

---

## 2. Add SUPABASE_ANON_KEY to GitHub Secrets

The sync workflow needs this to call Supabase from GitHub Actions.

```bash
# 1. Copy the anon key from Supabase dashboard
#    https://supabase.com/dashboard/project/fhantuyujrusrtrvctzw/settings/api
#    → "Project API keys" → "anon public"

# 2. Set it as a GitHub secret
gh secret set SUPABASE_ANON_KEY --repo rosejas13/Portfolio
```

This key is technically **public** (it's in the JS bundle that ships to browsers) — but GitHub Actions needs it as a secret to send it as an HTTP header.

---

## 3. Supabase Migrations (future schema changes)

Schema changes are already in sync (12 migrations applied). For future changes:

```bash
# Add a new migration file
touch supabase/migrations/$(date -u +%Y%m%d%H%M%S)_description.sql

# Push it to Supabase
supabase db push
```

The CI pipeline doesn't apply migrations automatically — you must run `supabase db push` manually after merging schema changes.

---

## 4. Verify CI Runs After Push

Push the commit history, then check CI runs:

```bash
git push origin master
# Watch: https://github.com/rosejas13/Portfolio/actions
# CI should run: typecheck → lint → test → build
```

After CI passes, the deploy workflow triggers automatically (Vercel).

---

## 5. Run Tests Against Production (optional)

```bash
cd frontend

# E2E user flows (26 tests)
npx playwright test test/e2e/ --project=production

# Security tests (96 tests)
npx playwright test test/security/ --project=production

# All combined
npx playwright test --project=production
```

---

## 6. Branch Protection Troubleshooting

If the API returns "Branch protection disabled on this repository":

1. Go to **https://github.com/rosejas13/Portfolio/settings/branches**
2. If no rules exist, just add one (step 1 above). The error only appears when reading an existing rule that doesn't exist.
3. If you get an error about "Branch protection was disabled" when saving, make sure you're not in an organization that restricts branch protections.

---

## Summary: What's Automatic

| Task | Automatic? |
|---|---|
| CI on push/PR | ✅ Yes — typecheck → lint → test → build |
| Deploy to Vercel | ✅ Yes — after CI passes on master |
| Secret scanning | ✅ Yes — enabled |
| Actions SHA-pinned | ✅ Yes |
| Supabase migrations current | ✅ Yes (12/12 applied) |
| Security tests pass on prod | ✅ Yes (96/96) |
| E2E tests pass on prod | ✅ Yes (26/26) |
| Branch protection | ❌ Manual (step 1) |
| SUPABASE_ANON_KEY secret | ❌ Manual (step 2) |
| Future schema migrations | ❌ Manual (step 3) |
