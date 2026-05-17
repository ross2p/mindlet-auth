import { SessionProvider } from '../session-provider.enum';

/** Row written on `Session` create (DB assigns `id`). */
export class CreateSessionRecordDto {
  userId: string;
  refreshTokenHash: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  provider: SessionProvider;
  deviceLabel: string | null;
  timezone: string | null;
  refreshAt: Date;
  expiresAt: Date;
  lastUsedAt: Date;
  twoFactorVerifiedAt?: Date | null;
}
