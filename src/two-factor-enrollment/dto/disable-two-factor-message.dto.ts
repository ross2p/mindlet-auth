import { ApiProperty } from '@nestjs/swagger';

export class DisableTwoFactorMessageDto {
  @ApiProperty({ description: 'User identifier', format: 'uuid' })
  userId!: string;

  @ApiProperty({ description: 'Current account password' })
  password!: string;
}
