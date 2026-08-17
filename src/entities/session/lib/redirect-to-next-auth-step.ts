import { routes } from "@ross2p/shared";
import { decodeAccessToken } from "./decode-access-token";
import {
  getNextAuthStep,
  type AuthGateHints,
  type AuthStep,
} from "./get-next-auth-step";

const STEP_HREF: Record<AuthStep, string> = {
  twoFactor: routes.twoFactor,
  verifyEmail: routes.verifyEmail,
  dashboard: routes.dashboard,
};

/**
 * Sends the browser to the next auth gate after a successful auth action.
 * Used by login, registration, 2FA verify, and email verify.
 */
export function redirectToNextAuthStep(
  token: string,
  hints: AuthGateHints = {},
  fallback: AuthStep = "dashboard",
): void {
  if (typeof window === "undefined") return;
  const payload = decodeAccessToken(token);
  const step = payload ? getNextAuthStep(payload, hints) : fallback;
  window.location.href = STEP_HREF[step];
}
