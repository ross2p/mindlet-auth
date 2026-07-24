import { ApiProperty } from '@nestjs/swagger';

export class VerifyTwoFactorCodeDto {
  @ApiProperty({
    description: 'Selected 2FA method from the picker',
    enum: ['email', 'totp', 'backup'],
    example: 'email',
  })
  method!: 'email' | 'totp' | 'backup';

  @ApiProperty({
    description: 'OTP or backup code',
    example: '123456',
  })
  code!: string;
}
