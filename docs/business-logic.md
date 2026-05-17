# Auth — Business logic

> [← Back to Auth README](../README.md)

## Use cases (summary)

| Flow | Status |
|------|--------|
| Registration | **Implemented** — `user.create` → in-process `UserTokenService.generateTokens` with `sid`/`sv` → Prisma `Session` → emits `SESSION_STARTED`. |
| Login (no 2FA) | **Implemented** — password verify → tokens + session row. |
| Login (2FA on) | **Implemented** — when `user.twoFactorEnabled`, email 6-digit code; `UserTokensDto` with short access TTL until `POST /auth/2fa/verify` (resend: `POST /auth/2fa/resend-code`). |
| Refresh | **Implemented** — `UserTokenService.verifyRefreshToken` → DB session by `sid` → `sha256` compare → reuse revokes all sessions → `UserTokenService.generateTokens` (access TTL from `pendingVerification` + session `twoFactorVerifiedAt`). |
| Sign-out / sign-out-all / list / revoke session | **Implemented** — `AuthGuard`; sign-out-all bumps Redis session version (`auth:sess:ver:{userId}`). |
| Password reset | **Implemented** — forgot-password stores opaque token in Redis (`PasswordResetTokenService`); reset-password consumes token → `user.password.update`. Anti-enumeration incomplete. |
| Email verification | **Implemented** — Redis + `email.send-mail-confirmation`; `POST /auth/verify-email/verify` with `AuthGuard` → `user.email.mark_verified` + new access JWT; resend: `POST /auth/verify-email/resend-code`. |
| 2FA login | **Implemented** — Redis email codes only; `POST /auth/2fa/resend-code` and `POST /auth/2fa/verify` (`user.twoFactorEnabled` on user service). |
| Google OAuth | **Planned** — scaffold only. |

## Invariants

- Password hashing remains in **user** service.
- Refresh token **must** include `sid` (session id) for rotation binding (`UserTokenService` + [`SessionService`](../src/session/session.service.ts)).
- `sv` on JWT must match Redis `auth:sess:ver:{userId}` when that key is set ([`UserValidatorService`](../src/user-validator/user-validator.service.ts)).

## TODO

- **Forgot-password** — swallow failures and always return success (product anti-enumeration); send reset email when account exists.
- **2FA disable** — `user.password.verify` (or equivalent) in user service; auth currently returns **503** until wired.
- **Google OAuth** — account linking rules.
