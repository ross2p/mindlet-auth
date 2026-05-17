# Auth service

Authenticates users (email + password, refresh, JWT validation for other services). Owns **`Session`** in Postgres (`DatabaseService`). Redis (`CacheService` via per-module `CacheModule.forFeature(...)`) backs session revocation, user session version (`sess_ver`), email verification codes, login 2FA email codes, and **password-reset opaque tokens**. The user record (email, password hash, **`twoFactorEnabled`**) lives in the [user service](../user/README.md). **JWT issuance, verification, and password-reset tokens** live in-process under [`src/token/`](src/token/) (`UserTokenService`, `PasswordResetTokenService`).

**Status:** **implemented** (core flows) — DatabaseService (Prisma), per-module CacheService, session CRUD, refresh with `sid`/`sessionId`/`sv` claims, email 2FA + email verification via Redis + notification, password reset via Redis-backed tokens. Google OAuth remains scaffold-only.

## How to run

### Prerequisites

- Node.js and npm (aligned with the versions used in this repo).
- **PostgreSQL**, **Redis**, and **Kafka** reachable from your machine. The monorepo root [`docker-compose.yml`](../../docker-compose.yml) defines `postgres`, `redis`, `zookeeper`, and `kafka` you can start as dependencies.

### Environment

From this directory (`apps/auth`):

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `TWO_FACTOR_ENCRYPTION_KEY` (see [docs/configuration.md](docs/configuration.md)).
3. Fill shared variables validated by `@ross2p/common`: `BASE_URL`, `KAFKA_BROKER`, `SWAGGER_USER`, `SWAGGER_PASSWORD`, `SENTRY_DSN`. Set `SERVICE_NAME=AUTH_SERVICE` so the Kafka client identifies this process as the auth service.
4. Optionally set `PORT` (defaults to **3000** if unset). If `kafka-ui` from Compose is bound to host port **3000**, pick another port (for example `PORT=3002`) to avoid a clash.

When infrastructure runs via Docker Compose on **localhost**, typical values are:

- `DATABASE_URL=postgresql://mindlet:mindlet@localhost:5432/mindlet` (adjust user/password/db if you changed Compose env defaults).
- `REDIS_URL=redis://localhost:6379`
- `KAFKA_BROKER=localhost:9092`
- `BASE_URL=http://localhost:<PORT>` — use the same host/port as `PORT`.

### Database (Prisma)

```bash
cd apps/auth
npm install
npm run prisma:generate
npm run prisma:migrate:dev
```

Run these from the **`mindlet-api/apps/auth`** directory after `DATABASE_URL` is set.

### Local development (Nest)

```bash
cd apps/auth
npm run start:dev
```

Other scripts: `npm run start` (no watch), `npm run start:debug`, production `npm run build` then `npm run start:prod`.

### Docker (auth container only)

From the **`mindlet-api`** directory (where `docker-compose.yml` lives):

```bash
docker compose up --build auth
```

The service is published on host port **3002** (container listens on **3000**). Compose starts Kafka, Postgres, and Redis as dependencies of `auth`.

### Dependencies only (Nest on host, infra in Docker)

From **`mindlet-api`**:

```bash
docker compose up -d zookeeper kafka postgres redis
```

Then run `npm run start:dev` in `apps/auth` with the localhost URLs above.

## Architecture conventions

- `DatabaseService` and `CacheService` are injected **only into `*.repository.ts`** files — never into services (enforced by `repository-only-data-access` Cursor rule).
- Every HTTP endpoint has `@ResponseMessage('…')` (enforced by `response-message-on-endpoints` Cursor rule).
- Use `@ClientInfo()` for IP/UA extraction, `@IsPublic()` for public endpoints, `checkExists(...)` for null guards — all from `@ross2p/common` (enforced by `use-common-helpers` Cursor rule).
- TTL constants live in `*.constants.ts` files within each module — not in env vars.
- Domain events are emitted inline via `ClientService.emitEvent(AuthEvent.X, payload)` — no wrapper `EventsService`. Auth sends no emails.

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

- Cross-service catalog: `mindlet-api/docs/services.md`
- Domain model: [../../../docs/02-domain-model.md](../../../docs/02-domain-model.md)
- Roles & permissions: [../../../docs/03-roles-and-permissions.md](../../../docs/03-roles-and-permissions.md)
- Kafka events catalog: [../../docs/kafka-events.md](../../docs/kafka-events.md)
- Product feature(s): [01-auth.md](../../../docs/features/01-auth.md)

## Implementation pointers

- **DatabaseService:** `database/database.service.ts` extends `PrismaClient` from `.prisma/client-auth`.
- **Prisma schema:** [`prisma/schema.prisma`](prisma/schema.prisma) — `Session.id` uses `@default(uuid())` (DB-generated).
- **Token payloads:** include both `sid` (JWT compat) and `sessionId` (application code). `UserValidatorService` augments `request.user` with `sessionId` + `sessionVersion` after token validation.
- **Cursor rules:** `.cursor/rules/` — `repository-only-data-access.mdc`, `response-message-on-endpoints.mdc`, `use-common-helpers.mdc`.
