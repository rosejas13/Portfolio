# Security Audit Report

**Date**: 2026-05-15  
**Scope**: Full-stack security review of `all-in-pg` portfolio project  

---

## Summary

| Category | Finding | Severity | Status |
|---|---|---|---|
| Auth | JWT secret hardcoded in docker-compose.yml and DB init | Critical | Fixed |
| Auth | Token stored in localStorage (XSS-readable) | Critical | Fixed (HttpOnly cookie) |
| Auth | Admin auth check was client-side only (no server-side validation) | High | Fixed (middleware) |
| CORS | Wildcard origin reflection (`*` allowed any domain) | High | Fixed (locked to app origin) |
| Error Handling | Server error details exposed to frontend console/UI | High | Fixed (generic messages) |
| Rate Limiting | No rate limiting on login endpoint or contact form | High | Fixed (Caddy rate_limit) |
| CSRF | No CSRF protection on state-changing requests | High | Fixed (CSRF token + headers) |
| Input Validation | No email format validation on leads | Medium | Fixed (DB constraint) |
| Input Validation | No URL format validation on project URLs | Medium | Fixed (DB constraint) |
| Input Validation | No slug format validation | Medium | Fixed (DB constraint) |
| CSP | `unsafe-inline` on style-src, no script-src directive | Medium | Fixed |
| Testing | No security tests existed | High | Added |
| Docs | Security posture doc was outdated | Low | Updated |

---

## 1. Authentication

### Before
- JWT stored in `localStorage` — readable by any JavaScript (XSS vulnerability)
- `login_dev()` endpoint had no rate limiting
- Admin pages only checked localStorage (no server-side validation)
- JWT secret was hardcoded in plaintext in both `docker-compose.yml` and `001_init.sql`
- No cookie-based session management

### After
- **HttpOnly cookies**: JWT stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookie — inaccessible to JavaScript
- **Server-side auth**: Next.js middleware validates cookie before rendering admin pages
- **Rate-limited login**: Caddy rate limits `/rpc/login_dev` to 10 req/min
- **Environment variable**: JWT secret reads from `${JWT_SECRET}` env var in docker-compose
- **Server-side login/logout**: `/api/auth/login` and `/api/auth/logout` route handlers manage cookie lifecycle
- **Session check**: `/api/auth/me` endpoint returns user info from cookie

### Architecture
```
Browser                          Next.js Server              PostgREST
  │                                   │                          │
  │ POST /api/auth/login              │                          │
  │──────────────────────────────────►│ POST /rpc/login_dev      │
  │                                   │─────────────────────────►│
  │                                   │ ◄─── JWT token           │
  │ ◄── Set-Cookie: token (HttpOnly)  │                          │
  │                                   │                          │
  │ GET /api/projects                 │                          │
  │ Cookie: token                     │                          │
  │──────────────────────────────────►│                          │
  │  middleware reads cookie           │                          │
  │  injects Authorization header      │ GET /projects            │
  │                                   │ Authorization: Bearer JWT│
  │                                   │─────────────────────────►│
  │ ◄─────────────────────────────────│ ◄─── data                │
```

---

## 2. CORS & Security Headers

### Before
- `Access-Control-Allow-Origin` reflected the request's `Origin` header — any domain could access the API
- `Content-Security-Policy` allowed `unsafe-inline` for styles
- No `X-XSS-Protection` header
- `Server` header leaked Caddy version

### After
- **Origin locked**: CORS allows only `http://localhost:5173` (dev) and `https://jcrose.dev` (prod)
- **Credentials**: `Access-Control-Allow-Credentials: true` with CSRF token enforcement
- **CSP tightened**: Removed `unsafe-inline`, added `script-src 'self'` and `connect-src 'self'`
- **X-XSS-Protection**: Set to `0` (modern browsers handle this; CSP is the real protection)
- **Server header**: Suppressed (`-Server`)
- **Rate limit headers**: Exposed for transparency

### Headers sent on every response
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
X-XSS-Protection: 0
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Content-Security-Policy: default-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; script-src 'self'; connect-src 'self'
```

---

## 3. Error Handling

### Before
- PostgREST errors exposed full SQL error details to the client:
  ```
  message: "new row violates row-level security policy"
  detail: "policy 'anon_insert_leads' for table 'leads'"
  hint: "check source and status fields"
  ```
- These errors appeared in the browser console AND UI

### After
- **Generic error messages** based on HTTP status code:
  - `401/403` → "Unauthorized"
  - `429` → "Too many requests. Please try again later."
  - `5xx` → "Server error. Please try again later."
  - `4xx` → "Request failed. Please try again."
- No database internals (table names, policy names, SQL fragments) are ever sent to the frontend
- **Verified by test**: `api-client-security.test.ts` confirms error messages never contain "row-level", "policy", or table names

---

## 4. CSRF Protection

### Before
- No CSRF protection on any state-changing requests
- Contact form, admin CRUD operations — all vulnerable to CSRF

### After
- **CSRF token**: `X-CSRF-Token` header with `crypto.randomUUID()` value, stored in `sessionStorage`
- **X-Requested-With header**: `XMLHttpRequest` — prevents cross-origin form submissions
- **SameSite=Strict cookies**: Prevents cookie attachment on cross-site requests
- **CORS restricted**: Only app origins can make requests

---

## 5. Rate Limiting

### Before
- No rate limiting on any endpoint
- `/rpc/login_dev` could be brute-forced
- `/leads` POST endpoint could be spammed

### After
- **Login**: 10 requests/minute for `/rpc/login_dev`
- **Contact form**: 5 POSTs/minute to `/leads`
- **General**: 100 requests/minute global limit
- **Caddy-based**: Rate limiting happens at the reverse proxy level

---

## 6. Input Validation

### Database-level constraints
| Table | Column | Constraint |
|---|---|---|
| leads | email | Format: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` |
| leads | name | Max 200 chars, not empty |
| leads | message | Max 5000 chars |
| projects | title | Max 200 chars, not empty |
| projects | slug | Max 200 chars, format: `/^[a-z0-9]+(-[a-z0-9]+)*$/` |
| projects | tagline | Max 300 chars |
| projects | live_url | URL format: `/^https?://...$/` |
| projects | repo_url | URL format |
| projects | image_url | URL format |
| posts | title | Max 300 chars, not empty |
| posts | slug | Max 200 chars, format: lowercase alphanumeric + hyphens |

### Frontend-level validation
- Contact form: `maxLength` attributes on inputs, `trim().slice()` sanitization
- Admin forms: HTML5 validation on required fields

---

## 7. SQL Injection Prevention

PostgREST uses parameterized queries for all database operations. Querystring parameters are passed as bind variables, never interpolated into SQL strings. Example:

```
GET /projects?title=eq.DROP TABLE users;--  
```

PostgREST treats `DROP TABLE users;--` as a literal string value for the `title` filter — it's never executed as SQL. This is architectural protection.

**Verified**: PostgREST does not construct dynamic SQL from user input. All filtering, sorting, and pagination use PostgreSQL's query planner with parameterized values.

---

## 8. Row-Level Security (RLS)

### Role hierarchy
| Role | Access | Scope |
|---|---|---|
| `anon` | Read published content, insert leads | Public pages |
| `viewer` (Supabase) | Read published + leads | Authenticated read-only |
| `collaborator` | CRUD projects, skills, posts, experiences, education; read leads | Content manager |
| `admin` / `web_admin` | Full access including site_config, users, permissions | Site owner |
| `web_agent` | Create + read projects, skills, posts | Gas City agents |

### Key RLS policies
- `anon` can only `SELECT` projects/posts with `status = 'published'`
- `anon` can only `INSERT` leads with `source = 'contact_form' AND status = 'new'`
- `anon` has NO access to `site_config` table — must use `api.get_site_config()` RPC
- Authenticated users governed by dynamic RBAC via `internal.has_permission()`
- UUID-based user identification prevents ID enumeration

---

## 9. Supply Chain & Secrets

### In `.gitignore`
- `.env`, `.env.local` — environment variables with secrets
- `.gc/`, `.beads/`, `.runtime/` — Gas City runtime state
- `.next/`, `dist/` — build output
- `*.log` — log files
- `checklist.md` — personal checklist

### Secret inventory
| Secret | Storage | Rotation |
|---|---|---|
| JWT secret | Docker env var `${JWT_SECRET}` | Manual rotation |
| Supabase service key | GitHub Secrets | Supabase dashboard |
| Supabase anon key | Frontend env var | Public (safe) |

---

## 10. Test Coverage

### Frontend security tests (`frontend/test/`)
- `api-client-security.test.ts` — 5 tests verifying:
  - Generic "Unauthorized" for 401
  - Generic "Unauthorized" for 403
  - Generic rate-limit message for 429
  - Generic server error for 500
  - No DB internals leaked in error messages

### Backend security tests (`backend/tests/security.sql`)
- 11 test sections covering:
  - RLS: anon read restrictions on projects
  - RLS: anon insert restrictions on leads
  - RLS: anon delete prevention
  - Auth: admin full access verification
  - Input validation: email format
  - Input validation: slug format
  - Input validation: length limits
  - Auth: login_dev disabled in prod mode

### Run tests
```bash
# Frontend
cd frontend && npm test

# Backend (requires running Docker stack)
docker compose exec db psql -U app -d app -f backend/tests/security.sql
```

---

## 11. Recommendations (Pending)

1. **Add `__Host-` cookie prefix**: Prevents cookie injection from subdomains
2. **Rotate JWT secret in production**: The dev secret is known
3. **Add WAF**: Cloudflare or similar for production DDoS protection
4. **Implement audit logging in `internal.before_request()`**: Currently a no-op
5. **Monitor `internal.request_log`**: Set up alerting for suspicious patterns
6. **Add column-level encryption**: For lead emails/messages using pgcrypto
7. **GitHub Dependabot**: Enable for automated dependency vulnerability alerts
