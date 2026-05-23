import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UserPayload } from '@ross2p/types';

export class UserPayloadDto implements UserPayload {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'email' })
  email!: string;

  @ApiProperty({ format: 'uuid' })
  sessionId!: string;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
  twoFactorVerifiedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
  emailVerifiedAt!: Date | null;

  @ApiProperty({ enum: ['access', 'refresh'] })
  type!: 'access' | 'refresh';

  @ApiPropertyOptional()
  iat?: number;

  @ApiPropertyOptional()
  exp?: number;
}
