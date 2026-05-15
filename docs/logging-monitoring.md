# Logging & Monitoring Architecture

## Pipeline Overview

```
Browser
  │  ErrorBoundary captures JS errors (sanitized)
  │  POST /api/error  →  Next.js stdout (Docker/Vercel logs)
  │
  ▼
Caddy (reverse proxy)
  │  JSON access log  →  /var/log/caddy/api.log (rotated 10MB x 10)
  │  Fields: method, path, status, duration, remote_ip, user_agent, ...
  │  Rate-limit violations auto-logged
  │
  ▼
PostgREST
  │  Calls internal.before_request() before each query
  │
  ▼
PostgreSQL
  │  internal.request_log  —  method, path, role, user_uuid, ip, user_agent, timestamp
  │  internal.error_log    —  error_code, sanitized error_msg, context, timestamp
  │  api.health()          —  uptime, active connections, errors_last_hour
  │  api.metrics()         —  full analytics (admin only)
```

## What Gets Logged Where

### Caddy access log (`/var/log/caddy/api.log`)
- **Every HTTP request**: method, path, status code, duration, client IP, user-agent
- **Rate limit events**: automatic 429 responses logged
- **Format**: JSON (one object per line — compatible with log aggregators)
- **Rotation**: 10MB per file, 10 files kept, 30-day retention
- **NOT logged**: Request bodies, Authorization headers, cookies

### Database `internal.request_log`
- **Every PostgREST request**: method, path, role, user_uuid, ip_address, user_agent
- **Populated by**: `internal.before_request()` (called by PostgREST pre-request hook)
- **Queryable via**: `GET /rpc/metrics` (requires admin JWT)
- **Retention**: 90 days (auto-purged by `internal.cleanup_logs()`)
- **NOT logged**: Request bodies, query parameters, JWT tokens

### Database `internal.error_log`
- **DB-level exceptions**: error_code, sanitized message, function context
- **Populated by**: Explicit calls to `internal.log_error()` from triggers/functions
- **Sanitization**: Emails → `[EMAIL]`, JWTs → `[JWT]`, PII → `[REDACTED]`
- **Retention**: 180 days (auto-purged by `internal.cleanup_logs()`)

### Frontend Error Reporting
- **JS errors** caught by `<ErrorBoundary>` component
- **Sent to**: `POST /api/error` (Next.js route handler)
- **Data sent**: error UUID, error name, message (truncated to 200 chars), component name, URL
- **NOT sent**: Stack traces, form data, localStorage contents, cookies

## How to Query Logs

### Local Dev (Docker)
```bash
# Caddy access log
docker compose exec caddy cat /var/log/caddy/api.log

# DB request log (last 100 requests)
docker compose exec db psql -U app -d app \
  -c "SELECT method, path, role, ip_address, created_at FROM internal.request_log ORDER BY created_at DESC LIMIT 100"

# DB errors (last 24 hours)
docker compose exec db psql -U app -d app \
  -c "SELECT error_code, error_msg, context, created_at FROM internal.error_log WHERE created_at > now() - interval '24 hours' ORDER BY created_at DESC"

# Health check
curl http://localhost:3001/rpc/health
```

### Production (Supabase)
```bash
# Health check
curl https://your-project.supabase.co/rest/v1/rpc/health

# Metrics (requires auth)
curl https://your-project.supabase.co/rest/v1/rpc/metrics \
  -H "Authorization: Bearer <jwt>"

# DB errors (via SQL editor in Supabase dashboard)
SELECT * FROM internal.error_log ORDER BY created_at DESC LIMIT 50;
```

### Frontend Errors (Vercel)
```bash
# Via Vercel dashboard → Logs → filter: "frontend_error"
# Or via Vercel CLI:
vercel logs --filter "frontend_error"
```

## Monitoring Endpoints

| Endpoint | Access | Response |
|---|---|---|
| `GET /rpc/health` | Public | `{status, db_time, uptime_seconds, active_connections, errors_last_hour, last_error_at, version}` |
| `GET /rpc/metrics` | Admin only | `{requests, errors, top_endpoints, roles_breakdown, recent_errors, generated_at}` |
| `GET /admin/metrics` | Admin UI | Web dashboard rendering the metrics RPC |

## Setting Up External Monitoring

### UptimeRobot / BetterStack (recommended)
1. Point at `GET https://your-api-domain/rpc/health`
2. Expect HTTP 200 and JSON field `status: "ok"`
3. Check every 60 seconds
4. Alert on: 3 consecutive failures OR `errors_last_hour > 50`

### Grafana + Loki (self-hosted)
1. Ship Caddy JSON logs to Loki via Promtail
2. Ship PostgREST stdout logs to Loki via Docker logging driver
3. Dashboard panels:
   - Request rate (req/s)
   - P50/P95/P99 latency
   - Error rate (4xx + 5xx / total)
   - Rate-limit hits
   - DB error count

### Vercel Analytics
1. Enable in Vercel dashboard for:
   - Core Web Vitals (LCP, INP, CLS)
   - Page views and unique visitors
   - JS error tracking

## Alerting Rules (Recommended)

| Condition | Threshold | Action |
|---|---|---|
| Health check fails | 3 consecutive | Notify (email/Slack) |
| Error rate spike | >50 errors/hour | Investigate error_log table |
| Rate limit hits | >20 in 5 minutes | Check for abuse |
| DB connections | >80% of max | Scale or optimize queries |
| 5xx responses | >10 in 5 minutes | Check Caddy + DB logs |
| Auth failures | >10 in 5 minutes | Possible brute-force |

## Data Retention

| Log | Retention | Purge |
|---|---|---|
| Caddy access log | 30 days | File rotation (10MB × 10 files) |
| DB request_log | 90 days | `internal.cleanup_logs()` |
| DB error_log | 180 days | `internal.cleanup_logs()` |
| Vercel logs | Varies by plan | Vercel dashboard |

## Run Cleanup
```bash
# Manually trigger log cleanup (or set up pg_cron)
docker compose exec db psql -U app -d app -c "SELECT internal.cleanup_logs()"
```
