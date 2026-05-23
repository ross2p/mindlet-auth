import { ApiProperty } from '@nestjs/swagger';
import type { ResetPasswordType } from '@ross2p/types';

export class ResetPasswordDto implements ResetPasswordType {
  @ApiProperty({
    description: 'Password reset token from the email link',
  })
  token!: string;

  @ApiProperty({
    description: 'New account password',
    example: 'NewP@ssw0rd!',
  })
  newPassword!: string;
}
