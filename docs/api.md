# Auth — HTTP API

> [← Back to Auth README](../README.md)
>
> Product contract: [`docs/features/auth/contracts/openapi.yaml`](../../../../docs/features/auth/contracts/openapi.yaml)

HTTP routes are mounted under **`/api/v1/auth`** (global prefix `/api` + URI versioning `v1` from `@ross2p/common`, plus router `path: 'auth'` in [`app.module.ts`](../src/app.module.ts)).

## REST endpoints

| Method | Path | Handler | Auth | Status |
|--------|------|---------|------|--------|
| `POST` | `/api/v1/auth/credentials/register` | [`CredentialsController`](../src/credentials/credentials.controller.ts) | Public + throttle | **Shipped** — `201` `UserTokensDto` with `platformAccessOpen`, `sessionId`, `twoFactorChallenge: null`; email verify code sent |
| `POST` | `/api/v1/auth/credentials/login` | [`CredentialsController`](../src/credentials/credentials.controller.ts) | Public + login throttle | **Shipped** — `200`; soft-deleted User → unavailable; 2FA → `twoFactorChallenge` picker on **same Session** |
| `POST` | `/api/v1/auth/verify-email/verify` | [`EmailVerificationController`](../src/email-verification/email-verification.controller.ts) | `AuthGuard` + throttle | **Shipped** — marks email verified → new access JWT |
| `POST` | `/api/v1/auth/verify-email/resend-code` | [`EmailVerificationController`](../src/email-verification/email-verification.controller.ts) | `AuthGuard` + throttle | **Shipped** — `204` |
| `GET` | `/api/v1/auth/2fa/methods` | [`TwoFactorController`](../src/two-factor/two-factor.controller.ts) | `AuthGuard` | **Shipped** — `{ methods: [{ id, available }] }`; `409` when challenge not pending |
| `POST` | `/api/v1/auth/2fa/verify` | [`TwoFactorController`](../src/two-factor/two-factor.controller.ts) | `AuthGuard` + throttle | **Shipped** — body `{ method, code }`; sets `Session.twoFactorVerifiedAt` |
| `POST` | `/api/v1/auth/2fa/resend-code` | [`TwoFactorController`](../src/two-factor/two-factor.controller.ts) | `AuthGuard` + throttle | **Shipped** — `204` |
| `POST` | `/api/v1/auth/refresh` | [`AuthController`](../src/auth/auth.controller.ts) | Public | **Shipped** — gated until email+2FA unlock (`403` `auth.refresh_blocked_pending_challenge`); AC-18 after unlock |
| `POST` | `/api/v1/auth/forgot-password` | [`PasswordResetController`](../src/password-reset/password-reset.controller.ts) | Public + throttle | **Shipped** — `204` always (anti-enumeration); email only if active User exists |
| `POST` | `/api/v1/auth/reset-password` | [`PasswordResetController`](../src/password-reset/password-reset.controller.ts) | Public + throttle | **Shipped** — `204`; accepts `password` or `newPassword`; **revokes all Sessions** |
| `POST` | `/api/v1/auth/change-password` | [`PasswordResetController`](../src/password-reset/password-reset.controller.ts) | `AuthGuard` | **Shipped** — `204`; revoke-all; optional step-up 2FA |
| `POST` | `/api/v1/auth/change-password/request-2fa` | [`PasswordResetController`](../src/password-reset/password-reset.controller.ts) | `AuthGuard` | **Shipped** — `204` step-up code |
| `POST` | `/api/v1/auth/session/sign-out` | [`SessionController`](../src/session/session.controller.ts) | `AuthGuard` | **Shipped** — `204`; current Session only |
| `POST` | `/api/v1/auth/session/sign-out-all` | [`SessionController`](../src/session/session.controller.ts) | `AuthGuard` | **Shipped** — `204` |
| `GET` | `/api/v1/auth/session` | [`SessionController`](../src/session/session.controller.ts) | `AuthGuard` | **As-built** — list sessions (UI ownership → profile-and-settings, ADR-0003) |
| `DELETE` | `/api/v1/auth/session/:id` | [`SessionController`](../src/session/session.controller.ts) | `AuthGuard` | **As-built** — revoke one session (same boundary) |
| `GET` / `POST` | `/api/v1/auth/google/...` | [`GoogleController`](../src/google/google.controller.ts) | TBD | **Scaffold only** — out of auth MVP scope |

## Response notes

- Login/register still return nested token envelopes (`accessToken.token`, …) for as-built FE; OpenAPI documents string JWTs as the target shape (see contract `AsBuiltTokenPayload`).
- Machine-readable auth errors use `{ code, message }` bodies where wired (`AuthErrorCode`, e.g. refresh gate / reset / change-password).

## Auth & guards

`AuthGuard` / `OptionalAuthGuard` from `@ross2p/common` call Kafka **`auth.user.validate`**. [`AuthService.validateUserByToken`](../src/auth/auth.service.ts) verifies the access JWT, loads the active session, checks `session.userId` vs JWT `id`, and returns **`AuthenticatedUser`**.

## Profile boundary (ADR-0003)

Auth owns identity, login challenges, reset/sign-out/change-password. Enabling 2FA methods, backup codes, and session-management UI live in **profile-and-settings** — not this service’s product UI.

## Tests

See [`test/README.md`](../test/README.md) — mocked AC matrix always; HTTP e2e behind `AUTH_E2E=1`.
