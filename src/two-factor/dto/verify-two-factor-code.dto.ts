import { ApiProperty } from '@nestjs/swagger';

export class VerifyTwoFactorCodeDto {
  @ApiProperty({
    description: 'Six-digit two-factor authentication code',
    example: '654321',
  })
  code: string;
}
