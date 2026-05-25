<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:7510c1e2 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.
<!-- END BEADS INTEGRATION -->

## Session Completion

Work is complete only when verified and tested thoroughly. No shortcuts.

**REQUIRED WORKFLOW:**

1. **Run all quality gates** — Tests, type checks, lint, security audit, build. Every gate must pass with zero errors.
2. **Review for readability** — Is the code clear? Would another engineer understand it without asking you? Prefer simple over clever.
3. **Review for documentation** — Are ADRs, README, or inline docs updated if the change affects anything a future reader would need to know?
4. **Review for security** — No credentials leaked, no injection vectors, proper validation on all inputs.
5. **Review for efficiency** — No N+1 queries, no wasted allocations, no unnecessary complexity.
6. **File issues for remaining work** — Create beads issues for anything that needs follow-up. Be specific with acceptance criteria.
7. **Update issue status** — Close finished work, update in-progress items.
8. **Push to remote:**
   ```bash
   git pull --rebase
   git push
   git status  # should show up to date
   ```

**CRITICAL RULES:**
- Work is NOT complete until ALL quality gates pass — tests, readability, docs, security, efficiency
- "Tests pass" is not enough — verify the solution works completely as intended
- Push is the last step, not the goal
- When a gate fails, fix what it detects — don't change the gate to match broken behavior
- Trace each bug to its source and fix it there; patching symptoms accumulates debt
- Prefer refactoring the underlying pattern over adding more conditional logic

## Test Suites

| Command | Runner | Scope | Notes |
|---|---|---|---|
| `npm test` (frontend/) | Vitest | 63 unit tests | Tests components, markdown parser, contact page. Runs on every push via CI. |
| `npm run test:e2e` (frontend/) | Playwright | 27 E2E tests | Needs dev server running. Covers navigation, forms, responsive, keyboard, theme. |
| `docker compose exec db psql -U app -d app -f backend/tests/security.sql` | psql | 22 SQL tests | Tests RLS, RBAC, input validation, JWT, content constraints. Run against local Docker DB. |

### Test patterns
- Vitest config uses `esbuild.jsx: 'automatic'` for React 19 JSX transform
- Playwright testDir is `./test` (includes `test/security/` and `test/e2e/`); vitest excludes both
- Playwright projects: `local` (localhost:5173) and `production` (jcrose.dev)
- SQL tests use `set local role` + JWT claims for role impersonation

## Security Posture

### XSS Prevention
- `markdown.tsx:49-51`: URL scheme validation — only `http://`, `https://`, `/`, `#`, `mailto:` allowed. `javascript:`, `data:`, `vbscript:` → `#`
- Contact form: Turnstile bot protection, CSRF token header, server-side body validation
- Caddyfile CSP: `default-src 'none'; base-uri 'none'` (PostgREST serves JSON only)
- Next.js middleware: CSP with nonce-based script-src for page content
- ErrorBoundary: sends truncated (200-char) error metadata only — no stack traces, no PII

### Logging Security
- Caddy access log: safe-field JSON format — path only, no headers/IP/query params
- `internal.request_log`: write operations only, RLS-gated to `web_admin`, injection-protected
- `internal.error_log`: PII auto-redacted (emails, JWTs, IPs, control chars stripped), truncated
- IP pseudonymization: IPs hashed after 7 days via `internal.pseudonymize_ips()`
- pg_cron: auto-cleanup at 3 AM UTC (Supabase); local Docker needs manual or custom image

### Backend
- Row-Level Security on all `api.*` tables
- Dynamic RBAC via `internal.has_permission()` — role data drives access
- Input validation: CHECK constraints on slug format, email format, URL format, length limits
- PostgREST architecture prevents SQL injection (parameterized queries, no interpolation)

## CI/CD

- CI runs on every push/PR: `tsc --noEmit` → `eslint` → `vitest` → `next build`
- Deploy triggers after CI passes on `master` via `workflow_run`
- Branch protection recommended: require PR + review + CI status check on master

## Accessibility (WCAG 2.2 AA)
- Color contrast: OKLCH tokens tuned for 4.5:1 minimum (light theme)
- Focus: visible `:focus-visible` outline via `.dark`/`:root `global styles
- Forms: `htmlFor`/`id` on all admin CRUD label/input pairs
- Landmarks: `<header>` banner, `aria-label` on nav + sidebar, `role="dialog"` on mobile drawer
- Heading hierarchy: no skips — `h1` → `h2` on all list pages
- `prefers-reduced-motion` respected globally

## Component Library

This project uses **azimuth-ui** from npm. Available components include:
- `Text` — variant (`display`, `body`), size (`h1`-`h6`, `base`, `sm`, `xs`), color, weight
- `Card` — with `.Header`, `.Content`, `.Footer`, `.Title`, `.Description` sub-components
- `Stack` — direction (`horizontal`, `vertical`), spacing, justify, align
- `Grid` — columns, gap, responsive
- `Button` — variant (`primary`, `secondary`, `danger`, `ghost`), size, shape, icon
- `Input`, `TextArea` — label, required, maxLength, error, fullWidth
- `Alert` — variant (`success`, `alert`, `info`, `neutral`)
- `Tag`, `Badge`, `Avatar`, `Divider`, `Container`

Use these instead of custom CSS where possible. CSS modules should only contain layout rules not handled by azimuth-ui.

## Modularity Standards

### Feature Isolation
- Each feature in `features/` is a self-contained module. Zero cross-feature imports allowed. Features only import from `@/lib/*`, npm packages, and their own files.
- Each feature must have an `index.ts` barrel file that exports its public API.
- Route pages in `app/` must be thin re-exporters: `export { default } from '@/features/x/page'`. No logic in route files.
- CSS modules are per-feature. Never `@import` another feature's CSS module. Only reference global custom properties from `globals.css`.

### Route → Feature Pattern
```
app/about/page.tsx          → export { default } from '@/features/about/about-page'
features/about/about-page.tsx   ← actual component lives here
features/about/index.ts         ← barrel export
```

### Feature Boundaries
- Features communicate through the shared library (`@/lib/*`), not through direct imports.
- Admin (`features/admin/`) is designed to be extractable to a separate app. Keep admin-specific CSS in `admin.module.css` — never add admin-only classes to `globals.css`.
- The `shell` feature is the exception — it wraps the app root (ThemeProvider, ErrorBoundary) and is consumed by `app/layout.tsx`.

### Database Schema Organization
- One concern per file. Table definitions, RLS policies, and seed data should be in separate files.
- Functions must use `security definer` and `set search_path to ''` to prevent search-path injection.
- All schema changes must have both a `backend/schema/` file and a `supabase/migrations/` timestamped copy.
- Schema files are numbered (`001_init.sql` → `013_sync_infrastructure.sql`). New files go at the end.

### Global CSS Rules
- `globals.css` defines design tokens (colors, spacing, typography, shadows) and shared component classes (`.btn`, `.card`, `.modal`, etc.). Shared classes should be generic and may be used by any feature.
- Feature-specific styles go in `*.module.css`. If a class is only used by one feature, it goes in that feature's module.
- Admin-only global classes (`sidebar`, `modal-overlay`, etc.) are acceptable in globals.css but should be consolidated rather than scattered.
- Undefined CSS custom properties are bugs. Every `var(--name)` must have a matching definition.

### Testing
- SQL tests must wrap in `begin`/`rollback` to prevent data leaks between runs.
- Playwright E2E tests go in `test/e2e/`. Security tests go in `test/security/`.
- Vitest unit tests go in `__tests__/` next to the component being tested.

