import { SessionProvider } from '../session-provider.enum';

export class CreateSessionDto {
  userId: string;
  userAgent: string | null;
  ipAddress: string | null;
  provider: SessionProvider;
  refreshAt: Date;
  expiresAt: Date;
  lastUsedAt?: Date;
  deviceLabel?: string;
  timezone?: string;
  twoFactorVerifiedAt?: Date | null;
}
