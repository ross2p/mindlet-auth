import type { SessionType } from '@ross2p/types';

export class SessionDto implements SessionType {
  id!: string;

  userId!: string;

  refreshTokenHash!: string | null;

  provider!: SessionType['provider'];

  userAgent!: string | null;

  ipAddress!: string | null;

  deviceLabel!: string | null;

  timezone!: string | null;

  refreshAt!: Date;

  expiresAt!: Date;

  lastUsedAt!: Date;

  revokedAt!: Date | null;

  revokedReason!: string | null;

  createdAt!: Date;

  twoFactorVerifiedAt!: Date | null;
}
