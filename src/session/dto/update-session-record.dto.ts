import { SessionProvider } from '../session-provider.enum';

/** Single-session Prisma `update` data (omit keys you do not want to change). */
export class UpdateSessionRecordDto {
  lastUsedAt?: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
  provider?: SessionProvider;
  refreshAt?: Date;
  expiresAt?: Date;
  revokedAt?: Date | null;
  revokedReason?: string | null;
  refreshTokenHash?: string | null;
  twoFactorVerifiedAt?: Date | null;
}
