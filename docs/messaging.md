# Auth — Kafka messaging

> [← Back to Auth README](../README.md)

## Inbound (this service consumes)

| Pattern | Handler |
|---------|---------|
| `auth.user.validate` | [`UserValidatorController`](../src/user-validator/user-validator.controller.ts) → `SessionCacheRepository` fast-path + `UserQuery.GET_BY_ID` |

## In-process (no Kafka)

JWT issuance, access-token validation, refresh verification, and password-reset opaque tokens live inside the auth process ([`src/token/`](../src/token/)) via `UserTokenService` and `PasswordResetTokenService` — there is no separate token microservice.

## Outbound RPC (request / reply)

Patterns are referenced via enums from `@ross2p/common` where applicable:

| Enum | Pattern | Peer | Used for |
|------|---------|------|----------|
| `notification.send-two-factor` | `notification.send-two-factor` | notification | Deliver 6-digit login 2FA code. |
| `email.send-mail-confirmation` | `email.send-mail-confirmation` | notification | Deliver 6-digit email verification code. |
| `UserQuery.GET_BY_EMAIL` | `user.get_by_email` | user | Login lookup. |
| `UserQuery.GET_BY_ID` | `user.get_by_id` | user | Token validation + 2FA user load. |
| `UserMessage.CREATE` | `user.create` | user | Register new user. |
| `UserMessage.VERIFY_PASSWORD` | `user.password.verify` | user | Login password check. |
| `UserPrivateMessage.UPDATE` | `user.password.update` | user | Password reset (new password). |
| `UserMessage.EMAIL_MARK_VERIFIED` | `user.email.mark_verified` | user | Mark email as verified after 6-digit code verification. |

## Outbound events (fire-and-forget)

Events are emitted inline from each owning module via `ClientService.emitEvent(AuthEvent.X, payload)`. Enum values live in `@ross2p/common/events`:

| Enum | Topic | Emitter | When |
|------|-------|---------|------|
| `AuthEvent.SESSION_STARTED` | `auth.session.started` | `AuthService` | Login / register / OAuth |
| `AuthEvent.SESSION_ENDED` | `auth.session.ended` | `SessionController` | sign-out / revoke |
| `AuthEvent.ACCOUNT_EMAIL_VERIFIED` | `auth.account.email.verified` | `EmailVerificationService` | Email verified after 6-digit code |

The enum `AuthEvent.ACCOUNT_TWO_FACTOR_ENABLED` still exists in `@ross2p/common` for compatibility but is **not emitted** by the current cache-only 2FA flow.

> **Auth sends no emails.** The `user` service emits `UserEvent.CREATED` (`user.created`) when a user is created; a future notification service subscribes to that topic.

## AuthGuard sequence

1. `UserTokenService.validateAccessToken` → `UserPayload` (`id`, `sessionId`, …).
2. `SessionCacheRepository.getSessionVersion(userId)` — if cached ver ≠ `sv` → `401 session-revoked`.
3. `SessionCacheRepository.isRevoked(sessionId)` — if key exists → `401 session-revoked`.
4. `UserQuery.GET_BY_ID` → `UserEntity`.
5. `UserValidatorService` augments entity with `sessionId` + `sessionVersion` (rides on `request.user`).
6. `@CurrentSessionId()` extracts `request.user.sessionId` in controllers that need it.
