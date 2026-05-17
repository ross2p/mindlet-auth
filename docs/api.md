# Auth — HTTP API

> [← Back to Auth README](../README.md)

HTTP routes are mounted under **`/api/v1/auth`** (global prefix `/api` + URI versioning `v1` from `@ross2p/common`, plus router `path: 'auth'` in [`app.module.ts`](../src/app.module.ts)).

## REST endpoints

| Method | Path | Handler | Auth | Status |
|--------|------|---------|------|--------|
| `POST` | `/api/v1/auth/credentials/login` | [`CredentialsController.login`](../src/credentials/credentials.controller.ts) | Public + throttle | **Implemented** — returns `UserTokensDto` (`is2faEnabled`, short access TTL when verification pending) |
| `POST` | `/api/v1/auth/credentials/register` | [`CredentialsController.register`](../src/credentials/credentials.controller.ts) | Public + throttle | **Implemented** — returns `UserTokensDto`; sends 6-digit email code; emits `SESSION_STARTED` |
| `POST` | `/api/v1/auth/refresh` | [`AuthController.refreshAccessToken`](../src/auth/auth.controller.ts) | Public | **Implemented** — refresh JWT (`id`, `sessionId`, `type`) + DB session + hash check → new access (`TokenPayloadDto`) |
| `POST` | `/api/v1/auth/session/sign-out` | [`SessionController.signOut`](../src/session/session.controller.ts) | `AuthGuard` | **Implemented** |
| `POST` | `/api/v1/auth/session/sign-out-all` | [`SessionController.signOutAll`](../src/session/session.controller.ts) | `AuthGuard` | **Implemented** |
| `GET` | `/api/v1/auth/session` | [`SessionController.listSessions`](../src/session/session.controller.ts) | `AuthGuard` | **Implemented** — `pageNumber`, `pageSize` query |
| `DELETE` | `/api/v1/auth/session/:id` | [`SessionController.deleteSession`](../src/session/session.controller.ts) | `AuthGuard` | **Implemented** |
| `POST` | `/api/v1/auth/forgot-password` | [`PasswordResetController`](../src/password-reset/password-reset.controller.ts) | Public + throttle | **Implemented** — stores reset token in Redis via [`PasswordResetTokenService`](../src/token/password-reset-token/password-reset-token.service.ts); **NOTE:** anti-enumeration incomplete |
| `POST` | `/api/v1/auth/reset-password` | [`PasswordResetController`](../src/password-reset/password-reset.controller.ts) | Public | **Implemented** — consumes reset token → `user.password.update` |
| `POST` | `/api/v1/auth/verify-email/resend-code` | [`EmailVerificationController`](../src/email-verification/email-verification.controller.ts) | `AuthGuard` + throttle | **Implemented** — resends 6-digit code via `email.send-mail-confirmation` |
| `POST` | `/api/v1/auth/verify-email/verify` | [`EmailVerificationController`](../src/email-verification/email-verification.controller.ts) | `AuthGuard` + throttle | **Implemented** — body: 6-digit `code` → `user.email.mark_verified` → new access JWT (`TokenPayloadDto`) |
| `POST` | `/api/v1/auth/2fa/resend-code` | [`TwoFactorController`](../src/two-factor/two-factor.controller.ts) | `AuthGuard` + throttle | **Implemented** — resends login 2FA email code |
| `POST` | `/api/v1/auth/2fa/verify` | [`TwoFactorController`](../src/two-factor/two-factor.controller.ts) | `AuthGuard` + throttle | **Implemented** — body: 6-digit `code` → session `twoFactorVerifiedAt` → new access JWT (`TokenPayloadDto`) |
| `GET` / `POST` | `/api/v1/auth/google/...` | [`GoogleController`](../src/google/google.controller.ts) | TBD | **Scaffold only** |

## DTOs & validation

Imported from **`@ross2p/types`**: `LoginDto`, `CreateUserDto`, `RefreshTokenDto`, `UserTokensDto`, `TokensDto`, `VerifySixDigitCodeDto`, Joi schemas (`loginSchema`, `createUserSchema`, `refreshTokenSchema`, `verifySixDigitCodeSchema`). Local [`GenerateTokensDto`](../src/auth/dto/generate-tokens.dto.ts) supports optional `pendingVerification` (short access TTL). RPC validation for `auth.user.validate` uses local [`accessTokenSchema`](../src/auth/dto/access-token.schema.ts) + [`AccessTokenDto`](../src/auth/dto/access-token.dto.ts).

## Auth & guards

`AuthGuard` / `OptionalAuthGuard` from `@ross2p/common` call Kafka **`auth.user.validate`**. [`AuthService.validateUserByToken`](../src/auth/auth.service.ts) verifies the access JWT, loads the active session from the auth database, checks `session.userId` against the JWT `id`, and returns **`AuthenticatedUser`** (`id`, `email`, `sessionId`, `twoFactorVerifiedAt`, `emailVerifiedAt`).

## TODO

- OpenAPI row links when gateway exposes `/docs` consistently.
- **Google OAuth** — implement under `GoogleModule`.
