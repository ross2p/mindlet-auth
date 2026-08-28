import { ApiProperty } from '@nestjs/swagger';

export class SessionIdMessageDto {
  @ApiProperty({ description: 'Session identifier', format: 'uuid' })
  sessionId!: string;
}
