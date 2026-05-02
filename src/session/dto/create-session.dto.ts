import { SessionProvider } from '@ross2p/database';

export class CreateSessionDto {
  userId: string;
  refreshToken: string;
  userAgent: string;
  ipAddress: string;
  provider: SessionProvider;
  refreshAt: Date;
  expiresAt: Date;
  lastUsedAt?: Date;
}
