import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Session } from '.prisma/client-auth';
import { SessionProvider } from './session-provider.enum';

/**
 * Active session row shape used across the auth service layer.
 * Mirrors Prisma `Session` — keep fields aligned with `prisma/schema.prisma`.
 */
export class SessionEntity implements Session {
  @ApiProperty({ description: 'Session identifier', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Owning user identifier', format: 'uuid' })
  userId: string;

  @ApiPropertyOptional({
    description: 'SHA-256 hash of the issued refresh token when tracked',
    nullable: true,
  })
  refreshTokenHash: string | null;

  @ApiProperty({
    description: 'How this session was created',
    enum: SessionProvider,
  })
  provider: SessionProvider;

  @ApiPropertyOptional({
    description: 'Raw user agent string observed at creation',
    nullable: true,
  })
  userAgent: string | null;

  @ApiPropertyOptional({
    description: 'Client IP observed at creation',
    nullable: true,
  })
  ipAddress: string | null;

  @ApiPropertyOptional({
    description: 'Human-friendly device label when known',
    nullable: true,
  })
  deviceLabel: string | null;

  @ApiPropertyOptional({
    description: 'IANA timezone hint from the client',
    nullable: true,
  })
  timezone: string | null;

  @ApiProperty({
    description: 'When the refresh token was last rotated',
    type: String,
    format: 'date-time',
  })
  refreshAt: Date;

  @ApiProperty({
    description: 'When the session expires if not revoked sooner',
    type: String,
    format: 'date-time',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Last time this session was used successfully',
    type: String,
    format: 'date-time',
  })
  lastUsedAt: Date;

  @ApiPropertyOptional({
    description: 'When the session was revoked, if ever',
    nullable: true,
    type: String,
    format: 'date-time',
  })
  revokedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Reason recorded when the session was revoked',
    nullable: true,
  })
  revokedReason: string | null;

  @ApiProperty({
    description: 'Row creation timestamp',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'When two-factor was satisfied for this session',
    nullable: true,
    type: String,
    format: 'date-time',
  })
  twoFactorVerifiedAt: Date | null;
}
