# ADR-001: Slack Integration for Lead Management

## Status
Accepted

## Date
2026-05-17

## Context
The portfolio contact form sends submissions to a Supabase database. I needed a way to:
- Receive real-time notifications when someone submits the form
- View and manage leads without logging into the admin dashboard
- Handle GDPR/CCPA deletion requests with audit trail
- Keep the integration lightweight (no additional services, no monthly costs)

## Decision
Integrate Slack as the lead management interface using a Slack App with slash commands, interactive messages, and incoming webhooks.

### Architecture
```
Contact Form → /api/leads → PostgREST INSERT
                           → /api/slack/contact → Slack channel notification

Slack /leads → /api/slack/commands → PostgREST RPC (list_leads) → Slack Block Kit response

Slack button click → /api/slack/interactions → PostgREST RPC (update_lead_status / delete_lead_by_id)

GDPR deletion → /api/leads/delete → PostgREST RPC (delete_leads_by_email)
                                  → /api/slack/delete → Slack notification
```

### Database layer
PostgreSQL functions use `SECURITY DEFINER` to allow the `anon` role to query, update, and delete leads via RPC calls. This avoids storing a service_role key in the frontend codebase.

- `api.list_leads(text, int)` — query leads with optional status filter
- `api.update_lead_status(int, text)` — mark lead as read/replied
- `api.delete_lead_by_id(int)` — delete a single lead
- `api.delete_leads_by_email(text)` — GDPR bulk deletion

### Security
- Slack signing secret verification (HMAC-SHA256) on all Slack-facing endpoints
- Replay attack prevention (5-minute timestamp window)
- Turnstile CAPTCHA on GDPR deletion endpoint
- Rate limiting via existing middleware (15/min contact form, 30/min admin mutations)

## Alternatives Considered

### Email Notifications
- Pros: No additional integration, simple
- Cons: No interactive management, clutter inbox, no audit trail of lead status changes

### Admin Dashboard Only
- Pros: Already exists, no new work
- Cons: Requires logging in, no mobile-friendly quick view, no real-time push

### Webhook-Only Slack
- Pros: Simple, no bot token needed
- Cons: One-way only, no interactive management, plain text only

### Dedicated CRM (HubSpot, Pipedrive, etc.)
- Pros: Full-featured
- Cons: Monthly cost, overkill for a portfolio site, data residency concerns

## Consequences
- Slack is the primary lead management interface alongside the admin dashboard
- `@slack/bolt` dependency added (97 transitive dependencies, ~2MB unpacked)
- Four new API routes in Next.js (all under `/api/slack/`)
- One new GDPR deletion route (`/api/leads/delete`)
- Three new PostgreSQL functions (migration `20260517000000_slack_functions.sql`)
- Self-service deletion form on `/privacy` page
- Slack request signing verification utility (`lib/slack-verify.ts`)
- Bot token, signing secret, and app ID managed as Vercel environment variables
