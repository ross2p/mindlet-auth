import { ApiProperty } from '@nestjs/swagger';

export class ConfirmTwoFactorEnrollmentDto {
  @ApiProperty({
    description: 'Six-digit code sent to the account email',
    example: '123456',
  })
  code!: string;
}
