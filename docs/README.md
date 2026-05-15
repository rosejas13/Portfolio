# Documentation

## Application docs

| Doc | Description |
|---|---|
| [domain-and-sprints.md](domain-and-sprints.md) | Domain configuration, branch strategy, CI/CD workflow |
| [supabase-setup.md](supabase-setup.md) | Supabase project configuration and RLS policy guidance |

## Security & Operations

| Doc | Description |
|---|---|
| [security-posture.md](security-posture.md) | Encryption, key management, TLS, compliance notes |
| [security-audit.md](security-audit.md) | Full security audit findings and mitigations |
| [logging-monitoring.md](logging-monitoring.md) | Logging pipeline, monitoring endpoints, alerting setup |

## Architecture Notes

This project uses a database-as-the-server architecture:

- **Frontend**: Next.js 15 (React 19)
- **API layer**: PostgREST (auto-generates REST API from PostgreSQL schema)
- **Database**: PostgreSQL 16
- **Reverse proxy**: Caddy (TLS, CORS, security headers)
- **Auth**: Custom JWT (dev) / Supabase Auth (production)
- **Orchestration**: Gas City agents for CI/CD and content management

For local development, everything runs in Docker Compose. For production, the frontend deploys to Vercel and the database runs on Supabase.
