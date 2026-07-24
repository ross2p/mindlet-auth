import {
  EMAIL_VERIFICATION_CODE_TTL_SECONDS,
  PASSWORD_RESET_TTL_SECONDS,
  TWO_FACTOR_MAX_FAILED_ATTEMPTS,
  TWO_FACTOR_ATTEMPT_WINDOW_MS,
  LOGIN_RATE_LIMIT,
  FORGOT_PASSWORD_RATE_LIMIT,
  isTwoFactorAttemptsExceeded,
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
    expect(isTwoFactorAttemptsExceeded(5)).toBe(true);
    expect(isTwoFactorAttemptsExceeded(4)).toBe(false);
  });

  it('exposes request-source rate limits for login and forgot-password', () => {
    expect(LOGIN_RATE_LIMIT).toEqual({ limit: 10, ttlMs: 15 * 60 * 1000 });
    expect(FORGOT_PASSWORD_RATE_LIMIT).toEqual({
      limit: 5,
      ttlMs: 15 * 60 * 1000,
    });
  });
});
