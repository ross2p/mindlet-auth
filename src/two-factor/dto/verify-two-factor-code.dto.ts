import { ApiProperty } from '@nestjs/swagger';
import type { VerifyTwoFactorCodeType } from '@ross2p/types';

export class VerifyTwoFactorCodeDto implements VerifyTwoFactorCodeType {
  @ApiProperty({
    description: 'Six-digit two-factor authentication code',
    example: '654321',
  })
  code!: string;
}
