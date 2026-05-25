# Security Audit

## Scope
Full-stack review of the Portfolio project: Next.js 15 frontend, PostgREST/PostgreSQL backend, Supabase auth, Vercel deployment.

## Approach
- Automated: Playwright security test suite (96 tests) running against production
- Manual: Dependency audit, log injection review, PII data flow tracing, CSP validation
- Infrastructure: GitHub Actions pipeline audit, secret scanning, branch protection

## Test Coverage

| Category | Tests | What's verified |
|---|---|---|
| SQL Injection | 8 | Filter abuse, UNION attacks, PostgREST column injection |
| XSS Prevention | 12 | Contact form stores payloads safely, CSP blocks inline scripts |
| JWT Manipulation | 8 | Missing/empty/forged/alg-none/weak-key tokens rejected |
| CORS & Origin | 6 | Preflight, cross-origin POST, header verification |
| Rate Limiting | 4 | Burst limits, concurrent requests, sliding window |
| Auth & Access Control | 8 | Unauthenticated access blocked, role enforcement |
| Request Tampering | 8 | Method override, content-type abuse, empty bodies |
| Information Disclosure | 4 | No stack traces, no directory listing, no internal fields |
| Session Attacks | 4 | Cookie injection, CSRF token validation |

**122 tests total** — 96 security + 26 E2E user flows. All pass against production.

## Key Architecture Decisions

- **PostgREST**: Parameterized queries eliminate SQL injection at the ORM level
- **Row-Level Security**: Every `api.*` table has RLS policies; anon sees only published data
- **CSP**: Nonce-based scripts on pages, `default-src 'none'` on PostgREST (JSON-only API)
- **Markdown**: Custom renderer validates URL schemes (blocks `javascript:`, `data:`, `vbscript:`)
- **Logging**: Caddy logs path-only (no headers/IP). DB logs have PII auto-redacted and control chars stripped. IPs pseudonymized after 7 days.
- **Auth**: JWT-based with dynamic RBAC. Admin route protection via middleware. CSRF tokens on mutations.
