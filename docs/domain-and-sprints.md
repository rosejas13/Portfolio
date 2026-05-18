# Domain & Sprint Workflow

## Custom Domain (Cloudflare)

### Vercel
1. In Vercel dashboard: Project → Settings → Domains
2. Add your domain (e.g. `jcrose.dev`)
3. Vercel provides a CNAME or nameserver config
4. In Cloudflare DNS: point to Vercel's nameservers or add CNAME record

### Cloudflare Pages
1. In Cloudflare Pages: Project → Custom domains
2. Add domain, Cloudflare provides DNS target

### API (Supabase)
- Supabase projects get a `*.supabase.co` URL (free tier)
- Custom domain for Supabase API requires Supabase Pro plan ($25/mo)
- Keep the API at `https://<project>.supabase.co/rest/v1` for now

### Domain structure
```
jcrose.dev               →  Vercel (Next.js frontend)
<project>.supabase.co    →  Supabase API (backend)
```

## Sprint Workflow

```
master branch
    │
    │  PR merged (after review + test)
    ▼
GitHub Actions
    │
    ├─ CI: typecheck + build
    │
    └─ CD: deploy to PROD
       Supabase + Vercel
           │
           ▼
    Verify on staging URL       Deploy to PROD
    (all-in-pg.vercel.app)      (jcrose.dev)
           │
           ▼
     Manual verify
     (environment approval gate)
```

### Branch Strategy
- `master` — production. Protected branch, requires PR review.
- Feature branches — branch from `master`, merge back via PR.

### Environment Gates
- **Production**: Push to `master` triggers Vercel deploy via Git Integration. PR review required by branch protection.

### GitHub Environments
Set up in GitHub.com → Settings → Environments:
| Environment | Required reviewers | Branch | URL |
|-------------|------------------|--------|-----|
| `production` | You | `master` | `jcrose.dev` |

### Sprint Cadence
1. Work on feature branches → PR to `master`
2. Vercel preview deploys for verification
3. After sprint review: merge to `master`
4. Manual approval gate deploys to production
5. Hotfix: PR directly to `master`
