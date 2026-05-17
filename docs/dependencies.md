# Auth — Dependencies

> [← Back to Auth README](../README.md)

## Synchronous (Kafka RPC)

| Peer | Patterns |
|------|------------|
| **user** | `user.create`, `user.get_by_email`, `user.get_by_id`, `user.password.verify`, `user.email.mark_verified`, `user.password.update` — **2FA disable** still returns **503** until password re-verify is agreed with user service |
| **notification** | `notification.send-two-factor`, `email.send-mail-confirmation` (request/reply where wired) |

JWT signing, access validation, refresh verification, and password-reset opaque tokens are **in-process** ([`src/token/`](../src/token/)) — no Kafka peer.

## Async

- Domain events emitted via same Kafka client (see [messaging.md](./messaging.md)).

## External

- **PostgreSQL**, **Redis** (see [datastores.md](./datastores.md)).
- **Google OAuth** — future.
