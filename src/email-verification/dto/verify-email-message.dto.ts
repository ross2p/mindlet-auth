import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailMessageDto {
  @ApiProperty({ description: 'User identifier', format: 'uuid' })
  userId!: string;

  @ApiProperty({ description: 'Session identifier', format: 'uuid' })
  sessionId!: string;

  @ApiProperty({ description: 'Account email', format: 'email' })
  email!: string;

  @ApiProperty({ description: 'Six-digit email verification code' })
  code!: string;
}
