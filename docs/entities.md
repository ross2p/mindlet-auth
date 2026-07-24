# Auth — Entities & ER

> [← Back to Auth README](../README.md)

> **Reality vs. domain model:** Product identity is **User** (not Account). **`User`** (+ `deletedAt`, `emailVerifiedAt`) lives in the [user service](../../user/README.md). Short-lived JWTs and refresh strings are issued **in-process** by [`src/token/`](../src/token/). **`auth`** persists **`Session`**. Redis holds password-reset tokens, login 2FA codes (by `sessionId`), and email verification codes. 2FA **enabled** flag comes from user settings (`twoFactorEnabled`).

## ER diagram (Postgres — `auth` service)

```mermaid
erDiagram
    Session {
        uuid id PK
        uuid userId FK
        string refreshTokenHash
        enum provider
        string userAgent
        string ipAddress
        string deviceLabel
        string timezone
        datetime refreshAt
        datetime expiresAt
        datetime lastUsedAt
        datetime revokedAt
        string revokedReason
        datetime twoFactorVerifiedAt
        datetime createdAt
    }
    Session }o--|| User : userId
```

`User` is logical-only (FK target in another service). Prisma schema: [`../prisma/schema.prisma`](../prisma/schema.prisma).

## Session

| Field | Storage |
|-------|---------|
| `id` | UUID PK — embedded in JWT as `sid`. |
| `userId` | UUID — `User.id` in **user** service. |
| `refreshTokenHash` | `sha256(refreshToken)` — compared on refresh after in-process refresh JWT verification (`UserTokenService.verifyRefreshToken`). |
| `provider` | `SessionProvider` enum. |
| `userAgent`, `ipAddress`, `deviceLabel`, `timezone` | Strings / optional. |
| `refreshAt`, `expiresAt`, `lastUsedAt`, `createdAt` | Timestamps. |
| `revokedAt`, `revokedReason` | Soft revoke. |
| `twoFactorVerifiedAt` | Set when the user successfully verifies the 6-digit 2FA code for this session (cache-backed flow). |

[`SessionEntity`](../../../libs/types/src/types/session/session.type.ts) mirrors the Prisma `Session` model in `apps/auth/prisma/schema.prisma` (run `prisma generate` in the auth app). List endpoints return rows with `refreshTokenHash` redacted (empty string); a plaintext `refreshToken` is never stored in the DB.

## Two-factor and email verification (not in Postgres)

- **2FA challenge** — `TwoFactorRepository` stores a short-lived 6-digit code and attempt counter in Redis, keyed by **`sessionId`**. Required when `twoFactorEnabled` and `Session.twoFactorVerifiedAt` is null.
- **Email verification** — Redis code; **`User.emailVerifiedAt`** set via `user.email.mark_verified`.

## Cross-context

- **JWT & password-reset tokens** — issued and verified in-process ([`src/token/`](../src/token/)); **access** JWTs carry `id`, `email`, `sessionId`, `twoFactorVerifiedAt`, `emailVerifiedAt`, `type`, and standard `iat`/`exp`. **Refresh** JWTs carry only `id`, `sessionId`, and `type` (`refresh`). Short access TTL applies when `pendingVerification` is set at mint time.
- **User service** — `user.create`, `user.get_by_email`, `user.password.verify`, `user.get_by_id`, `user.email.mark_verified`, `user.password.update` (password reset from auth).
- **Notification service** — `email.send-mail-confirmation`, `notification.send-two-factor`, `email.send-password-reset` (fire-and-forget from `auth`).

## TODO

- **Google OAuth** — non-goal for auth MVP; scaffold only.
