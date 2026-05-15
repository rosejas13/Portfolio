# Domain & Sprint Workflow

## Custom Domain (Hostinger)

### Option 1: Vercel (simplest)
1. In Vercel dashboard: Project → Settings → Domains
2. Add your domain (e.g. `portfolio.example.com` or `example.com`)
3. Vercel provides a CNAME or nameserver config
4. In Hostinger DNS: point to Vercel's nameservers or add CNAME record

### Option 2: Cloudflare Pages
1. In Cloudflare Pages: Project → Custom domains
2. Add domain, Cloudflare provides DNS target
3. In Hostinger: either delegate nameservers to Cloudflare, or add CNAME

### API (Supabase)
- Supabase projects get a `*.supabase.co` URL (free tier)
- Custom domain for Supabase API requires Supabase Pro plan ($25/mo)
- Keep the API at `https://<project>.supabase.co/rest/v1` for now

### Domain structure
```
portfolio.example.com    →  Vercel/Pages (React frontend)
<project>.supabase.co    →  Supabase API (backend)
```

## Sprint Workflow

```
dev branch                         main branch
    │                                  │
    │  Push code                       │  PR merged (after review + test)
    ▼                                  ▼
GitHub Actions                     GitHub Actions
    │                                  │
    ├─ CI: typecheck + build           ├─ CI: typecheck + build
    │                                  │
    └─ CD: deploy to DEV               │
       Supabase + Vercel preview       │
          │                            │
          ▼                            ▼
    Verify on dev URL              Deploy to PROD
    (dev-portfolio.example.app)    (portfolio.example.com)
                                        │
                                        ▼
                                  Manual verify
                                  (environment approval gate)
```

### Branch Strategy
- `main` — production. Protected branch, requires PR review.
- `dev` — development. Direct pushes allowed, auto-deploys to dev env.
- Feature branches — branch from `dev`, merge back via PR.

### Environment Gates
- **Development**: Auto-deploys on push to `dev`
- **Production**: Requires PR merge to `main` + environment approval in GitHub

### GitHub Environments
Set up in GitHub.com → Settings → Environments:
| Environment | Required reviewers | Branch | URL |
|-------------|------------------|--------|-----|
| `development` | None | `dev` | `dev-portfolio.example.app` |
| `production` | You | `main` | `portfolio.example.com` |

### Sprint Cadence
1. Work on feature branches → PR to `dev`
2. Auto-deploys to dev env for verification
3. After sprint review: merge `dev` → `main`
4. Manual approval gate deploys to production
5. Hotfix: PR directly to `main`, cherry-pick to `dev`
