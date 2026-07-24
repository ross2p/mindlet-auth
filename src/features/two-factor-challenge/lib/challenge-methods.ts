export type TwoFactorMethodId = "email" | "totp" | "backup";

export type TwoFactorMethodOption = {
  id: TwoFactorMethodId;
  available: boolean;
};

export type TwoFactorChallengeSnapshot = {
  required: boolean;
  methods: TwoFactorMethodOption[];
};

const STORAGE_KEY = "mindlet.auth.twoFactorChallenge";

const LABELS: Record<TwoFactorMethodId, string> = {
  email: "Email code",
  totp: "Authenticator app",
  backup: "Backup code",
};

export function methodLabel(id: TwoFactorMethodId): string {
  return LABELS[id];
}

export function persistTwoFactorChallenge(
  challenge: TwoFactorChallengeSnapshot | null | undefined,
): void {
  if (typeof window === "undefined") return;
  if (!challenge?.required) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
}

export function readTwoFactorChallenge(): TwoFactorChallengeSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TwoFactorChallengeSnapshot;
  } catch {
    return null;
  }
}

export function defaultChallengeMethods(): TwoFactorMethodOption[] {
  return [
    { id: "email", available: true },
    { id: "totp", available: false },
    { id: "backup", available: false },
  ];
}
