import type { AccessPayload } from "./types";

export type AuthStep = "twoFactor" | "verifyEmail" | "dashboard";

export type AuthGateHints = {
  /** Derived gate from auth API (preferred when present). */
  platformAccessOpen?: boolean;
};

/**
 * Determines the next navigation step after a successful auth action
 * (login, register, 2FA verify, email verify).
 *
 * Prefers `platformAccessOpen` from the API when provided; otherwise mirrors
 * backend Session gates via access-token claims.
 */
export function getNextAuthStep(
  payload: AccessPayload,
  hints: AuthGateHints = {},
): AuthStep {
  if (hints.platformAccessOpen === true) {
    return "dashboard";
  }

  if (payload.twoFactorVerifiedAt == null) {
    return "twoFactor";
  }
  if (payload.emailVerifiedAt == null) {
    return "verifyEmail";
  }
  return "dashboard";
}
