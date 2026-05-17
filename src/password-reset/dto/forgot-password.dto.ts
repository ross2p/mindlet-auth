import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Account email to send a password reset link to',
    format: 'email',
  })
  email: string;
}
