import { ApiProperty } from '@nestjs/swagger';
import { ChangePasswordDto } from './change-password.dto';

export class ChangePasswordMessageDto extends ChangePasswordDto {
  @ApiProperty({ description: 'User identifier', format: 'uuid' })
  userId!: string;

  @ApiProperty({ description: 'Session identifier', format: 'uuid' })
  sessionId!: string;
}
