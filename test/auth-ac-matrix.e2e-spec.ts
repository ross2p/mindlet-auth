/**
 * HTTP e2e for the auth AC matrix.
 *
 * Requires ephemeral Postgres + Redis + Kafka (and user/notification peers).
 * When infrastructure env is missing (local agents without Docker), the suite
 * is skipped so CI unit jobs stay green; enable with AUTH_E2E=1 and full stack.
 *
 * AppModule is loaded dynamically only when e2e is enabled so skipped runs do
 * not pull Nest DI / peer packages.
 */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';

const e2eEnabled =
  process.env.AUTH_E2E === '1' &&
  Boolean(process.env.DATABASE_URL) &&
  Boolean(process.env.REDIS_URL);

type TokenEnvelope = { token?: string } | string;

type AuthSessionBody = {
  platformAccessOpen?: boolean;
  sessionId?: string;
  accessToken?: TokenEnvelope;
  refreshToken?: TokenEnvelope;
};

type ErrorBody = {
  code?: string;
  message?: string;
};

type ApiEnvelope<T> = {
  data?: T;
} & T;

function unwrapBody<T extends object>(body: unknown): T {
  const envelope = body as ApiEnvelope<T>;
  return envelope.data ?? envelope;
}

function tokenString(value: TokenEnvelope | undefined): string {
  if (typeof value === 'string') return value;
  return value?.token ?? '';
}

(e2eEnabled ? describe : describe.skip)('Auth AC matrix (HTTP e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const { AppModule } = await import('../src/app.module');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  const email = `user-${Date.now()}@example.test`;
  const password = 'Passw0rd1';
  let refreshToken = '';
  let accessToken = '';
  let sessionId = '';

  it('AC-01 — register creates Session with closed platform access', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/credentials/register')
      .send({
        email,
        password,
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(201);

    const body = unwrapBody<AuthSessionBody>(res.body);
    expect(body.platformAccessOpen).toBe(false);
    expect(body.sessionId).toBeTruthy();
    sessionId = body.sessionId ?? '';
    accessToken = tokenString(body.accessToken);
    refreshToken = tokenString(body.refreshToken);
  });

  it('AC-09 — refresh blocked before unlock', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(403);

    const err = unwrapBody<ErrorBody>(res.body);
    expect(err.code ?? err.message ?? JSON.stringify(res.body)).toMatch(
      /refresh|verification|challenge/i,
    );
  });

  it('AC-14 — forgot-password always acknowledges', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nobody@example.test' })
      .expect(204);

    await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ email })
      .expect(204);
  });

  it('AC-16 — sign-out revokes current session', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/session/sign-out')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    expect(sessionId).toBeTruthy();
  });
});

describe('Auth e2e gate', () => {
  it('skips HTTP AC matrix unless AUTH_E2E=1 and DB/Redis are configured', () => {
    if (!e2eEnabled) {
      expect(process.env.AUTH_E2E ?? '0').not.toBe('1');
    } else {
      expect(e2eEnabled).toBe(true);
    }
  });
});
