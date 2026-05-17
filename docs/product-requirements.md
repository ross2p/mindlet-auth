# Auth — Product requirements

> [← Back to Auth README](../README.md)

## Source

Canonical product spec (Ukrainian): [01-auth.md](../../../../docs/features/01-auth.md).

This file **mirrors** that spec in English for developers working on `auth`. The feature doc is authoritative for UX copy, edge cases, and open questions; do not duplicate full field lists here.

## User scenarios

- As a **new user**, I want to sign up with email + password so I can use the platform.
- As a **new user**, I want to **verify my email** so my account is activated.
- As a **registered user**, I want to **sign in** with email + password.
- As a user who **forgot my password**, I want to reset it via a link sent to my email.
- As a **security-conscious user**, I want to enable **2FA (TOTP)** (e.g. Google Authenticator / Authy).
- As a user, I want to **stay signed in** for a long time using a **refresh token** (e.g. httpOnly cookie) without re-entering my password every time.
- As a user, I want to see **active sessions** and **sign out of other devices** (or all devices).
- *(Future)* As a user, I want to sign in with **Google / GitHub** (OAuth).

## UX requirements

**Routes** (from spec §3):

| Route | Purpose |
|-------|---------|
| `/auth/sign-up` | Registration form. |
| `/auth/sign-in` | Login. |
| `/auth/verify-email?token=...` | Email verification landing. |
| `/auth/forgot-password` | Request password reset. |
| `/auth/reset-password?token=...` | Set new password. |
| `/auth/2fa/setup` | 2FA setup (QR + confirmation code). |
| `/auth/2fa/challenge` | Enter TOTP after password when 2FA is on. |
| `/settings/security` | Sessions list, 2FA management, recovery codes. |

**Behaviour** (from spec §4, high level):

- **Rate limits** — e.g. sign-up by IP (5 / 15 min); sign-in by email + IP (10 / 15 min).
- **Unverified email** — while `email_verified_at` is null, restrict publishing courses, payments, team invites; allow learning. Show a dashboard banner until verified.
- **Forgot password** — always return **200** whether the email exists (**anti-enumeration**); only send mail when the account exists.
- **Refresh** — full refresh rotation; optional short grace window for parallel tabs.
- **Sign-out** — revoke current refresh; **sign-out-all** revokes all refreshes for the user (e.g. after password change).

## Out of scope

Per [01-auth.md §9](../../../../docs/features/01-auth.md):

- **SSO** (SAML / OIDC) — later iteration.
- **Magic link** (passwordless) — out of scope.
- **SMS 2FA** — explicitly not built (cost + weaker security).
- **Merging duplicate accounts** — out of scope.

## TODO

- Keep this file in sync when `01-auth.md` changes (especially §4 flows and §8 Kafka event names).
- **Google OAuth** — when implemented, add concrete UX copy and route list here (or in `01-auth.md` first, then mirror).
