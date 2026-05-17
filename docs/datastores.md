# Auth — Datastores

> [← Back to Auth README](../README.md)

## PostgreSQL (Prisma)

- **Schema:** [`../prisma/schema.prisma`](../prisma/schema.prisma)
- **Migrations:** [`../prisma/migrations/`](../prisma/migrations/) — initial: `20250510180000_init_auth`
- **Tables:** `sessions`, `two_factor_secrets`, `recovery_codes`

Run locally: `cd apps/auth && npx prisma migrate deploy` (requires `DATABASE_URL`).

## Redis (`CacheService`)

Per-feature `CacheModule.forFeature({ prefix, defaultTtlSeconds })` namespaces keys. Examples:

| Prefix | Purpose |
|--------|---------|
| `auth:2fa:*` | Login-time 2FA: 6-digit code + attempts per `sessionId` (`TwoFactorModule`). |
| `auth:email-verify:*` | Email verification: 6-digit code per flow (`EmailVerificationModule`). |
| `auth:password-reset:*` | Opaque forgot-password tokens → email (`TokenModule` / `PasswordResetTokenService`). |

Session lifecycle (active / revoked / refresh hash) is enforced in **Postgres** on the `Session` row — not via a separate Redis session index in the current code.

## TODO

- Align Redis TTLs for password-reset tokens with `PASSWORD_RESET_TTL_SECONDS` and refresh JWT lifetime (`JWT_REFRESH_EXPIRES_IN`) in all environments.
