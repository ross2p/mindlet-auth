import { ApiProperty } from '@nestjs/swagger';
import type { VerifyEmailCodeType } from '@ross2p/types';

export class VerifyEmailCodeDto implements VerifyEmailCodeType {
  @ApiProperty({
    description: 'Six-digit email verification code',
    example: '123456',
  })
  code!: string;
}
