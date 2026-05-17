# Auth — Business logic

> [← Back to Auth README](../README.md)

## Use cases (summary)

| Flow | Status |
|------|--------|
| Registration | **Implemented** — `user.create` → in-process `UserTokenService.generateTokens` → Prisma `Session` (+ refresh hash) → emits `SESSION_STARTED`. |
| Login (no 2FA) | **Implemented** — password verify → tokens + session row. |
| Login (2FA on) | **Implemented** — when `user.twoFactorEnabled`, email 6-digit code; `UserTokensDto` with short access TTL until `POST /auth/2fa/verify` (resend: `POST /auth/2fa/resend-code`). |
| Refresh | **Implemented** — verify refresh JWT (`id`, `sessionId`) → load active session from DB → `session.userId` vs JWT `id` → `verifyRefreshTokenHash` (reuse detection) → mint new access via `generateTokens`. |
| Sign-out / sign-out-all / list / revoke session | **Implemented** — `AuthGuard`; sessions revoked in Postgres. |
| Password reset | **Implemented** — forgot-password stores opaque token in Redis (`PasswordResetTokenService`); reset-password consumes token → `user.password.update`. Anti-enumeration incomplete. |
| Email verification | **Implemented** — Redis + `email.send-mail-confirmation`; `POST /auth/verify-email/verify` with `AuthGuard` → `user.email.mark_verified` + new access JWT; resend: `POST /auth/verify-email/resend-code`. |
| 2FA login | **Implemented** — Redis email codes only; `POST /auth/2fa/resend-code` and `POST /auth/2fa/verify` (`user.twoFactorEnabled` on user service). |
| Google OAuth | **Planned** — scaffold only. |

## Invariants

- Password hashing remains in **user** service.
- Refresh token JWT encodes **`id`** (user) and **`sessionId`** only (plus `type: refresh`); session row stores **sha256** of the issued refresh string for rotation / reuse detection.
- `auth.user.validate` returns **`AuthenticatedUser`** from access-token claims after an **active session** exists for `sessionId` and matches `userId` — no extra `user.get_by_id` hop.

## TODO

- **Forgot-password** — swallow failures and always return success (product anti-enumeration); send reset email when account exists.
- **2FA disable** — `user.password.verify` (or equivalent) in user service; auth currently returns **503** until wired.
- **Google OAuth** — account linking rules.
