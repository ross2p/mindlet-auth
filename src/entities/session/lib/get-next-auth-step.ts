import type { AccessPayload } from "./types";

export type AuthStep = "twoFactor" | "verifyEmail" | "dashboard";

/**
 * Determines the next navigation step after a successful auth action
 * (login, 2FA verify, email verify) based on the access token payload.
 *
 * Logic mirrors the backend (credentials.service.ts):
 *  - twoFactorVerifiedAt is null  → 2FA challenge is pending
 *  - emailVerifiedAt is null      → email verification is pending
 *  - both present                 → user is fully authenticated → dashboard
 */
export function getNextAuthStep(payload: AccessPayload): AuthStep {
  if (payload.twoFactorVerifiedAt == null) {
    return "twoFactor";
  }
  if (payload.emailVerifiedAt == null) {
    return "verifyEmail";
  }
  return "dashboard";
}
