# Security Posture

## Encryption In Transit

### Frontend → Browser
- **Local dev**: HTTP via Vite proxy
- **Production**: TLS via Vercel/Cloudflare Pages (free Let's Encrypt certs, auto-renewed)

### Browser → API
- **Local dev**: HTTP via Caddy on `:3001` (localhost, no exposure)
- **Production**: HTTPS via Caddy with automatic Let's Encrypt TLS (TLS 1.2+ only)
  - Strict-Transport-Security: 2 years, include subdomains, preload
  - Strong ciphers (Caddy defaults are secure)
  - HTTP/2 multiplexing

### API → Database
- **Local dev**: Unencrypted within Docker network (localhost only)
- **Production (Supabase)**: TLS enforced on all connections — Supabase rejects non-TLS connections by default

## Encryption At Rest

### Database (Supabase)
- **Full-disk encryption**: Supabase encrypts all data at rest using AES-256
- **Automatic backups**: Encrypted before leaving the datacenter
- **Our responsibility**: Any PII in columns (emails, messages) — consider pgcrypto column-level encryption for production

### Column-Level Encryption (optional, for sensitive data)

For highly sensitive fields like lead messages or contact emails, pgcrypto can encrypt at the column level:

```sql
-- Encrypt on write
insert into api.leads (name, email, message)
values (
  'Alice',
  pgp_sym_encrypt('alice@example.com', current_setting('app.encryption_key')),
  pgp_sym_encrypt('Message content', current_setting('app.encryption_key'))
);

-- Decrypt on read (authorized users only, via security definer function)
create function api.read_lead(lead_id int) returns jsonb
  security definer
  language plpgsql as $$
begin
  return jsonb_build_object(
    'name', name,
    'email', pgp_sym_decrypt(email, current_setting('app.encryption_key')),
    'message', pgp_sym_decrypt(message, current_setting('app.encryption_key'))
  )
  from api.leads where id = lead_id;
end;
$$;
```

This is not currently implemented — only add if the sensitivity of the data warrants the complexity.

## Key Management

### Current Key Inventory

| Key | Location | Access |
|-----|----------|--------|
| `app.jwt_secret` | Docker env + DB config | Dev only, hardcoded |
| JWT signing key | `internal.jwt_secret()` | Dev only |
| Supabase service_role key | GitHub Secrets | CI/CD only |
| Supabase anon key | Frontend `VITE_API_URL` | Public (safe) |

### GitHub Secrets (for pipeline)
Set these in your GitHub repo: Settings → Secrets and variables → Actions:

| Secret | Purpose | Required |
|--------|---------|----------|
| `SUPABASE_DB_URL` | Database connection string | Schema migrations |
| `SUPABASE_URL` | Supabase project URL (anon) | Frontend API calls |
| `SUPABASE_SERVICE_KEY` | Service role key (secret) | Admin operations |
| `CF_API_TOKEN` | Cloudflare API token | Deploy frontend |
| `CF_ACCOUNT_ID` | Cloudflare account ID | Deploy frontend |

### Key Rotation
- JWT secret: Rotate if compromised (Supabase manages theirs)
- Service role key: Rotate periodically via Supabase dashboard
- GitHub Secrets: Update when keys rotate

## TLS Configuration (Caddy)

Caddy automatically provisions and renews Let's Encrypt certificates. Default TLS config is secure:
- TLS 1.2 and 1.3 only
- Strong cipher suites (Caddy defaults meet modern standards)
- HTTP/2 and HTTP/3 (QUIC) support
- Automatic HTTP → HTTPS redirect

To verify your TLS setup:
```bash
# Test TLS version and ciphers
curl -vI https://your-domain.com

# Use SSL Labs test (public domains only)
# https://www.ssllabs.com/ssltest/
```

## Compliance Notes

- **Data minimization**: We only store what's needed (name, email, message for leads)
- **Retention**: Leads can be manually archived/deleted via admin panel
- **Logging**: `internal.request_log` captures API access (admin-only view)
- **Audit**: Schema migrations are versioned in git — every DB change is tracked
