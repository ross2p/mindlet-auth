import { ApiProperty } from '@nestjs/swagger';

export class SessionIdentityDto {
  @ApiProperty({ description: 'Owning user identifier', format: 'uuid' })
  userId!: string;

  @ApiProperty({ description: 'Session identifier', format: 'uuid' })
  sessionId!: string;
}
