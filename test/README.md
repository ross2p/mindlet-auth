# Auth tests

## Unit / mocked AC matrix

```bash
npm test -- --testPathPattern=auth-ac-matrix
```

Covers AC-01,04,07–14,16–18 at service/util level without Docker.

## HTTP e2e (real stack)

Requires Postgres, Redis, Kafka, and reachable user + notification services.

```bash
export AUTH_E2E=1
export DATABASE_URL=postgresql://...
export REDIS_URL=redis://localhost:6379
# plus JWT secrets / Kafka as in .env.example
npm run test:e2e -- --testPathPattern=auth-ac-matrix
```

When `AUTH_E2E` is unset, the HTTP suite is skipped so local/CI unit jobs stay green.
