import { ApiProperty } from '@nestjs/swagger';
import type { ForgotPasswordType } from '@ross2p/types';

export class ForgotPasswordDto implements ForgotPasswordType {
  @ApiProperty({
    description: 'Account email to send a password reset link to',
    format: 'email',
  })
  email!: string;
}
