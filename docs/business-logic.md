# Auth — Business logic

> [← Back to Auth README](../README.md)

## Use cases (summary)

| Flow | Status |
|------|--------|
| Registration | **Shipped** — `user.create` → one `Session` → email verify code; `platformAccessOpen: false` until verify |
| Email verification | **Shipped** — Redis code + `email.send-mail-confirmation`; unlock on same Session |
| Login (no 2FA) | **Shipped** — password verify → Session; soft-delete → sign-in unavailable |
| Login (2FA on) | **Shipped** — same Session; `twoFactorChallenge` picker; `GET /2fa/methods`; verify unlocks |
| Refresh | **Shipped** — blocked until email+2FA unlock (`auth.refresh_blocked_pending_challenge`); allowed after unlock |
| Sign-out / sign-out-all | **Shipped** — current vs all Sessions revoked in Postgres |
| Password reset | **Shipped** — anti-enumeration forgot `204`; reset revoke-all |
| Change password | **Shipped** — current password (+ step-up 2FA if enabled); revoke-all |
| 2FA enrollment (setup) | **As-built APIs** — product UI out of scope (profile-and-settings, ADR-0003) |
| Google OAuth | **Scaffold only** — non-goal for auth MVP |

## Invariants

- Identity entity is **User** (not Account). Soft-delete via `User.deletedAt` blocks sign-in / forgot email.
- Password hashing remains in **user** service (`user.password.verify` / `user.password.update`).
- One Session per register/login; challenges do **not** recreate Session (ADR-0002).
- Platform access is derived: `emailVerifiedAt` set **and** (2FA off **or** `Session.twoFactorVerifiedAt` set) **and** `revokedAt` null.
- Refresh JWT encodes `id` + `sessionId` (+ `type: refresh`); session row stores sha256 of refresh for reuse detection.
- Rate limits: login / forgot by request source; 2FA fails ≤5 / 15 min per User (Redis counters + Nest throttler with Redis storage).

## TODO

- Flatten token response to OpenAPI string JWTs when FE zone fully migrates.
- Notification handler for `email.send-password-reset` (auth already fires the command).
- Google OAuth — out of MVP.
