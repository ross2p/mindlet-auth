import { ApiProperty } from '@nestjs/swagger';

export class ConfirmTwoFactorMessageDto {
  @ApiProperty({ description: 'User identifier', format: 'uuid' })
  userId!: string;

  @ApiProperty({ description: 'Six-digit code sent to the account email' })
  code!: string;
}
