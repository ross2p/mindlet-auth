# Auth — Configuration

> [← Back to Auth README](../README.md)

See [`../.env.example`](../.env.example) and [`../../docker-compose.yml`](../../docker-compose.yml) `auth` service.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection for `DatabaseService` |
| `REDIS_URL` | Redis connection for `CacheService` |
| `JWT_ACCESS_SECRET` | Secret for signing access JWTs ([`UserAccessTokenModule`](../src/token/user-token/user-access-token.module.ts)) |
| `JWT_ACCESS_EXPIRES_IN` | Access JWT TTL (default `15m`) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh JWTs ([`UserRefreshTokenModule`](../src/token/user-token/user-refresh-token.module.ts)) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh JWT TTL (default `7d`) |
| `TWO_FACTOR_ENCRYPTION_KEY` | Base64 **32-byte** key for AES-256-GCM (required secret) |
| `TWO_FACTOR_ISSUER` | TOTP issuer label (default `Mindlet`) |

**TTL constants are now hardcoded per module** — they are no longer env vars:

| Constant | Location | Value |
|----------|----------|-------|
| `SESSION_REFRESH_TTL_SECONDS` | `session/session.constants.ts` | 30 days |
| `TWO_FACTOR_CHALLENGE_TTL_SECONDS` | `two-factor/two-factor.constants.ts` | 5 minutes |
| `PASSWORD_RESET_TTL_SECONDS` | `password-reset/password-reset.constants.ts` | 1 hour |
| `EMAIL_VERIFICATION_TTL_SECONDS` | `email-verification/email-verification.constants.ts` | 24 hours |

## TODO

- Add production checklist for `TWO_FACTOR_ENCRYPTION_KEY` rotation.
