# Auth service

Trust gate for Mindlet: Guest becomes **User** via register + email verification; login may add a 2FA challenge on the **same Session**; Platform access opens only after unlock. Owns **`Session`** in Postgres; Redis backs verification / 2FA / reset tokens and throttles. User identity + password hash live in the [user service](../user/README.md).

**Status:** **shipped** for auth MVP flows (credentials, verify-email, 2FA challenge, gated refresh, forgot/reset/change-password, sign-out). Google OAuth remains scaffold-only. 2FA **setup** UI is **profile-and-settings** (ADR-0003).

Product contract: [`docs/features/auth/contracts/openapi.yaml`](../../../docs/features/auth/contracts/openapi.yaml).

## How to run

### Prerequisites

- Node.js and npm (aligned with the versions used in this repo).
- **PostgreSQL**, **Redis**, and **Kafka** reachable. The monorepo root [`docker-compose.yml`](../../docker-compose.yml) defines `postgres`, `redis`, `zookeeper`, and `kafka`.

### Environment

From this directory (`apps/auth`):

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `TWO_FACTOR_ENCRYPTION_KEY` (see [docs/configuration.md](docs/configuration.md)).
3. Fill shared variables validated by `@ross2p/common`: `BASE_URL`, `KAFKA_BROKER`, `SWAGGER_USER`, `SWAGGER_PASSWORD`, `SENTRY_DSN`. Set `SERVICE_NAME=AUTH_SERVICE`.
4. Optionally set `PORT` (defaults to **3000**).

### Database (Prisma)

```bash
cd apps/auth
npm install
npm run db:client:generate
npm run db:migrate:dev
```

### Local development

```bash
npm run start:dev
```

### Tests

```bash
npm test -- --testPathPattern=auth-ac-matrix   # mocked AC matrix (no Docker)
AUTH_E2E=1 npm run test:e2e -- --testPathPattern=auth-ac-matrix  # full stack
```

See [test/README.md](test/README.md).

### Docker

From **`mindlet-api`**:

```bash
docker compose up --build auth
```

## Architecture conventions

- `DatabaseService` / `CacheService` only in `*.repository.ts`.
- Every HTTP endpoint has `@ResponseMessage('…')` on **gateway-web**. This app is Kafka-only (ADR-0004).
- Use `@ClientInfo()`, `@IsPublic()`, `checkExists(...)` from `@ross2p/common`.
- TTL / rate-limit constants in `auth-challenge.constants.ts` (+ module re-exports).
- Throttler uses Redis-backed storage (`src/throttling/redis-throttler.storage.ts`) when `REDIS_URL` is set.

## Documentation map

| Topic | File |
|-------|------|
| Entities & ER diagram | [docs/entities.md](docs/entities.md) |
| Product requirements | [docs/product-requirements.md](docs/product-requirements.md) |
| Business logic | [docs/business-logic.md](docs/business-logic.md) |
| HTTP API | [docs/api.md](docs/api.md) |
| Kafka messaging | [docs/messaging.md](docs/messaging.md) |
| Architecture | [docs/architecture.md](docs/architecture.md) |
| Datastores | [docs/datastores.md](docs/datastores.md) |
| Dependencies | [docs/dependencies.md](docs/dependencies.md) |
| Configuration | [docs/configuration.md](docs/configuration.md) |

## Canonical references

- Feature SDD: [`docs/features/auth/`](../../../docs/features/auth/)
- Domain model: [../../../docs/02-domain-model.md](../../../docs/02-domain-model.md)
- Kafka events: [../../docs/kafka-events.md](../../docs/kafka-events.md)
