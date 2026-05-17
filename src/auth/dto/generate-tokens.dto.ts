import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Payload used to mint a JWT pair (access + refresh). */
export class GenerateTokensDto {
  @ApiProperty({
    description: 'User identifier embedded in JWT',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ description: 'User email embedded in JWT', format: 'email' })
  email: string;

  @ApiProperty({
    description: 'Session identifier embedded in JWT',
    format: 'uuid',
  })
  sessionId: string;

  @ApiPropertyOptional({
    description: 'Two-factor verification instant for the session',
    nullable: true,
    type: String,
    format: 'date-time',
  })
  twoFactorVerifiedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Email verification instant for the user',
    nullable: true,
    type: String,
    format: 'date-time',
  })
  emailVerifiedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Short-lived access token when verification is still pending',
    example: false,
  })
  pendingVerification?: boolean;
}
