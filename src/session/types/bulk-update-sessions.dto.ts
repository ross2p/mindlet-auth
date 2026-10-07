/**
 * Patch applied to all active sessions of a user (`updateMany` where `revokedAt` is null).
 */
export type BulkUpdateSessionsDto = {
  revokedAt?: Date | null;
  revokedReason?: string | null;
};
