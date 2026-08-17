import type {
  TwoFactorChallengeType,
  TwoFactorMethodId,
  TwoFactorMethodType,
} from "@ross2p/types";

export type { TwoFactorMethodId, TwoFactorChallengeType };
export type TwoFactorMethodOption = TwoFactorMethodType;
export type TwoFactorChallengeSnapshot = TwoFactorChallengeType;

const STORAGE_KEY = "mindlet.auth.twoFactorChallenge";

const LABELS: Record<TwoFactorMethodId, string> = {
  email: "Email",
  totp: "Authenticator",
  backup: "Backup",
};

export function methodLabel(id: TwoFactorMethodId): string {
  return LABELS[id];
}

export function persistTwoFactorChallenge(
  challenge: TwoFactorChallengeType | null | undefined,
): void {
  if (typeof window === "undefined") return;
  if (!challenge?.required) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
}

export function readTwoFactorChallenge(): TwoFactorChallengeType | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TwoFactorChallengeType;
  } catch {
    return null;
  }
}

export function defaultChallengeMethods(): TwoFactorMethodType[] {
  return [
    { id: "email", available: true },
    { id: "totp", available: false },
    { id: "backup", available: false },
  ];
}
