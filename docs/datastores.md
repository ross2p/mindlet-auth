# Auth — Datastores

> [← Back to Auth README](../README.md)

## PostgreSQL (Prisma)

- **Schema:** [`../prisma/schema.prisma`](../prisma/schema.prisma)
- **Migrations:** [`../prisma/migrations/`](../prisma/migrations/) — initial: `20250510180000_init_auth`
- **Tables:** `sessions`, `two_factor_secrets`, `recovery_codes`

Run locally: `cd apps/auth && npx prisma migrate deploy` (requires `DATABASE_URL`).

## Redis (`CacheService`)

| Key pattern | Purpose |
|-------------|---------|
| `auth:sess:revoked:{sessionId}` | Fast-path revoke flag (TTL ≈ max refresh lifetime). |
| `auth:sess:ver:{userId}` | Monotonic counter; JWT claim `sv` must match when key exists (`SessionCacheRepository`, prefix `auth:sess` + `ver:`). |
| `auth:password-reset:{opaqueToken}` | Forgot-password flow: maps token → `{ email }` (TTL = `PASSWORD_RESET_TTL_SECONDS`). |
| `auth:2fa:challenge:{token}` | Login-time 2FA challenge payload (`userId`, `attempts`, `userAgent`, `ipAddress`). |
| `auth:rl:{route}:{id}` | Optional shared rate-limit buckets (reserved). |

## TODO

- None critical — align Redis TTLs for password-reset tokens with `PASSWORD_RESET_TTL_SECONDS` and refresh JWT lifetime (`JWT_REFRESH_EXPIRES_IN`) in all environments.
