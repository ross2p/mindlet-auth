/** Payload used to mint a JWT pair (access + refresh). */
export type GenerateTokensDto = {
  id: string;
  email: string;
  sessionId: string;
  twoFactorVerifiedAt: Date | null;
  emailVerifiedAt: Date | null;
  pendingVerification?: boolean;
};
