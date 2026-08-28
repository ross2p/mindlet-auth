import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorSessionMessageDto {
  @ApiProperty({ description: 'User identifier', format: 'uuid' })
  userId!: string;

  @ApiProperty({ description: 'Session identifier', format: 'uuid' })
  sessionId!: string;
}
