export class CreateSessionDto {
  userId: string;
  accessToken: string;
  refreshToken: string;
  userAgent: string;
  ipAddress: string;
  lastUsedAt: Date;
  expiresAt: Date;
}
