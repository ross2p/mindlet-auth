/**
 * Cached email verification challenge stored in Redis.
 */
export interface EmailVerificationCodePayload {
  code: string;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}
