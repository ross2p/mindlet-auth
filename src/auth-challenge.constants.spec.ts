import {
  EMAIL_VERIFICATION_CODE_TTL_SECONDS,
  PASSWORD_RESET_TTL_SECONDS,
  TWO_FACTOR_MAX_FAILED_ATTEMPTS,
  TWO_FACTOR_ATTEMPT_WINDOW_MS,
  TWO_FACTOR_ATTEMPT_TTL_SECONDS,
  SESSION_REFRESH_TTL_MS,
  LOGIN_RATE_LIMIT,
  FORGOT_PASSWORD_RATE_LIMIT,
  isTwoFactorAttemptsExceeded,
  sessionExpiresAt,
  twoFactorUserFailKey,
} from './auth-challenge.constants';

describe('auth challenge NFR constants (AC-05/11/15)', () => {
  it('keeps email verification TTL within 30 minutes', () => {
    expect(EMAIL_VERIFICATION_CODE_TTL_SECONDS).toBeLessThanOrEqual(30 * 60);
    expect(EMAIL_VERIFICATION_CODE_TTL_SECONDS).toBeGreaterThan(0);
  });

  it('keeps password-reset TTL within 1 hour', () => {
    expect(PASSWORD_RESET_TTL_SECONDS).toBeLessThanOrEqual(60 * 60);
    expect(PASSWORD_RESET_TTL_SECONDS).toBe(60 * 60);
  });

  it('limits 2FA failures to 5 per 15 minutes per User', () => {
    expect(TWO_FACTOR_MAX_FAILED_ATTEMPTS).toBe(5);
    expect(TWO_FACTOR_ATTEMPT_WINDOW_MS).toBe(15 * 60 * 1000);
    expect(TWO_FACTOR_ATTEMPT_TTL_SECONDS).toBe(15 * 60);
    expect(isTwoFactorAttemptsExceeded(5)).toBe(true);
    expect(isTwoFactorAttemptsExceeded(4)).toBe(false);
    expect(twoFactorUserFailKey('u1')).toBe('fail:u1');
  });

  it('sets Session expiry to Refresh TTL ≤ 30 days (AC-18)', () => {
    const now = new Date('2026-08-29T00:00:00.000Z');
    const expires = sessionExpiresAt(now);
    expect(SESSION_REFRESH_TTL_MS).toBeLessThanOrEqual(
      30 * 24 * 60 * 60 * 1000,
    );
    expect(expires.getTime() - now.getTime()).toBe(SESSION_REFRESH_TTL_MS);
    expect(expires.getTime()).toBeGreaterThan(now.getTime());
  });

  it('exposes request-source rate limits for login and forgot-password', () => {
    expect(LOGIN_RATE_LIMIT).toEqual({ limit: 10, ttlMs: 15 * 60 * 1000 });
    expect(FORGOT_PASSWORD_RATE_LIMIT).toEqual({
      limit: 5,
      ttlMs: 15 * 60 * 1000,
    });
  });
});
