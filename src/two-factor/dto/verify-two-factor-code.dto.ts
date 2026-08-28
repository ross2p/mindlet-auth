import { ApiProperty } from '@nestjs/swagger';
import {
  TWO_FACTOR_METHOD_IDS,
  type VerifyTwoFactorCodeType,
} from '@ross2p/types';

export class VerifyTwoFactorCodeDto implements VerifyTwoFactorCodeType {
  @ApiProperty({
    description: 'Selected 2FA method from the picker',
    enum: TWO_FACTOR_METHOD_IDS,
    example: 'email',
  })
  method!: VerifyTwoFactorCodeType['method'];

  @ApiProperty({
    description: 'OTP or backup code',
    example: '123456',
  })
  code!: string;
}
