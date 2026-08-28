import { ApiProperty } from '@nestjs/swagger';
import type { ForgotPasswordType } from '@ross2p/types';

export class ForgotPasswordDto implements ForgotPasswordType {
  @ApiProperty({
    description: 'Account email to send a password reset link to',
    format: 'email',
    example: 'user-a1b2@example.test',
  })
  email!: string;
}
