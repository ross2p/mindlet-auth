import { ApiProperty } from '@nestjs/swagger';
import {
  TWO_FACTOR_METHOD_IDS,
  type VerifyTwoFactorCodeType,
} from '@ross2p/types';

export class VerifyTwoFactorMessageDto implements VerifyTwoFactorCodeType {
  @ApiProperty({ description: 'User identifier', format: 'uuid' })
  userId!: string;

  @ApiProperty({ description: 'Session identifier', format: 'uuid' })
  sessionId!: string;

  @ApiProperty({
    description: 'Selected 2FA method from the picker',
    enum: TWO_FACTOR_METHOD_IDS,
  })
  method!: VerifyTwoFactorCodeType['method'];

  @ApiProperty({ description: 'OTP or backup code' })
  code!: string;
}
