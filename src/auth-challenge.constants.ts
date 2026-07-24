/** Spec §6 NFR — challenge TTLs and rate limits (auth Redis / throttler). */

export const EMAIL_VERIFICATION_CODE_TTL_SECONDS = 30 * 60; // ≤ 30 min
export const PASSWORD_RESET_TTL_SECONDS = 60 * 60; // ≤ 1 hour
export const TWO_FACTOR_CHALLENGE_TTL_SECONDS = 5 * 60; // challenge entry window

export const TWO_FACTOR_MAX_FAILED_ATTEMPTS = 5;
export const TWO_FACTOR_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

export const LOGIN_RATE_LIMIT = {
  limit: 10,
  ttlMs: 15 * 60 * 1000,
} as const;

export const FORGOT_PASSWORD_RATE_LIMIT = {
  limit: 5,
  ttlMs: 15 * 60 * 1000,
} as const;

export function isTwoFactorAttemptsExceeded(attempts: number): boolean {
  return attempts >= TWO_FACTOR_MAX_FAILED_ATTEMPTS;
}
